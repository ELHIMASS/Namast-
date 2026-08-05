import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const LONGUEURS = ["COURT", "CARRE", "MI_LONG", "LONG", "TRES_LONG"] as const;

type Pack = {
  nom: string;
  categorie: "COUPE" | "COULEUR";
  ordre: number;
  /** Prix en centimes, dans l'ordre des longueurs ci-dessus. */
  prix: number[];
  /** Durées en minutes, même ordre. */
  duree: number[];
};

// Tarifs relevés sur la plaquette « Coiffure Essentielle ».
// Comprend : shampooing adapté, soin classique, coupe et/ou coiffage.
const ESSENTIELLE: Pack[] = [
  { nom: "Brushing Essentiel", categorie: "COUPE", ordre: 1,
    prix: [2000, 2500, 3000, 3500, 4000], duree: [30, 45, 45, 45, 60] },
  { nom: "Coupe + Séchage Essentiel", categorie: "COUPE", ordre: 2,
    prix: [2700, 3200, 3700, 4200, 4700], duree: [45, 60, 60, 75, 90] },
  { nom: "Coupe + Brushing Essentiel", categorie: "COUPE", ordre: 3,
    prix: [3200, 3700, 4200, 4700, 5200], duree: [60, 60, 75, 75, 105] },
  { nom: "Couleur + Séchage Essentiel", categorie: "COULEUR", ordre: 4,
    prix: [5500, 6500, 7500, 9000, 9500], duree: [90, 105, 105, 120, 135] },
  { nom: "Couleur + Brushing Essentiel", categorie: "COULEUR", ordre: 5,
    prix: [6000, 7000, 8000, 9500, 10000], duree: [90, 105, 105, 120, 135] },
  { nom: "Couleur + Coupe + Séchage Essentiel", categorie: "COULEUR", ordre: 6,
    prix: [8200, 9200, 10200, 11700, 12200], duree: [120, 135, 150, 165, 180] },
  { nom: "Couleur + Coupe + Brushing Essentiel", categorie: "COULEUR", ordre: 7,
    prix: [8700, 9700, 10700, 12200, 12700], duree: [135, 150, 165, 180, 195] },
];

// Tarifs relevés sur la plaquette « Coiffure Bien-être ». Mêmes prestations,
// enrichies du soin Belmakosmetik, du bac massant et du massage du cuir chevelu.
const BIEN_ETRE: Pack[] = [
  { nom: "Brushing Bien-être", categorie: "COUPE", ordre: 11,
    prix: [2500, 3000, 3500, 4000, 4500], duree: [45, 45, 50, 50, 60] },
  { nom: "Coupe + Séchage Bien-être", categorie: "COUPE", ordre: 12,
    prix: [3700, 4200, 4700, 5200, 5700], duree: [55, 70, 70, 85, 100] },
  { nom: "Coupe + Brushing Bien-être", categorie: "COUPE", ordre: 13,
    prix: [4700, 5200, 5700, 6200, 7000], duree: [60, 60, 75, 75, 105] },
  { nom: "Couleur + Séchage Bien-être", categorie: "COULEUR", ordre: 14,
    prix: [6500, 7500, 8500, 10000, 10500], duree: [100, 115, 115, 130, 145] },
  { nom: "Couleur + Brushing Bien-être", categorie: "COULEUR", ordre: 15,
    prix: [6500, 7500, 8500, 10000, 10500], duree: [105, 120, 120, 135, 150] },
  { nom: "Couleur + Coupe + Séchage Bien-être", categorie: "COULEUR", ordre: 16,
    prix: [8500, 9500, 10500, 12000, 12500], duree: [130, 145, 160, 175, 190] },
  { nom: "Couleur + Coupe + Brushing Bien-être", categorie: "COULEUR", ordre: 17,
    prix: [9000, 10000, 11000, 12500, 13500], duree: [135, 150, 165, 180, 195] },
];

const DESCRIPTION = {
  ESSENTIELLE:
    "Formule Essentielle : shampooing adapté, soin classique, coupe et/ou coiffage.",
  BIEN_ETRE:
    "Formule Bien-être : shampooing adapté, soin professionnel Belmakosmetik, bac massant, massage relaxant du cuir chevelu et temps de détente personnalisé.",
} as const;

// Anciennes prestations femmes, remplacées par les deux formules. On les
// désactive au lieu de les supprimer : les rendez-vous passés y font référence.
const REMPLACEES = [
  "Brushing",
  "Coupe + Séchage",
  "Coupe + Brushing",
  "Couleur + Séchage",
  "Couleur + Brushing",
  "Couleur + Coupe + Séchage",
  "Couleur + Coupe + Brushing",
];

async function poserPack(packs: Pack[], formule: "ESSENTIELLE" | "BIEN_ETRE") {
  for (const p of packs) {
    const existante = await prisma.prestation.findFirst({ where: { nom: p.nom } });

    const donnees = {
      nom: p.nom,
      description: DESCRIPTION[formule],
      categorie: p.categorie,
      profil: "FEMME" as const,
      formule,
      // Le prix de base reprend la longueur la plus courte ; les variantes
      // ci-dessous prennent le relais dès qu'une longueur est choisie.
      prixCentimes: p.prix[0],
      dureeMinutes: p.duree[0],
      actif: true,
      ordre: p.ordre,
    };

    const prestation = existante
      ? await prisma.prestation.update({ where: { id: existante.id }, data: donnees })
      : await prisma.prestation.create({ data: donnees });

    for (let i = 0; i < LONGUEURS.length; i++) {
      await prisma.prestationLongueur.upsert({
        where: {
          prestationId_longueur: {
            prestationId: prestation.id,
            longueur: LONGUEURS[i],
          },
        },
        update: { prixCentimes: p.prix[i], dureeMinutes: p.duree[i] },
        create: {
          prestationId: prestation.id,
          longueur: LONGUEURS[i],
          prixCentimes: p.prix[i],
          dureeMinutes: p.duree[i],
        },
      });
    }

    console.log(`  ✓ ${p.nom}`);
  }
}

async function main() {
  console.log("Formule Essentielle :");
  await poserPack(ESSENTIELLE, "ESSENTIELLE");

  console.log("\nFormule Bien-être :");
  await poserPack(BIEN_ETRE, "BIEN_ETRE");

  const { count } = await prisma.prestation.updateMany({
    where: { nom: { in: REMPLACEES }, profil: "FEMME" },
    data: { actif: false },
  });
  console.log(`\n${count} ancienne(s) prestation(s) désactivée(s) (historique conservé).`);

  const actives = await prisma.prestation.count({ where: { actif: true, formule: { not: null } } });
  console.log(`${actives} prestations de formule actives.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
