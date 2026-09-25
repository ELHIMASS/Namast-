"use server";

import { prisma } from "@/lib/prisma";
import { envoyerEmail } from "@/lib/email";
import { logAction } from "@/lib/historique";

export async function envoyerEmailAdminAction({
  destinataires,
  sujet,
  contenuHtml,
}: {
  destinataires: "ALL" | string[];
  sujet: string;
  contenuHtml: string;
}) {
  try {
    let clients = [];
    if (destinataires === "ALL") {
      clients = await prisma.client.findMany({
        where: { email: { not: "" } },
        select: { id: true, email: true, prenom: true, nom: true },
      });
    } else {
      clients = await prisma.client.findMany({
        where: { id: { in: destinataires }, email: { not: "" } },
        select: { id: true, email: true, prenom: true, nom: true },
      });
    }

    if (clients.length === 0) {
      return { ok: false, error: "Aucun client valide avec une adresse email trouvée." };
    }

    let succesCount = 0;
    // On envoie un par un (ou on pourrait batcher si la liste est énorme)
    for (const client of clients) {
      // Formatage du corps avec un bonjour personnalisé
      const htmlFinal = `
        <div style="font-family: sans-serif; color: #333;">
          <p>Bonjour ${client.prenom},</p>
          <div style="margin-top: 1rem; margin-bottom: 2rem;">
            ${contenuHtml.replace(/\n/g, "<br />")}
          </div>
          <p style="font-size: 0.9em; color: #666;">
            À très bientôt,<br/>
            L'équipe Namasté
          </p>
        </div>
      `;

      const success = await envoyerEmail({
        to: client.email,
        subject: sujet,
        html: htmlFinal,
      });

      if (success) {
        succesCount++;
      }
    }

    await logAction("AUTRE", "CREATE", `E-mail "${sujet}" envoyé à ${succesCount} client(s).`);

    return { ok: true, count: Math.min(succesCount, clients.length), total: clients.length };
  } catch (error) {
    return { ok: false, error: "Erreur lors de l'envoi des e-mails." };
  }
}
