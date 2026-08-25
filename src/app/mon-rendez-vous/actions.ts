"use server";

import { prisma } from "@/lib/prisma";
import { getCreneauxDisponibles } from "@/lib/creneaux";
import { getFermetures } from "@/lib/fermetures";
import { normaliserCode } from "@/lib/codeReservation";
import {
  MESSAGE_HORS_DELAI,
  peutEtreModifie,
} from "@/lib/delaiModification";
import {
  chargerRendezVousEmail,
  notifierRdvDeplace,
  notifierRdvSupprime,
  notifierSalonRdvDeplace,
  notifierSalonRdvSupprime,
} from "@/lib/notifications";

function normaliserTelephone(telephone: string): string {
  return telephone.replace(/[\s.\-]/g, "");
}

export type RendezVousCliente = {
  code: string;
  statut: string;
  dateDebutISO: string;
  dateFinISO: string;
  modifiable: boolean;
  client: { prenom: string; nom: string };
  prestations: { nom: string; longueur: string | null }[];
};

/**
 * Retrouve un rendez-vous à partir du couple téléphone + code. Les deux doivent
 * correspondre : le code seul ne suffit pas, le téléphone seul non plus.
 */
async function chargerRendezVous(telephone: string, code: string) {
  const rendezVous = await prisma.rendezVous.findUnique({
    where: { code: normaliserCode(code) },
    include: {
      client: true,
      prestations: { include: { prestation: true }, orderBy: { ordre: "asc" } },
    },
  });

  if (!rendezVous) return null;
  if (rendezVous.client.telephone !== normaliserTelephone(telephone)) return null;
  return rendezVous;
}

function versVue(rendezVous: NonNullable<Awaited<ReturnType<typeof chargerRendezVous>>>): RendezVousCliente {
  return {
    code: rendezVous.code ?? "",
    statut: rendezVous.statut,
    dateDebutISO: rendezVous.dateDebut.toISOString(),
    dateFinISO: rendezVous.dateFin.toISOString(),
    modifiable:
      peutEtreModifie(rendezVous.dateDebut) &&
      rendezVous.statut !== "ANNULE" &&
      rendezVous.statut !== "TERMINE",
    client: { prenom: rendezVous.client.prenom, nom: rendezVous.client.nom },
    prestations: rendezVous.prestations.map((p) => ({
      nom: p.prestation.nom,
      longueur: p.longueur,
    })),
  };
}

export async function chercherRendezVousAction(telephone: string, code: string) {
  if (!telephone.trim() || !code.trim()) {
    return { ok: false as const, error: "Merci de renseigner le téléphone et le code." };
  }

  const rendezVous = await chargerRendezVous(telephone, code);
  if (!rendezVous) {
    return {
      ok: false as const,
      error: "Aucun rendez-vous ne correspond à ce téléphone et à ce code.",
    };
  }

  return { ok: true as const, rendezVous: versVue(rendezVous) };
}

export async function annulerRendezVousClienteAction(telephone: string, code: string) {
  const rendezVous = await chargerRendezVous(telephone, code);
  if (!rendezVous) {
    return { ok: false as const, error: "Rendez-vous introuvable." };
  }

  if (rendezVous.statut === "ANNULE") {
    return { ok: false as const, error: "Ce rendez-vous est déjà annulé." };
  }

  // Contrôle refait ici : ne jamais se fier au seul état de l'interface.
  if (!peutEtreModifie(rendezVous.dateDebut)) {
    return { ok: false as const, error: MESSAGE_HORS_DELAI };
  }

  await prisma.rendezVous.update({
    where: { id: rendezVous.id },
    data: { statut: "ANNULE" },
  });

  const rdvFull = await chargerRendezVousEmail(rendezVous.id);
  if (rdvFull) {
    await notifierRdvSupprime(rdvFull);
    await notifierSalonRdvSupprime(rdvFull);
  }

  return { ok: true as const };
}

/** Créneaux libres un jour donné, à durée de prestation inchangée. */
export async function getCreneauxPourDeplacementAction(
  telephone: string,
  code: string,
  dateISO: string,
) {
  const rendezVous = await chargerRendezVous(telephone, code);
  if (!rendezVous) return [];
  if (!peutEtreModifie(rendezVous.dateDebut)) return [];

  const dureeMinutes =
    (rendezVous.dateFin.getTime() - rendezVous.dateDebut.getTime()) / 60000;

  const date = new Date(dateISO);
  const debutJournee = new Date(date);
  debutJournee.setHours(0, 0, 0, 0);
  const finJournee = new Date(date);
  finJournee.setHours(23, 59, 59, 999);

  const [occupes, fermetures] = await Promise.all([
    prisma.rendezVous.findMany({
      where: {
        dateDebut: { gte: debutJournee, lte: finJournee },
        statut: { in: ["CONFIRME", "EN_ATTENTE"] },
        id: { not: rendezVous.id },
      },
      select: { dateDebut: true, dateFin: true },
    }),
    getFermetures(date, date),
  ]);

  return getCreneauxDisponibles({
    date,
    dureeTotaleMinutes: dureeMinutes,
    rendezVousExistants: occupes,
    fermetures,
  }).map((d) => d.toISOString());
}

export async function deplacerRendezVousClienteAction(
  telephone: string,
  code: string,
  nouveauDebutISO: string,
) {
  const rendezVous = await chargerRendezVous(telephone, code);
  if (!rendezVous) {
    return { ok: false as const, error: "Rendez-vous introuvable." };
  }

  if (!peutEtreModifie(rendezVous.dateDebut)) {
    return { ok: false as const, error: MESSAGE_HORS_DELAI };
  }

  const dureeMs = rendezVous.dateFin.getTime() - rendezVous.dateDebut.getTime();
  const nouveauDebut = new Date(nouveauDebutISO);
  const ancienneDateDebut = rendezVous.dateDebut;

  // Le nouveau créneau doit lui aussi respecter le délai de 24 h.
  if (!peutEtreModifie(nouveauDebut)) {
    return {
      ok: false as const,
      error: "Merci de choisir un créneau situé à plus de 24 h.",
    };
  }

  // Revérifie que le créneau est toujours libre au moment de valider.
  const creneaux = await getCreneauxPourDeplacementAction(telephone, code, nouveauDebutISO);
  if (!creneaux.includes(nouveauDebut.toISOString())) {
    return {
      ok: false as const,
      error: "Ce créneau vient d'être pris. Merci d'en choisir un autre.",
    };
  }

  await prisma.rendezVous.update({
    where: { id: rendezVous.id },
    data: {
      dateDebut: nouveauDebut,
      dateFin: new Date(nouveauDebut.getTime() + dureeMs),
    },
  });

  const rdvFull = await chargerRendezVousEmail(rendezVous.id);
  if (rdvFull) {
    await notifierRdvDeplace(rdvFull, ancienneDateDebut);
    await notifierSalonRdvDeplace(rdvFull, ancienneDateDebut);
  }

  const recharge = await chargerRendezVous(telephone, code);
  return { ok: true as const, rendezVous: recharge ? versVue(recharge) : null };
}
