import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

/**
 * Carte du salon relevée sur les plaquettes d'août 2026 : bar à soins,
 * massages ayurvédiques, lissage à l'enzymothérapie, coupes enfants et
 * options.
 *
 *   npx tsx prisma/seedCarte2026.ts
 *
 * Idempotent : les prestations sont repérées par leur nom, mises à jour si
 * elles existent, créées sinon. Les anciennes remplacées sont désactivées et
 * non supprimées, des rendez-vous passés y faisant référence.
 */

const prisma = new PrismaClient();
const eur = (e: number) => e * 100;

// ── Bar à soins ───────────────────────────────────────────────────────────────
// Les tarifs sont donnés en fourchette sur la plaquette : le tarif de base
// retient la borne basse, le site l'affiche donc « dès X € ». Les durées
// retiennent la borne haute, conformément à la consigne du salon (mieux vaut
// prévoir large). Pour les deux soins botox, le brushing compris est compté
// 30 min en plus du temps de pose.
const SOINS = [
  { nom: "Soin express", prix: 20, duree: 20, ordre: 21,
    description: "Réparation de la fibre capillaire et légère discipline du cheveu. Pour cheveux déshydratés et abîmés par les colorations. Effet 2 à 4 semaines." },
  { nom: "Soin hydratant", prix: 20, duree: 30, ordre: 22,
    description: "Hydratation externe intense, pour cheveux légèrement secs. Effet une semaine." },
  { nom: "Soin réparateur", prix: 20, duree: 30, ordre: 23,
    description: "Réparation intense de la fibre et solidité retrouvée, pour cheveux élastiques et cassants. Effet 2 à 3 semaines." },
  { nom: "Soin le complet", prix: 50, duree: 40, ordre: 24,
    description: "Réparation, solidité retrouvée et hydratation intense, pour cheveux élastiques, cassants et déshydratés. Effet 2 à 3 semaines." },
  { nom: "Soin botox", prix: 100, duree: 75, ordre: 25,
    description: "Réparation intense externe et interne, avec légère discipline du cheveu. Brushing compris. Effet 4 à 8 semaines selon l'entretien à domicile." },
  { nom: "Soin botox Parfait", prix: 100, duree: 150, ordre: 26,
    description: "Réparation intense et réduction de volume, pour cheveux déshydratés, élastiques, cassants ou abîmés. Brushing compris. Effet 4 à 8 semaines." },
];

// ── Massages ayurvédiques ─────────────────────────────────────────────────────
const MASSAGES = [
  { nom: "Massage Découverte", prix: 15, duree: 10, ordre: 31,
    description: "10 min assis, pour découvrir le massage ayurvédique." },
  { nom: "Shiroschampi", prix: 40, duree: 30, ordre: 32,
    description: "10 min assis puis 20 min allongée : massage du cuir chevelu." },
  { nom: "Shiroschampi + Hasta Prâna", prix: 60, duree: 50, ordre: 33,
    description: "10 min assis, 20 min allongée sur le cuir chevelu, puis 20 min de massage des mains." },
  { nom: "Shiroschampi complet", prix: 70, duree: 60, ordre: 34,
    description: "10 min assis puis 50 min allongée : le rituel complet." },
  { nom: "Hasta Prâna", prix: 25, duree: 20, ordre: 35,
    description: "Massage des mains, 20 minutes." },
];

/** Anciens massages remplacés par la carte ci-dessus. */
const MASSAGES_RETIRES = ["Rituel Ayurvédique complet"];

// ── Lissage à l'enzymothérapie ────────────────────────────────────────────────
// Matrice longueur x densité relevée sur la plaquette. « Très longs ou très
// épais » n'a qu'un seul tarif, appliqué aux trois densités. Durées : la
// plaquette annonce 2 à 5 heures selon longueur et épaisseur.
const LISSAGE: Record<string, { prix: number; duree: number }[]> = {
  //                    FIN                NORMAL             EPAIS
  COURT: [{ prix: 190, duree: 120 }, { prix: 230, duree: 135 }, { prix: 270, duree: 150 }],
  MI_LONG: [{ prix: 260, duree: 180 }, { prix: 300, duree: 195 }, { prix: 340, duree: 210 }],
  LONG: [{ prix: 320, duree: 240 }, { prix: 360, duree: 255 }, { prix: 400, duree: 270 }],
  TRES_LONG: [{ prix: 450, duree: 300 }, { prix: 450, duree: 300 }, { prix: 450, duree: 300 }],
};
const DENSITES = ["FIN", "NORMAL", "EPAIS"] as const;

const DESCRIPTION_LISSAGE = `Lissage organique au tanin enrichi en enzymes, catalyseurs naturels extraits de fruits. Sans formol ni acide glyoxylique, il n'altère pas la fibre du cheveu : il la renforce, comble les aspérités dues aux agressions mécaniques, thermiques ou chimiques, et répare de 80 à 100 % dès la première pose.

Convient à tous les cheveux — frisés, ondulés, crépus, bouclés, épais, abîmés, secs, poreux ou indisciplinés — et s'allie aux mèches, couleurs, défrisages et henné. Il peut être posé sans modifier les couleurs, et n'a aucune contre-indication, y compris pour les femmes enceintes.

Le résultat est thermoactif : un simple séchage suffit, sans plaques. Séché à l'air libre, il donne un effet wavy. Tenue de 2 à 6 mois selon l'entretien à domicile. Shampooing et soin argan compris.`;

