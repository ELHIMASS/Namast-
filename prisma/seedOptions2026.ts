import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

/**
 * Révision des options et du descriptif de lissage, août 2026.
 *
 *   npx tsx prisma/seedOptions2026.ts
 *
 * Idempotent : les options sont repérées par leur nom et leur groupe, mises à
 * jour si elles existent, créées sinon. Celles qui sont retirées de la carte
 * sont désactivées et non supprimées, des rendez-vous passés y faisant
 * référence.
 */

const prisma = new PrismaClient();
const eur = (e: number) => e * 100;

const DESCRIPTION_LISSAGE = `L'enzymothérapie est un lissage organique au tanin et aux enzymes, sans formol ni acide glyoxylique. Elle discipline, lisse et répare la fibre capillaire tout en conservant un résultat naturel.

Ses bienfaits :
• Répare et renforce les cheveux abîmés, secs ou poreux
• Apporte brillance, douceur et souplesse
• Réduit les frisottis et facilite le coiffage
• Convient aux cheveux bouclés, ondulés, frisés, crépus ou indisciplinés
• Respecte la nature du cheveu et ne l'alourdit pas
• Compatible avec colorations, mèches et henné
• Peut aider à redessiner les boucles et les ondulations

Le soin est thermoactif : un simple séchage au sèche-cheveux suffit ensuite pour obtenir un résultat lisse et soigné.

Durée : environ 2 à 6 mois, selon la nature du cheveu et l'entretien à la maison.

Résultat : des cheveux plus lisses, brillants, soyeux, résistants et faciles à coiffer, avec un aspect naturel.`;

/** Recherche par nom ET groupe : deux groupes peuvent porter le même libellé. */
async function majOption(
  nom: string,
  groupe: string,
  data: { prixCentimes?: number | null; dureeMinutes?: number; groupe?: string },
) {
  const o = await prisma.option.findFirst({ where: { nom, groupe: groupe as never } });
  if (!o) {
    console.log(`  introuvable : ${nom} [${groupe}]`);
    return null;
  }
  await prisma.option.update({ where: { id: o.id }, data: data as never });
  console.log(`  maj  ${nom} [${groupe}]`);
  return o.id;
}

async function main() {
  console.log("Tarifs revises :");
  await majOption("Rituel Coiffure Détente", "RITUEL_FEMME", { prixCentimes: eur(15) });
  await majOption("Hasta Prâna pendant le temps de pause", "BIEN_ETRE", { prixCentimes: eur(10) });

  // Le massage du cuir chevelu prolongé rejoint les rituels de soin : la
  // formule Bien-être les exclut déjà, ce qui évite de le reproposer alors
  // qu'il est compris.
  await majOption("Massage cuir chevelu prolongé", "BIEN_ETRE", { groupe: "RITUEL_FEMME" });

  console.log("\nAllongement couleur, tarif par longueur :");
  const allongement = await prisma.option.findFirst({ where: { nom: "Allongement couleur" } });
  if (allongement) {
    // prixCentimes à null : le tarif est alors lu dans les variantes.
    await prisma.option.update({
      where: { id: allongement.id },
      data: { prixCentimes: null },
    });
    const tarifs: [string, number][] = [
      ["COURT", 5],
      ["CARRE", 5],
      ["MI_LONG", 8],
      ["LONG", 8],
      ["TRES_LONG", 8],
    ];
    for (const [longueur, prix] of tarifs) {
      await prisma.optionLongueur.upsert({
        where: { optionId_longueur: { optionId: allongement.id, longueur: longueur as never } },
        update: { prixCentimes: eur(prix) },
        create: { optionId: allongement.id, longueur: longueur as never, prixCentimes: eur(prix) },
      });
      console.log(`  ${longueur.padEnd(10)} ${prix} E`);
    }
  }

  console.log("\nOptions retirees de la carte :");
  const retirees = await prisma.option.updateMany({
    where: { nom: "Rituel Détente Homme" },
    data: { actif: false },
  });
  console.log(`  ${retirees.count} option homme desactivee`);

  console.log("\nOption ajoutee pour les filles :");
  const existante = await prisma.option.findFirst({
    where: { nom: "Soin classique", groupe: "ENFANT" as never },
  });
  if (existante) {
    await prisma.option.update({
      where: { id: existante.id },
      data: { prixCentimes: eur(5), dureeMinutes: 10, actif: true },
    });
    console.log("  maj  Soin classique [ENFANT]");
  } else {
    await prisma.option.create({
      data: {
        nom: "Soin classique",
        description: "Soin démêlant et nourrissant appliqué après le shampooing.",
        groupe: "ENFANT" as never,
        prixCentimes: eur(5),
        dureeMinutes: 10,
        actif: true,
        ordre: 14,
      },
    });
    console.log("  cree Soin classique [ENFANT]");
  }

  console.log("\nDescriptif du lissage :");
  const lissage = await prisma.prestation.findFirst({ where: { estLissage: true } });
  if (lissage) {
    await prisma.prestation.update({
      where: { id: lissage.id },
      data: { description: DESCRIPTION_LISSAGE },
    });
    console.log(`  maj  ${lissage.nom}`);
  }

  console.log("\nEtat final des options actives :");
  const toutes = await prisma.option.findMany({
    where: { actif: true },
    select: { nom: true, groupe: true, prixCentimes: true, dureeMinutes: true },
    orderBy: [{ groupe: "asc" }, { ordre: "asc" }],
  });
  toutes.forEach((o) =>
    console.log(
      `  ${o.groupe.padEnd(13)} ${(o.prixCentimes === null ? "variable" : o.prixCentimes / 100 + " E").padStart(9)} ${String(o.dureeMinutes).padStart(3)} min  ${o.nom}`,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
