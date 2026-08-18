"use server";

import { prisma } from "@/lib/prisma";

export async function getPrestationsAvecVariantes() {
  return prisma.prestation.findMany({
    include: {
      variantesLongueur: {
        orderBy: { longueur: "asc" },
      },
    },
    orderBy: [{ categorie: "asc" }, { ordre: "asc" }],
  });
}

export async function getOptionsAvecVariantes() {
  return prisma.option.findMany({
    include: {
      variantesLongueur: {
        orderBy: { longueur: "asc" },
      },
    },
    orderBy: [{ groupe: "asc" }, { ordre: "asc" }],
  });
}

export async function getLissageTarifs() {
  return prisma.lissageTarif.findMany({
    orderBy: [{ longueur: "asc" }, { densite: "asc" }],
  });
}

export async function modifierPrixPrestationAction(
  prestationId: string,
  prixCentimes: number
) {
  try {
    await prisma.prestation.update({
      where: { id: prestationId },
      data: { prixCentimes },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la modification." };
  }
}

export async function modifierPrixVariantePrestationAction(
  varianteId: string,
  prixCentimes: number
) {
  try {
    await prisma.prestationLongueur.update({
      where: { id: varianteId },
      data: { prixCentimes },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la modification." };
  }
}

export async function modifierPrixOptionAction(optionId: string, prixCentimes: number | null) {
  try {
    await prisma.option.update({
      where: { id: optionId },
      data: { prixCentimes },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la modification." };
  }
}

export async function modifierPrixVarianteOptionAction(
  varianteId: string,
  prixCentimes: number
) {
  try {
    await prisma.optionLongueur.update({
      where: { id: varianteId },
      data: { prixCentimes },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la modification." };
  }
}

export async function modifierLissageTarifAction(
  lissageId: string,
  prixCentimes: number
) {
  try {
    await prisma.lissageTarif.update({
      where: { id: lissageId },
      data: { prixCentimes },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la modification." };
  }
}

export async function synchroniserVariantesPrestationAction(
  prestationId: string,
  ancienPrix: number,
  nouveauPrix: number
) {
  try {
    const difference = nouveauPrix - ancienPrix;

    // Récupère toutes les variantes
    const variantes = await prisma.prestationLongueur.findMany({
      where: { prestationId },
    });

    // Met à jour chaque variante avec la même différence
    for (const variante of variantes) {
      await prisma.prestationLongueur.update({
        where: { id: variante.id },
        data: { prixCentimes: variante.prixCentimes + difference },
      });
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la synchronisation." };
  }
}

export async function synchroniserVariantesOptionAction(
  optionId: string,
  ancienPrix: number,
  nouveauPrix: number
) {
  try {
    const difference = nouveauPrix - ancienPrix;

    // Récupère toutes les variantes
    const variantes = await prisma.optionLongueur.findMany({
      where: { optionId },
    });

    // Met à jour chaque variante avec la même différence
    for (const variante of variantes) {
      await prisma.optionLongueur.update({
        where: { id: variante.id },
        data: { prixCentimes: variante.prixCentimes + difference },
      });
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la synchronisation." };
  }
}
