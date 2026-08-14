import "server-only";
import { prisma } from "@/lib/prisma";

export function getPrestationsActives() {
  return prisma.prestation.findMany({
    where: { actif: true },
    include: { variantesLongueur: true },
    orderBy: [{ profil: "asc" }, { categorie: "asc" }, { ordre: "asc" }],
  });
}

export function getOptionsActives() {
  return prisma.option.findMany({
    where: { actif: true },
    include: { variantesLongueur: true },
    orderBy: { ordre: "asc" },
  });
}

export function getLissageMatrice() {
  return prisma.lissageTarif.findMany();
}

export async function getCatalogue() {
  const [prestations, options, lissageMatrice] = await Promise.all([
    getPrestationsActives(),
    getOptionsActives(),
    getLissageMatrice(),
  ]);
  return { prestations, options, lissageMatrice };
}
