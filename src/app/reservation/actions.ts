"use server";

import { prisma } from "@/lib/prisma";
import { getCreneauxDisponibles } from "@/lib/creneaux";
import { getFermetures } from "@/lib/fermetures";
import { estJourAutorisePourPrestations } from "@/lib/reglesCreneaux";
import { genererCodeUnique } from "@/lib/codeReservation";
import { calculerTotalAvecOptions } from "@/lib/prestations";
import { envoyerEmailSalon } from "@/lib/email";
import { notifierClientDemandeRdv } from "@/lib/notifications";
import {
  construireDonneesPrestations,
  resoudreLignes,
  type LigneChoisie,
} from "@/lib/reservationLignes";

function normaliserTelephone(telephone: string): string {
  return telephone.replace(/[\s.\-]/g, "");
}

/**
 * Identification de la cliente par son prénom et son nom.
 * En cas d'homonymes, aucune fiche n'est renvoyée : ouvrir le compte d'une
 * autre cliente serait pire que de demander d'appeler le salon.
 */
export async function findClientByName(prenom: string, nom: string) {
  const p = prenom.trim();
  const n = nom.trim();
  if (!p || !n) return { statut: "introuvable" as const };

  const clients = await prisma.client.findMany({
    where: {
      prenom: { equals: p, mode: "insensitive" },
      nom: { equals: n, mode: "insensitive" },
    },
    take: 2,
  });

  if (clients.length === 0) return { statut: "introuvable" as const };
  if (clients.length > 1) return { statut: "homonymes" as const };

  const client = clients[0];
  return {
    statut: "trouve" as const,
    client: {
      id: client.id,
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
    },
  };
}

async function creneauxPourLignes(dateISO: string, lignes: LigneChoisie[], excludeRendezVousId?: string) {
  if (lignes.length === 0) return [];

  const { prestations, lignesResolues, lissageMatrice } = await resoudreLignes(lignes);
  if (prestations.length === 0) return [];

  const date = new Date(dateISO);
  if (!estJourAutorisePourPrestations(date, prestations)) {
    return [];
  }

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
  });
}

export async function getCreneauxAction(dateISO: string, lignes: LigneChoisie[]) {
  const creneaux = await creneauxPourLignes(dateISO, lignes);
  return creneaux.map((d) => d.toISOString());
}

export async function creerRendezVousDirectAction({
  clientId,
  lignes,
  dateDebutISO,
}: {
  clientId: string;
  lignes: LigneChoisie[];
  dateDebutISO: string;
}) {
  if (lignes.length === 0) {
    return { ok: false as const, error: "Aucune prestation sélectionnée." };
  }

  const { lignesResolues, lissageMatrice } = await resoudreLignes(lignes);
  const { dureeTotaleAvecNettoyage } = calculerTotalAvecOptions(lignesResolues, lissageMatrice);
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateDebut.getTime() + dureeTotaleAvecNettoyage * 60000);

  // Revérifie la disponibilité au moment de la confirmation (évite les doubles réservations).
  const creneauxDispo = await creneauxPourLignes(dateDebutISO, lignes);
  const disponible = creneauxDispo.some((c) => c.getTime() === dateDebut.getTime());
  if (!disponible) {
    return {
      ok: false as const,
      error: "Ce créneau vient d'être pris. Merci d'en choisir un autre.",
    };
  }

  const rendezVous = await prisma.rendezVous.create({
    data: {
      code: await genererCodeUnique(),
      clientId,
      statut: "CONFIRME",
      estNouvelleCliente: false,
      dateDebut,
      dateFin,
      prestations: {
        create: construireDonneesPrestations(lignes),
      },
    },
  });

  return { ok: true as const, rendezVousId: rendezVous.id, code: rendezVous.code };
}

export async function creerDemandeNouvelleClienteAction({
  nom,
  prenom,
  telephone,
  email,
  commentConnue,
  message,
  lignes,
  dateDebutISO,
}: {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  commentConnue?: string;
  message?: string;
  lignes: LigneChoisie[];
  dateDebutISO: string;
}) {
  if (lignes.length === 0) {
    return { ok: false as const, error: "Merci de choisir au moins une prestation." };
  }

  const { lignesResolues, lissageMatrice } = await resoudreLignes(lignes);
  const { dureeTotaleAvecNettoyage } = calculerTotalAvecOptions(lignesResolues, lissageMatrice);
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateDebut.getTime() + dureeTotaleAvecNettoyage * 60000);
  const telephoneNormalise = normaliserTelephone(telephone);

  // Le téléphone n'est plus unique (proches partageant une ligne fixe) : une
  // fiche n'est réutilisée que si le nom concorde également.
  const existante = await prisma.client.findFirst({
    where: {
      telephone: telephoneNormalise,
      nom: { equals: nom, mode: "insensitive" },
      prenom: { equals: prenom, mode: "insensitive" },
    },
  });

  const client =
    existante ??
    (await prisma.client.create({
      data: {
        nom,
        prenom,
        telephone: telephoneNormalise,
        email,
        commentConnue: commentConnue || undefined,
      },
    }));

  const rendezVous = await prisma.rendezVous.create({
    data: {
      code: await genererCodeUnique(),
      clientId: client.id,
      statut: "EN_ATTENTE",
      estNouvelleCliente: true,
      dateDebut,
      dateFin,
      message: message || undefined,
      prestations: {
        create: construireDonneesPrestations(lignes),
      },
    },
    include: {
      prestations: {
        include: {
          prestation: {
            include: {
              variantesLongueur: true,
              variantesDensite: true,
            },
          },
          options: {
            include: {
              option: {
                include: {
                  variantes: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Envoyer un email au salon pour la nouvelle demande
  const nomsPresta = rendezVous.prestations
    .map((p) => p.prestation.nom)
    .join(", ");
  await envoyerEmailSalon(
    prenom,
    nom,
    telephone,
    email,
    dateDebut.toISOString(),
    nomsPresta,
    message
  );

  // Envoyer un email de confirmation au client
  await notifierClientDemandeRdv({
    dateDebut,
    client: { prenom, nom, email, telephone: telephoneNormalise },
    prestations: rendezVous.prestations,
  });

  return { ok: true as const, rendezVousId: rendezVous.id, code: rendezVous.code };
}
