"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCreneauxDisponibles } from "@/lib/creneaux";
import { calculerTotal } from "@/lib/prestations";
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
  prestations: { include: { prestation: true } },
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

export async function chercherClientParTelephoneAction(telephone: string) {
  return prisma.client.findUnique({
    where: { telephone: normaliserTelephone(telephone) },
  });
}

export async function getCreneauxAdminAction(
  dateISO: string,
  prestationIds: string[],
  excludeRendezVousId?: string,
) {
  const prestations = await prisma.prestation.findMany({
    where: { id: { in: prestationIds } },
  });
  if (prestations.length === 0) return [];

  const { dureeTotaleAvecNettoyage } = calculerTotal(prestations);
  const date = new Date(dateISO);
  const debutJournee = new Date(date);
  debutJournee.setHours(0, 0, 0, 0);
  const finJournee = new Date(date);
  finJournee.setHours(23, 59, 59, 999);

  const rendezVousExistants = await prisma.rendezVous.findMany({
    where: {
      dateDebut: { gte: debutJournee, lte: finJournee },
      statut: { in: ["CONFIRME", "EN_ATTENTE"] },
      ...(excludeRendezVousId ? { id: { not: excludeRendezVousId } } : {}),
    },
    select: { dateDebut: true, dateFin: true },
  });

  return getCreneauxDisponibles({
    date,
    dureeTotaleMinutes: dureeTotaleAvecNettoyage,
    rendezVousExistants,
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

export async function creerRendezVousAdminAction({
  clientId,
  nouveauClient,
  prestationIds,
  dateDebutISO,
}: {
  clientId?: string;
  nouveauClient?: { nom: string; prenom: string; telephone: string; email: string };
  prestationIds: string[];
  dateDebutISO: string;
}) {
  const prestations = await prisma.prestation.findMany({
    where: { id: { in: prestationIds } },
  });
  if (prestations.length === 0) {
    return { ok: false as const, error: "Merci de choisir au moins une prestation." };
  }

  let idClient = clientId;
  if (!idClient && nouveauClient) {
    const client = await prisma.client.upsert({
      where: { telephone: normaliserTelephone(nouveauClient.telephone) },
      update: {},
      create: {
        nom: nouveauClient.nom,
        prenom: nouveauClient.prenom,
        telephone: normaliserTelephone(nouveauClient.telephone),
        email: nouveauClient.email,
      },
    });
    idClient = client.id;
  }

  if (!idClient) {
    return { ok: false as const, error: "Merci de sélectionner ou créer une cliente." };
  }

  const { dureeTotaleAvecNettoyage } = calculerTotal(prestations);
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateDebut.getTime() + dureeTotaleAvecNettoyage * 60000);

  const rdv = await prisma.rendezVous.create({
    data: {
      clientId: idClient,
      statut: "CONFIRME",
      dateDebut,
      dateFin,
      prestations: {
        create: prestations.map((p, i) => ({ prestationId: p.id, ordre: i })),
      },
    },
    include: INCLUDE_COMPLET,
  });

  await notifierRdvCreeParAdmin(rdv);
  return { ok: true as const, id: rdv.id };
}

export async function modifierRendezVousAction({
  rendezVousId,
  prestationIds,
  dateDebutISO,
}: {
  rendezVousId: string;
  prestationIds: string[];
  dateDebutISO: string;
}) {
  const existant = await prisma.rendezVous.findUnique({ where: { id: rendezVousId } });
  if (!existant) {
    return { ok: false as const, error: "Rendez-vous introuvable." };
  }

  const prestations = await prisma.prestation.findMany({
    where: { id: { in: prestationIds } },
  });
  if (prestations.length === 0) {
    return { ok: false as const, error: "Merci de choisir au moins une prestation." };
  }

  const { dureeTotaleAvecNettoyage } = calculerTotal(prestations);
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
        create: prestations.map((p, i) => ({ prestationId: p.id, ordre: i })),
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