async function poserPrestation(p: {
  nom: string; prix: number; duree: number; ordre: number; description: string;
  categorie: "SOIN" | "MASSAGE"; profil: "FEMME";
}) {
  const existante = await prisma.prestation.findFirst({ where: { nom: p.nom } });
  const donnees = {
    nom: p.nom,
    description: p.description,
    categorie: p.categorie,
    profil: p.profil,
    prixCentimes: eur(p.prix),
    dureeMinutes: p.duree,
    actif: true,
    ordre: p.ordre,
  };
  if (existante) {
    await prisma.prestation.update({ where: { id: existante.id }, data: donnees });
    console.log(`  maj    ${p.prix} E  ${p.duree} min  ${p.nom}`);
  } else {
    await prisma.prestation.create({ data: donnees });
    console.log(`  cree   ${p.prix} E  ${p.duree} min  ${p.nom}`);
  }
}

async function poserOption(o: {
  nom: string; groupe: string; prix: number; duree: number; ordre: number; description: string;
}) {
  const existante = await prisma.option.findFirst({ where: { nom: o.nom } });
  const donnees = {
    nom: o.nom,
    description: o.description,
    groupe: o.groupe as never,
    prixCentimes: eur(o.prix),
    dureeMinutes: o.duree,
    actif: true,
    ordre: o.ordre,
  };
  if (existante) {
    await prisma.option.update({ where: { id: existante.id }, data: donnees });
    console.log(`  maj    ${o.prix} E  ${o.duree} min  ${o.nom}  [${o.groupe}]`);
  } else {
    await prisma.option.create({ data: donnees });
    console.log(`  cree   ${o.prix} E  ${o.duree} min  ${o.nom}  [${o.groupe}]`);
  }
}

async function main() {
  console.log("Bar a soins :");
  for (const s of SOINS) {
    await poserPrestation({ ...s, categorie: "SOIN", profil: "FEMME" });
  }

  console.log("\nMassages ayurvediques :");
  for (const m of MASSAGES) {
    await poserPrestation({ ...m, categorie: "MASSAGE", profil: "FEMME" });
  }
  const { count: retires } = await prisma.prestation.updateMany({
    where: { nom: { in: MASSAGES_RETIRES } },
    data: { actif: false },
  });
  if (retires) console.log(`  ${retires} ancien massage desactive (historique conserve)`);

  console.log("\nLissage a l'enzymotherapie :");
  const lissage = await prisma.prestation.findFirst({ where: { estLissage: true } });
  if (lissage) {
    await prisma.prestation.update({
      where: { id: lissage.id },
      data: {
        nom: "Lissage à l'enzymothérapie",
        description: DESCRIPTION_LISSAGE,
        prixCentimes: eur(190),
        dureeMinutes: 120,
      },
    });
    for (const [longueur, tarifs] of Object.entries(LISSAGE)) {
      for (let i = 0; i < DENSITES.length; i++) {
        await prisma.lissageTarif.upsert({
          where: { longueur_densite: { longueur: longueur as never, densite: DENSITES[i] } },
          update: { prixCentimes: eur(tarifs[i].prix), dureeMinutes: tarifs[i].duree },
          create: {
            longueur: longueur as never,
            densite: DENSITES[i],
            prixCentimes: eur(tarifs[i].prix),
            dureeMinutes: tarifs[i].duree,
          },
        });
      }
      console.log(`  ${longueur.padEnd(10)} ${tarifs.map((t) => t.prix + " E").join(" / ")}`);
    }
  }

  console.log("\nCoupes garcons (40 min) :");
  const garcons = await prisma.prestation.updateMany({
    where: { profil: "ENFANT", nom: { contains: "arçon" } },
    data: { dureeMinutes: 40 },
  });
  const ados = await prisma.prestation.updateMany({
    where: { profil: "ENFANT", nom: { contains: "Ado coupe" } },
    data: { dureeMinutes: 40 },
  });
  console.log(`  ${garcons.count + ados.count} coupe(s) portee(s) a 40 min`);

  console.log("\nOptions :");
  await poserOption({
    nom: "Shampooing bac massant + modelage du cuir chevelu",
    groupe: "HOMME", prix: 5, duree: 10, ordre: 11,
    description: "Shampooing au bac massant suivi d'un modelage du cuir chevelu.",
  });
  await poserOption({
    nom: "Brushing ou wavy",
    groupe: "ENFANT", prix: 5, duree: 10, ordre: 12,
    description: "Brushing ou effet wavy en finition.",
  });
  await poserOption({
    nom: "Hasta Prâna pendant le temps de pause",
    groupe: "BIEN_ETRE", prix: 15, duree: 15, ordre: 13,
    description: "Massage des mains pendant la pause d'une couleur ou d'un soin.",
  });
  // Remplacée par l'option ci-dessus, plus longue et au tarif révisé.
  const { count: opRetirees } = await prisma.option.updateMany({
    where: { nom: "Massage des mains pendant la pause couleur" },
    data: { actif: false },
  });
  if (opRetirees) console.log(`  ${opRetirees} ancienne option desactivee`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
