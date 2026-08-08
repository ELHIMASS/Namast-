import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

/**
 * Barème femme du salon : formules « Privilège » et « Bien-être ».
 *
 *   npx tsx prisma/seedTarifs.ts
 *
 * Relevé sur les plaquettes tarifaires. Les durées entre parenthèses dans les
 * commentaires sont estimées : elles étaient illisibles (ratures) sur deux
 * lignes. L'estimation suit la logique interne des feuilles, où l'ajout d'une
 * coupe vaut +15 min (écart constant entre « Mèches + Brushing » et
 * « Mèches + Coupe + Brushing », et entre les deux lignes « Ombré »).
 */

const prisma = new PrismaClient();

const LONGUEURS = ["COURT", "CARRE", "MI_LONG", "LONG", "TRES_LONG"] as const;

type Tarif = {
  nom: string;
  categorie: "COUPE" | "COULEUR";
  ordre: number;
  /** Prix en euros, dans l'ordre des longueurs ci-dessus. */
  prix: number[];
  /** Durées en minutes, même ordre. */
  duree: number[];
  /** Vrai si les durées ont été estimées et non relevées. */
  dureeEstimee?: boolean;
};

// Tarifs Privilège — soin classique inclus.
const PRIVILEGE: Tarif[] = [
  { nom: "Shampoing + Brushing", categorie: "COUPE", ordre: 1,
    prix: [25, 30, 35, 40, 45], duree: [30, 40, 45, 45, 60] },
  { nom: "Shampoing + Coupe + Brushing", categorie: "COUPE", ordre: 2,
    prix: [35, 40, 45, 50, 55], duree: [45, 55, 60, 60, 75], dureeEstimee: true },
  { nom: "Shampoing + Couleur + Brushing", categorie: "COULEUR", ordre: 3,
    prix: [55, 60, 65, 70, 75], duree: [90, 90, 90, 105, 105], dureeEstimee: true },
  { nom: "Shampoing + Couleur + Coupe + Brushing", categorie: "COULEUR", ordre: 4,
    prix: [65, 70, 75, 85, 95], duree: [105, 105, 105, 120, 120] },
  { nom: "Shampoing + Mèches + Brushing", categorie: "COULEUR", ordre: 5,
    prix: [70, 80, 90, 105, 120], duree: [165, 165, 165, 180, 180] },
  { nom: "Shampoing + Mèches + Coupe + Brushing", categorie: "COULEUR", ordre: 6,
    prix: [80, 90, 100, 120, 130], duree: [180, 180, 180, 195, 195] },
  { nom: "Shampoing + Ombré / Couleur + Mèches + Brushing", categorie: "COULEUR", ordre: 7,
    prix: [95, 105, 115, 130, 145], duree: [180, 180, 180, 195, 195] },
  { nom: "Shampoing + Ombré / Couleur + Mèches + Coupe + Brushing", categorie: "COULEUR", ordre: 8,
    prix: [105, 115, 125, 140, 155], duree: [195, 195, 195, 210, 210] },
];

// Tarifs Bien-être — soin profond, bac massant et modelage du cuir chevelu.
const BIEN_ETRE: Tarif[] = [
  { nom: "Shampoing + Brushing", categorie: "COUPE", ordre: 11,
    prix: [40, 45, 50, 60, 65], duree: [45, 55, 60, 60, 75] },
  { nom: "Shampoing + Coupe + Brushing", categorie: "COUPE", ordre: 12,
    prix: [50, 55, 60, 65, 70], duree: [60, 70, 75, 75, 90], dureeEstimee: true },
  { nom: "Shampoing + Couleur + Brushing", categorie: "COULEUR", ordre: 13,
    prix: [70, 75, 80, 85, 90], duree: [120, 120, 120, 135, 135], dureeEstimee: true },
  { nom: "Shampoing + Couleur + Coupe + Brushing", categorie: "COULEUR", ordre: 14,
    prix: [80, 85, 90, 100, 110], duree: [135, 135, 135, 150, 150] },
  { nom: "Shampoing + Mèches + Brushing", categorie: "COULEUR", ordre: 15,
    prix: [85, 95, 105, 120, 135], duree: [180, 180, 180, 210, 210] },
  { nom: "Shampoing + Mèches + Coupe + Brushing", categorie: "COULEUR", ordre: 16,
    prix: [95, 105, 115, 130, 140], duree: [195, 195, 195, 210, 210] },
  { nom: "Shampoing + Ombré / Couleur + Mèches + Brushing", categorie: "COULEUR", ordre: 17,
    prix: [110, 120, 130, 145, 160], duree: [210, 210, 210, 225, 225] },
  { nom: "Shampoing + Ombré / Couleur + Mèches + Coupe + Brushing", categorie: "COULEUR", ordre: 18,
    prix: [120, 130, 140, 155, 170], duree: [210, 210, 210, 240, 240] },
];

const DESCRIPTION = {
  PRIVILEGE: "Tarifs Privilège : shampooing adapté et soin classique inclus.",
  BIEN_ETRE:
    "Tarifs Bien-être : shampooing adapté, soin profond, bac massant et modelage du cuir chevelu.",
} as const;

async function poser(tarifs: Tarif[], formule: "PRIVILEGE" | "BIEN_ETRE") {
  for (const t of tarifs) {
    const existante = await prisma.prestation.findFirst({
      where: { nom: t.nom, formule },
    });

    const donnees = {
      nom: t.nom,
      description: DESCRIPTION[formule],
      categorie: t.categorie,
      profil: "FEMME" as const,
      formule,
      // Le tarif de base reprend la longueur la plus courte ; les variantes
      // ci-dessous prennent le relais dès qu'une longueur est choisie.
      prixCentimes: t.prix[0] * 100,
      dureeMinutes: t.duree[0],
      actif: true,
      ordre: t.ordre,
    };

    const prestation = existante
      ? await prisma.prestation.update({ where: { id: existante.id }, data: donnees })
      : await prisma.prestation.create({ data: donnees });

    for (let i = 0; i < LONGUEURS.length; i++) {
      await prisma.prestationLongueur.upsert({
        where: {
          prestationId_longueur: { prestationId: prestation.id, longueur: LONGUEURS[i] },
        },
        update: { prixCentimes: t.prix[i] * 100, dureeMinutes: t.duree[i] },
        create: {
          prestationId: prestation.id,
          longueur: LONGUEURS[i],
          prixCentimes: t.prix[i] * 100,
          dureeMinutes: t.duree[i],
        },
      });
    }

    console.log(
      `  ${t.prix[0]}-${t.prix[4]} €  ${t.nom}${t.dureeEstimee ? "   (durees estimees)" : ""}`,
    );
  }
}

async function main() {
  console.log("Tarifs Privilege :");
  await poser(PRIVILEGE, "PRIVILEGE");
  console.log("\nTarifs Bien-etre :");
  await poser(BIEN_ETRE, "BIEN_ETRE");

  const total = await prisma.prestation.count({ where: { formule: { not: null }, actif: true } });
  const variantes = await prisma.prestationLongueur.count({
    where: { prestation: { formule: { not: null } } },
  });
  console.log(`\n${total} prestations de formule actives, ${variantes} variantes de longueur.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
