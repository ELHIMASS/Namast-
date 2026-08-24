import { prisma } from "@/lib/prisma";
import type { Densite, Finition, LigneReservation, Longueur } from "@/lib/prestations";

export type LigneChoisie = {
  prestationId: string;
  longueur?: Longueur;
  densite?: Densite;
  finition?: Finition;
  optionIds: string[];
  /** Bénéficiaire de la ligne (voir LigneReservation.personne). */
  personne?: string;
};

// Résout des lignes de réservation (ids) en objets complets (prestation +
// options avec leurs variantes de longueur) prêts pour le calcul de prix/durée.
export async function resoudreLignes(lignes: LigneChoisie[]) {
  const prestationIds = lignes.map((l) => l.prestationId);
  const optionIds = [...new Set(lignes.flatMap((l) => l.optionIds))];

  const [prestations, options, lissageMatrice] = await Promise.all([
    prisma.prestation.findMany({
      where: { id: { in: prestationIds } },
      include: { variantesLongueur: true },
    }),
    prisma.option.findMany({
      where: { id: { in: optionIds } },
      include: { variantesLongueur: true },
    }),
    prisma.lissageTarif.findMany(),
  ]);

  const lignesResolues: LigneReservation[] = lignes.map((ligne) => {
    const prestation = prestations.find((p) => p.id === ligne.prestationId)!;
    return {
      prestation,
      longueur: ligne.longueur,
      densite: ligne.densite,
      finition: ligne.finition,
      options: ligne.optionIds
        .map((id) => options.find((o) => o.id === id))
        .filter((o): o is NonNullable<typeof o> => !!o),
    };
  });

  return { prestations, lignesResolues, lissageMatrice };
}

export function construireDonneesPrestations(lignes: LigneChoisie[]) {
  return lignes.map((ligne, i) => ({
    prestationId: ligne.prestationId,
    ordre: i,
    personne: ligne.personne?.trim() || null,
    longueur: ligne.longueur,
    densite: ligne.densite,
    finition: ligne.finition,
    options: {
      create: ligne.optionIds.map((optionId) => ({ optionId })),
    },
  }));
}
