"use server";

import { prisma } from "@/lib/prisma";

export async function getHistoriqueAction(take: number = 50) {
  return prisma.actionLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
}
