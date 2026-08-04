"use server";

import { prisma } from "@/lib/prisma";
import { getCreneauxDisponibles } from "@/lib/creneaux";
import { calculerTotal } from "@/lib/prestations";

function normaliserTelephone(telephone: string): string {
  return telephone.replace(/[\s.\-]/g, "");
}

export async function findClientByPhone(telephone: string) {
  const client = await prisma.client.findUnique({
    where: { telephone: normaliserTelephone(telephone) },
  });

  if (!client) return null;

  return {
    id: client.id,
    nom: client.nom,
    prenom: client.prenom,
    telephone: client.telephone,
  };
}

async function creneauxPourDate(dateISO: string, prestationIds: string[]) {
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
    },
    select: { dateDebut: true, dateFin: true },
  });

  return getCreneauxDisponibles({
    date,
    dureeTotaleMinutes: dureeTotaleAvecNettoyage,
    rendezVousExistants,
  });
}

export async function getCreneauxAction(dateISO: string, prestationIds: string[]) {
  const creneaux = await creneauxPourDate(dateISO, prestationIds);
  return creneaux.map((d) => d.toISOString());
}

export async function creerRendezVousDirectAction({
  clientId,
  prestationIds,
  dateDebutISO,
}: {
  clientId: string;
  prestationIds: string[];
  dateDebutISO: string;
}) {
  const prestations = await prisma.prestation.findMany({
    where: { id: { in: prestationIds } },
  });

  if (prestations.length === 0) {
    return { ok: false as const, error: "Aucune prestation sélectionnée." };
  }

  const { dureeTotaleAvecNettoyage } = calculerTotal(prestations);
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateDebut.getTime() + dureeTotaleAvecNettoyage * 60000);

  // Revérifie la disponibilité au moment de la confirmation (évite les doubles réservations).
  const creneauxDispo = await creneauxPourDate(dateDebutISO, prestationIds);
  const disponible = creneauxDispo.some((c) => c.getTime() === dateDebut.getTime());
  if (!disponible) {
    return {
      ok: false as const,
      error: "Ce créneau vient d'être pris. Merci d'en choisir un autre.",
    };
  }

  const rendezVous = await prisma.rendezVous.create({
    data: {
      clientId,
      statut: "CONFIRME",
      estNouvelleCliente: false,
      dateDebut,
      dateFin,
      prestations: {
        create: prestations.map((p, i) => ({ prestationId: p.id, ordre: i })),
      },
    },
  });

  return { ok: true as const, rendezVousId: rendezVous.id };
}

export async function creerDemandeNouvelleClienteAction({
  nom,
  prenom,
  telephone,
  email,
  commentConnue,
  message,
  prestationIds,
  dateDebutISO,
}: {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  commentConnue?: string;
  message?: string;
  prestationIds: string[];
  dateDebutISO: string;
}) {
  const prestations = await prisma.prestation.findMany({
    where: { id: { in: prestationIds } },
  });

  if (prestations.length === 0) {
    return { ok: false as const, error: "Merci de choisir au moins une prestation." };
  }

  const { dureeTotaleAvecNettoyage } = calculerTotal(prestations);
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateDebut.getTime() + dureeTotaleAvecNettoyage * 60000);
  const telephoneNormalise = normaliserTelephone(telephone);

  const client = await prisma.client.upsert({
    where: { telephone: telephoneNormalise },
    update: {},
    create: {
      nom,
      prenom,
      telephone: telephoneNormalise,
      email,
      commentConnue: commentConnue || undefined,
    },
  });

  const rendezVous = await prisma.rendezVous.create({
    data: {
      clientId: client.id,
      statut: "EN_ATTENTE",
      estNouvelleCliente: true,
      dateDebut,
      dateFin,
      message: message || undefined,
      prestations: {
        create: prestations.map((p, i) => ({ prestationId: p.id, ordre: i })),
      },
    },
  });

  return { ok: true as const, rendezVousId: rendezVous.id };
}
