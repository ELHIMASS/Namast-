import { prisma } from "@/lib/prisma";

export function getPrestationsActives() {
  return prisma.prestation.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
  });
}
