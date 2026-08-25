import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { construireCalendrier, type EvenementCalendrier } from "@/lib/icalendar";

/**
 * Flux iCalendar du planning, destiné à être ajouté dans Outlook, Google
 * Agenda ou l'agenda d'un téléphone.
 *
 * L'adresse contient un jeton secret : quiconque la possède voit tout le
 * planning. Elle ne doit donc jamais être publiée, et se révoque en changeant
 * CALENDRIER_JETON dans le .env.
 *
 * Le flux est volontairement pauvre en données personnelles : prénom, nom et
 * prestation suffisent à reconnaître un rendez-vous. Ni téléphone ni e-mail
 * n'y figurent, car un agenda se synchronise sur des serveurs tiers et sur
 * tous les appareils liés au compte.
 */

// Le planning change à chaque réservation : rien ne doit être mis en cache.
export const dynamic = "force-dynamic";

/** Comparaison à durée constante, pour ne pas divulguer le jeton essai après essai. */
function jetonValide(fourni: string, attendu: string): boolean {
  const a = Buffer.from(fourni, "utf8");
  const b = Buffer.from(attendu, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ jeton: string }> },
) {
  const attendu = process.env.CALENDRIER_JETON;
  // Fonctionnalité non configurée : on ne laisse rien deviner de son existence.
  if (!attendu) return new Response("Not found", { status: 404 });

  const { jeton } = await ctx.params;
  // L'abonnement se fait sur une adresse en .ics : les agendas refusent
  // souvent une URL sans extension reconnue.
  const fourni = jeton.replace(/\.ics$/i, "");
  if (!jetonValide(fourni, attendu)) {
    return new Response("Not found", { status: 404 });
  }

  // Fenêtre volontairement bornée : un agenda n'a pas besoin de tout
  // l'historique, et le flux est rechargé entièrement à chaque actualisation.
  const debut = new Date();
  debut.setMonth(debut.getMonth() - 1);
  const fin = new Date();
  fin.setFullYear(fin.getFullYear() + 1);

  const rendezVous = await prisma.rendezVous.findMany({
    where: {
      dateDebut: { gte: debut, lte: fin },
      statut: { in: ["CONFIRME", "EN_ATTENTE"] },
    },
    select: {
      id: true,
      code: true,
      statut: true,
      updatedAt: true,
      dateDebut: true,
      dateFin: true,
      groupeId: true,
      client: { select: { prenom: true, nom: true } },
      prestations: {
        orderBy: { ordre: "asc" },
        select: { personne: true, prestation: { select: { nom: true } } },
      },
    },
    orderBy: { dateDebut: "asc" },
  });

  const evenements: EvenementCalendrier[] = rendezVous.map((r) => {
    // Le bénéficiaire prime sur la titulaire du compte : un rendez-vous pris
    // par un parent pour son enfant doit s'afficher au nom de l'enfant.
    const beneficiaire =
      r.prestations.find((p) => p.personne)?.personne ??
      `${r.client.prenom} ${r.client.nom}`;
    const prestations = r.prestations.map((p) => p.prestation.nom).join(", ");

    const details = [
      prestations,
      r.code ? `Code : ${r.code}` : null,
      r.statut === "EN_ATTENTE" ? "En attente de validation" : null,
      r.groupeId ? "Réservation groupée" : null,
    ].filter(Boolean);

    return {
      id: `${r.id}@namastecoiffure.fr`,
      debut: r.dateDebut,
      fin: r.dateFin,
      modifieLe: r.updatedAt,
      titre: `${beneficiaire} — ${prestations}`,
      description: details.join("\n"),
      provisoire: r.statut === "EN_ATTENTE",
    };
  });

  const calendrier = construireCalendrier({
    nom: "Namasté — Planning",
    evenements,
  });

  return new Response(calendrier, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="namaste.ics"',
      "Cache-Control": "no-store",
      // Le planning contient des données personnelles : jamais d'indexation.
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const HEAD = GET;
