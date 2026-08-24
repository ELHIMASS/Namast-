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

/**
 * Créneaux déjà retenus dans le panier en cours, mais pas encore enregistrés.
 * Sans eux, la deuxième personne d'une réservation familiale se verrait
 * proposer l'horaire que la première vient de choisir.
 */
export type CreneauReserve = { debutISO: string; finISO: string };

async function creneauxPourLignes(
  dateISO: string,
  lignes: LigneChoisie[],
  excludeRendezVousId?: string,
  creneauxPanier: CreneauReserve[] = [],
) {
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

  // Les créneaux du panier sont traités comme des rendez-vous déjà pris : la
  // personne suivante ne peut pas réserver par-dessus la précédente.
  const occupes = [
    ...rendezVousExistants,
    ...creneauxPanier.map((c) => ({
      dateDebut: new Date(c.debutISO),
      dateFin: new Date(c.finISO),
    })),
  ];

  return getCreneauxDisponibles({
    date,
    dureeTotaleMinutes: dureeTotaleAvecNettoyage,
    prestations,
    rendezVousExistants: occupes,
    fermetures,
  });
}

export async function getCreneauxAction(
  dateISO: string,
  lignes: LigneChoisie[],
  creneauxPanier: CreneauReserve[] = [],
) {
  const creneaux = await creneauxPourLignes(dateISO, lignes, undefined, creneauxPanier);
  return creneaux.map((d) => d.toISOString());
}

/**
 * Durée totale d'un ensemble de lignes, nettoyage compris.
 * Le panier en a besoin côté navigateur pour calculer la fin d'un créneau
 * avant enregistrement, et pour afficher la durée dans le récapitulatif.
 */
export async function calculerDureeLignesAction(lignes: LigneChoisie[]) {
  if (lignes.length === 0) return { dureeMinutes: 0, prixCentimes: 0 };
  const { lignesResolues, lissageMatrice } = await resoudreLignes(lignes);
  const total = calculerTotalAvecOptions(lignesResolues, lissageMatrice);
  return {
    dureeMinutes: total.dureeTotaleAvecNettoyage,
    prixCentimes: total.prixTotalCentimes,
  };
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

/**
 * Réservation groupée : plusieurs personnes, chacune avec son propre créneau.
 *
 * Le schéma n'ayant qu'une plage horaire par rendez-vous, un parent venant
 * avec ses enfants produit autant de rendez-vous que de personnes. Ils
 * partagent un `groupeId` afin d'être présentés ensemble côté salon comme
 * côté cliente.
 */
export async function creerReservationGroupeeAction({
  clientId,
  elements,
}: {
  clientId: string;
  elements: { personne?: string; lignes: LigneChoisie[]; dateDebutISO: string }[];
}) {
  if (elements.length === 0) {
    return { ok: false as const, error: "Votre panier est vide." };
  }
  if (elements.some((e) => e.lignes.length === 0)) {
    return { ok: false as const, error: "Une des personnes n'a aucune prestation." };
  }

  const calcules = [];
  for (const e of elements) {
    const { lignesResolues, lissageMatrice } = await resoudreLignes(e.lignes);
    const { dureeTotaleAvecNettoyage } = calculerTotalAvecOptions(lignesResolues, lissageMatrice);
    const debut = new Date(e.dateDebutISO);
    calcules.push({
      ...e,
      debut,
      fin: new Date(debut.getTime() + dureeTotaleAvecNettoyage * 60000),
    });
  }

  // Deux personnes du même panier ne peuvent pas occuper le même moment.
  const parDebut = [...calcules].sort((a, b) => a.debut.getTime() - b.debut.getTime());
  for (let i = 1; i < parDebut.length; i++) {
    if (parDebut[i].debut < parDebut[i - 1].fin) {
      return {
        ok: false as const,
        error:
          "Deux créneaux de votre réservation se chevauchent. Modifiez l'un des horaires avant de valider.",
      };
    }
  }

  // Revérification au moment de valider : entre le choix et la confirmation,
  // un créneau a pu être pris par quelqu'un d'autre.
  for (const c of calcules) {
    const autresDuPanier = calcules
      .filter((x) => x !== c)
      .map((x) => ({ debutISO: x.debut.toISOString(), finISO: x.fin.toISOString() }));
    const dispo = await creneauxPourLignes(
      c.debut.toISOString(),
      c.lignes,
      undefined,
      autresDuPanier,
    );
    if (!dispo.some((d) => d.getTime() === c.debut.getTime())) {
      const quand = c.debut.toLocaleString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        ok: false as const,
        error: `Le créneau du ${quand} vient d'être pris. Merci d'en choisir un autre.`,
      };
    }
  }

  // Une réservation pour une seule personne reste un rendez-vous ordinaire :
  // inutile de la marquer comme groupée.
  const groupeId = calcules.length > 1 ? crypto.randomUUID() : null;

  const crees = [];
  for (const c of calcules) {
    const rdv = await prisma.rendezVous.create({
      data: {
        code: await genererCodeUnique(),
        clientId,
        statut: "CONFIRME",
        estNouvelleCliente: false,
        groupeId,
        dateDebut: c.debut,
        dateFin: c.fin,
        prestations: {
          create: construireDonneesPrestations(
            c.lignes.map((l) => ({ ...l, personne: c.personne })),
          ),
        },
      },
    });
    crees.push({
      code: rdv.code,
      personne: c.personne ?? null,
      debutISO: c.debut.toISOString(),
      finISO: c.fin.toISOString(),
    });
  }

  return { ok: true as const, groupeId, rendezVous: crees };
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
          prestation: true,
          options: {
            include: {
              option: true,
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
  await notifierClientDemandeRdv(email, prenom);

  return { ok: true as const, rendezVousId: rendezVous.id, code: rendezVous.code };
}
