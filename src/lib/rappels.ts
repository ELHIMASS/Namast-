import { prisma } from "@/lib/prisma";
import { chargerRendezVousEmail, notifierRappelRdvJMoins1 } from "@/lib/notifications";

/**
 * Recherche tous les rendez-vous confirmés prévus pour DEMAIN pour lesquels
 * aucun rappel n'a encore été envoyé, puis leur envoie l'email de rappel.
 */
export async function envoyerRappelsDemain() {
  const maintenant = new Date();

  // Déterminer le créneau de demain (00:00:00 à 23:59:59 heure de Paris)
  const debutDemain = new Date(maintenant);
  debutDemain.setDate(debutDemain.getDate() + 1);
  debutDemain.setHours(0, 0, 0, 0);

  const finDemain = new Date(debutDemain);
  finDemain.setHours(23, 59, 59, 999);

  const rendezVousDemain = await prisma.rendezVous.findMany({
    where: {
      statut: "CONFIRME",
      rappelEnvoye: false,
      dateDebut: {
        gte: debutDemain,
        lte: finDemain,
      },
    },
    select: { id: true },
  });

  let envoyes = 0;
  for (const item of rendezVousDemain) {
    const rdvFull = await chargerRendezVousEmail(item.id);
    if (rdvFull && rdvFull.client && rdvFull.client.email) {
      try {
        await notifierRappelRdvJMoins1(rdvFull);
        await prisma.rendezVous.update({
          where: { id: item.id },
          data: { rappelEnvoye: true },
        });
        envoyes++;
      } catch (err) {
        console.error(`Erreur envoi rappel RDV ${item.id}:`, err);
      }
    }
  }

  return { ok: true as const, total: rendezVousDemain.length, envoyes };
}
