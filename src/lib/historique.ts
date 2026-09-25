import { prisma } from "./prisma";

type EntiteType = "CLIENT" | "RENDEZVOUS" | "PRESTATION" | "AUTRE";
type ActionType = "CREATE" | "UPDATE" | "DELETE";

export async function logAction(
  entite: EntiteType,
  action: ActionType,
  details: string
) {
  try {
    await prisma.actionLog.create({
      data: {
        entite,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'historique:", error);
  }
}
