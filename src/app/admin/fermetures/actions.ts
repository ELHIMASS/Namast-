"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getFermetures } from "@/lib/fermetures";

/**
 * Les dates arrivent au format "AAAA-MM-JJ" depuis un <input type="date">.
 * On les fige à minuit UTC : la colonne est de type DATE et c'est aussi ainsi
 * qu'elles sont relues dans lib/fermetures, donc aucun décalage de fuseau.
 */
function versDateUTC(saisie: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(saisie)) return null;
  const date = new Date(`${saisie}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function listerFermeturesAction() {
  const fermetures = await getFermetures();
  return fermetures.map((f) => ({
    id: f.id,
    dateDebut: f.dateDebut.toISOString().slice(0, 10),
    dateFin: f.dateFin.toISOString().slice(0, 10),
    motif: f.motif,
  }));
}

export async function ajouterFermetureAction({
  dateDebut,
  dateFin,
  motif,
}: {
  dateDebut: string;
  dateFin: string;
  motif?: string;
}) {
  const debut = versDateUTC(dateDebut);
  const fin = versDateUTC(dateFin || dateDebut);

  if (!debut || !fin) {
    return { ok: false as const, error: "Dates invalides." };
  }

  if (fin < debut) {
    return {
      ok: false as const,
      error: "La date de fin ne peut pas précéder la date de début.",
    };
  }

  // Prévient l'utilisatrice si des rendez-vous tombent dans la période fermée :
  // la fermeture est quand même enregistrée, mais il faudra les traiter.
  const finJournee = new Date(fin);
  finJournee.setUTCHours(23, 59, 59, 999);

  const conflits = await prisma.rendezVous.count({
    where: {
      dateDebut: { gte: debut, lte: finJournee },
      statut: { in: ["CONFIRME", "EN_ATTENTE"] },
    },
  });

  await prisma.fermeture.create({
    data: { dateDebut: debut, dateFin: fin, motif: motif?.trim() || null },
  });

  revalidatePath("/admin/fermetures");
  return { ok: true as const, conflits };
}

export async function supprimerFermetureAction(id: string) {
  await prisma.fermeture.delete({ where: { id } });
  revalidatePath("/admin/fermetures");
  return { ok: true as const };
}
