"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { creneauEstLibre, getCreneauxDisponibles } from "@/lib/creneaux";
import { getFermetures } from "@/lib/fermetures";
import { estJourAutorisePourPrestations } from "@/lib/reglesCreneaux";
import { calculerTotalAvecOptions } from "@/lib/prestations";
import {
  construireDonneesPrestations,
  resoudreLignes,
  type LigneChoisie,
} from "@/lib/reservationLignes";
import {
  notifierDemandeAcceptee,
  notifierDemandeRefusee,
  notifierRdvCreeParAdmin,
  notifierRdvDeplace,
  notifierRdvModifie,
  notifierRdvSupprime,
} from "@/lib/notifications";

const COOKIE_NAME = "namaste_admin";
const INCLUDE_COMPLET = {
  client: true,
  prestations: {
    include: {
      prestation: { include: { variantesLongueur: true } },
      options: { include: { option: { include: { variantesLongueur: true } } } },
    },
  },
} as const;

function normaliserTelephone(telephone: string): string {
  return telephone.replace(/[\s.\-]/g, "");
}

export async function loginAdminAction(motDePasse: string) {
  if (motDePasse !== process.env.ADMIN_PASSWORD) {
    return { ok: false as const, error: "Mot de passe incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, motDePasse, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return { ok: true as const };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function getDemandesEnAttente() {
  return prisma.rendezVous.findMany({
    where: { statut: "EN_ATTENTE" },
    include: INCLUDE_COMPLET,
    orderBy: { createdAt: "asc" },
  });
}

export async function getRendezVousConfirmes() {
  const debut = new Date(new Date().setHours(0, 0, 0, 0));
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 90);

  return prisma.rendezVous.findMany({
    where: { statut: "CONFIRME", dateDebut: { gte: debut, lte: fin } },
    include: INCLUDE_COMPLET,
    orderBy: { dateDebut: "asc" },
  });
}

/**
 * Un numéro peut désormais correspondre à plusieurs fiches (proches partageant
 * une ligne fixe), d'où un findFirst et non un findUnique.
 */
export async function chercherClientParTelephoneAction(telephone: string) {
  return prisma.client.findFirst({
    where: { telephone: normaliserTelephone(telephone) },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Recherche une cliente par nom ou prénom, dans n'importe quel ordre :
 * « marie », « dupont » ou « marie dupont » trouvent la même personne.
 * Plusieurs homonymes peuvent remonter, d'où une liste et non un résultat unique.
 */
export async function chercherClientsParNomAction(recherche: string) {
  const termes = recherche.trim().split(/\s+/).filter(Boolean);
  if (termes.length === 0) return [];

  return prisma.client.findMany({
    where: {
      AND: termes.map((terme) => ({
        OR: [
          { prenom: { contains: terme, mode: "insensitive" as const } },
          { nom: { contains: terme, mode: "insensitive" as const } },
        ],
      })),
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    take: 10,
  });
}

export async function getCreneauxAdminAction(
  dateISO: string,
  lignes: LigneChoisie[],
  excludeRendezVousId?: string,
) {
  if (lignes.length === 0) return [];

  const { prestations, lignesResolues, lissageMatrice } = await resoudreLignes(lignes);
  if (prestations.length === 0) return [];

  const date = new Date(dateISO);
  const { dureeTotaleAvecNettoyage } = calculerTotalAvecOptions(lignesResolues, lissageMatrice);
  const debutJournee = new Date(date);
  debutJournee.setHours(0, 0, 0, 0);
  const finJournee = new Date(date);
  finJournee.setHours(23, 59, 59, 999);

  const [rendezVousExistants, fermetures] = await Promise.all([
    prisma.rendezVous.findMany({
      where: {
        dateDebut: { gte: debutJournee, lte: finJournee },
        statut: { in: ["CONFIRME", "EN_ATTENTE"] },
        ...(excludeRendezVousId ? { id: { not: excludeRendezVousId } } : {}),
      },
      select: { dateDebut: true, dateFin: true },
    }),
    getFermetures(date, date),
  ]);

  return getCreneauxDisponibles({
    date,
    dureeTotaleMinutes: dureeTotaleAvecNettoyage,
    prestations,
    rendezVousExistants,
    fermetures,
    estAdmin: true,
  }).map((d) => d.toISOString());
}

export async function accepterDemandeAction(rendezVousId: string) {
  const rdv = await prisma.rendezVous.update({
    where: { id: rendezVousId },
    data: { statut: "CONFIRME" },
    include: INCLUDE_COMPLET,
  });
  await notifierDemandeAcceptee(rdv);
}

export async function refuserDemandeAction(rendezVousId: string, motif?: string) {
  const rdv = await prisma.rendezVous.update({
    where: { id: rendezVousId },
    data: { statut: "REFUSE", motifRefus: motif || undefined },
    include: INCLUDE_COMPLET,
  });
  await notifierDemandeRefusee(rdv, motif);
}

export type Recurrence = {
  /** Périodicité en semaines (1 = chaque semaine, 4 = toutes les 4 semaines). */
  semaines: number;
  /** Nombre total de rendez-vous, le premier compris. */
  occurrences: number;
};

export async function creerRendezVousAdminAction({
  clientId,
  nouveauClient,
  lignes,
  dateDebutISO,
  recurrence,
}: {
  clientId?: string;
  nouveauClient?: { nom: string; prenom: string; telephone: string; email: string };
  lignes: LigneChoisie[];
  dateDebutISO: string;
  recurrence?: Recurrence;
}) {
  if (lignes.length === 0) {
    return { ok: false as const, error: "Merci de choisir au moins une prestation." };
  }

  let idClient = clientId;
  if (!idClient && nouveauClient) {
    const telephone = normaliserTelephone(nouveauClient.telephone);
    // Le téléphone n'identifie plus une fiche à lui seul : on ne réutilise une
    // fiche existante que si le nom concorde aussi, sinon on en crée une.
    const existante = await prisma.client.findFirst({
      where: {
        telephone,
        nom: { equals: nouveauClient.nom, mode: "insensitive" },
        prenom: { equals: nouveauClient.prenom, mode: "insensitive" },
      },
    });

    const client =
      existante ??
      (await prisma.client.create({
        data: {
          nom: nouveauClient.nom,
          prenom: nouveauClient.prenom,
          telephone,
          email: nouveauClient.email,
        },
      }));
    idClient = client.id;
  }

  if (!idClient) {
    return { ok: false as const, error: "Merci de sélectionner ou créer une cliente." };
  }

  const { lignesResolues, lissageMatrice } = await resoudreLignes(lignes);
  const { dureeTotaleAvecNettoyage } = calculerTotalAvecOptions(lignesResolues, lissageMatrice);
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateDebut.getTime() + dureeTotaleAvecNettoyage * 60000);

  const rdv = await prisma.rendezVous.create({
    data: {
      clientId: idClient,
      statut: "CONFIRME",
      dateDebut,
      dateFin,
      prestations: {
        create: construireDonneesPrestations(lignes),
      },
    },
    include: INCLUDE_COMPLET,
  });

  await notifierRdvCreeParAdmin(rdv);

  if (!recurrence || recurrence.occurrences <= 1) {
    return { ok: true as const, id: rdv.id, creees: 1, ignorees: [] as string[] };
  }

  const suite = await poserOccurrences({
    premier: rdv,
    clientId: idClient,
    lignes,
    dureeMinutes: dureeTotaleAvecNettoyage,
    recurrence,
  });

  return { ok: true as const, id: rdv.id, creees: 1 + suite.creees, ignorees: suite.ignorees };
}

/**
 * Crée les occurrences suivantes d'une série. Chacune tombe le même jour de
 * la semaine à la même heure, N semaines plus tard, et n'est posée que si le
 * créneau est réellement libre : une occurrence qui tomberait un jour de
 * fermeture ou sur un rendez-vous existant est signalée, pas écrasée.
 */
async function poserOccurrences({
  premier,
  clientId,
  lignes,
  dureeMinutes,
  recurrence,
}: {
  premier: { id: string; dateDebut: Date };
  clientId: string;
  lignes: LigneChoisie[];
  dureeMinutes: number;
  recurrence: Recurrence;
}) {
  const ignorees: string[] = [];
  let creees = 0;

  // La première occurrence devient la référence de la série.
  await prisma.rendezVous.update({
    where: { id: premier.id },
    data: { serieId: premier.id },
  });

  for (let i = 1; i < recurrence.occurrences; i++) {
    const debut = new Date(premier.dateDebut);
    debut.setDate(debut.getDate() + i * recurrence.semaines * 7);
    const fin = new Date(debut.getTime() + dureeMinutes * 60000);

    const debutJournee = new Date(debut);
    debutJournee.setHours(0, 0, 0, 0);
    const finJournee = new Date(debut);
    finJournee.setHours(23, 59, 59, 999);

    const [existants, fermetures] = await Promise.all([
      prisma.rendezVous.findMany({
        where: {
          dateDebut: { gte: debutJournee, lte: finJournee },
          statut: { in: ["CONFIRME", "EN_ATTENTE"] },
        },
        select: { dateDebut: true, dateFin: true },
      }),
      getFermetures(debut, debut),
    ]);

    const verdict = creneauEstLibre({
      dateDebut: debut,
      dateFin: fin,
      rendezVousExistants: existants,
      fermetures,
      estAdmin: true,
    });

    if (!verdict.libre) {
      const motif = {
        ferme: "salon fermé",
        "hors-horaires": "hors des horaires d'ouverture",
        occupe: "créneau déjà pris",
      }[verdict.raison];
      ignorees.push(`${formatDateCourte(debut)} — ${motif}`);
      continue;
    }

    await prisma.rendezVous.create({
      data: {
        clientId,
        statut: "CONFIRME",
        serieId: premier.id,
        dateDebut: debut,
        dateFin: fin,
        prestations: { create: construireDonneesPrestations(lignes) },
      },
    });
    creees++;
  }

  return { creees, ignorees };
}

function formatDateCourte(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }) + ` à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export async function modifierRendezVousAction({
  rendezVousId,
  lignes,
  dateDebutISO,
}: {
  rendezVousId: string;
  lignes: LigneChoisie[];
  dateDebutISO: string;
}) {
  const existant = await prisma.rendezVous.findUnique({ where: { id: rendezVousId } });
  if (!existant) {
    return { ok: false as const, error: "Rendez-vous introuvable." };
  }

  if (lignes.length === 0) {
    return { ok: false as const, error: "Merci de choisir au moins une prestation." };
  }

  const { lignesResolues, lissageMatrice } = await resoudreLignes(lignes);
  const { dureeTotaleAvecNettoyage } = calculerTotalAvecOptions(lignesResolues, lissageMatrice);
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateDebut.getTime() + dureeTotaleAvecNettoyage * 60000);
  const dateChangee = existant.dateDebut.getTime() !== dateDebut.getTime();
  const ancienneDateDebut = existant.dateDebut;

  const rdv = await prisma.rendezVous.update({
    where: { id: rendezVousId },
    data: {
      dateDebut,
      dateFin,
      prestations: {
        deleteMany: {},
        create: construireDonneesPrestations(lignes),
      },
    },
    include: INCLUDE_COMPLET,
  });

  if (dateChangee) {
    await notifierRdvDeplace(rdv, ancienneDateDebut);
  } else {
    await notifierRdvModifie(rdv);
  }

  return { ok: true as const };
}

export async function supprimerRendezVousAction(rendezVousId: string) {
  const rdv = await prisma.rendezVous.delete({
    where: { id: rendezVousId },
    include: INCLUDE_COMPLET,
  });
  await notifierRdvSupprime(rdv);
}
