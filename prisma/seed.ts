import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

type Longueur = "COURT" | "CARRE" | "MI_LONG" | "LONG" | "TRES_LONG";
type Densite = "FIN" | "NORMAL" | "EPAIS";

const LONGUEURS: Longueur[] = ["COURT", "CARRE", "MI_LONG", "LONG", "TRES_LONG"];

// Prestations femmes avec prix par longueur (COURT / CARRE / MI_LONG / LONG / TRES_LONG).
// Prix repris des tarifs réels fournis (Calendly). Durées estimées (⚠️ à ajuster).
const PRESTATIONS_FEMME_LONGUEUR: {
  nom: string;
  categorie: "COUPE" | "COULEUR";
  ordre: number;
  prix: number[];
  duree: number[];
}[] = [
  {
    nom: "Brushing",
    categorie: "COUPE",
    ordre: 1,
    prix: [2000, 2500, 3000, 3500, 4000],
    duree: [30, 35, 40, 45, 50],
  },
  {
    nom: "Coupe + Séchage",
    categorie: "COUPE",
    ordre: 2,
    prix: [2500, 3000, 3500, 4000, 4500],
    duree: [35, 40, 45, 50, 55],
  },
  {
    nom: "Coupe + Brushing",
    categorie: "COUPE",
    ordre: 3,
    prix: [3300, 3800, 4300, 4800, 5500],
    duree: [45, 50, 55, 60, 70],
  },
  {
    nom: "Couleur + Séchage",
    categorie: "COULEUR",
    ordre: 4,
    prix: [5000, 5500, 6000, 7000, 8000],
    duree: [90, 100, 110, 120, 130],
  },
  {
    nom: "Couleur + Brushing",
    categorie: "COULEUR",
    ordre: 5,
    prix: [6000, 6500, 7000, 8000, 8500],
    duree: [100, 110, 120, 130, 140],
  },
  {
    nom: "Couleur + Coupe + Séchage",
    categorie: "COULEUR",
    ordre: 6,
    prix: [6000, 6500, 7000, 8000, 9000],
    duree: [100, 110, 120, 130, 140],
  },
  {
    nom: "Couleur + Coupe + Brushing",
    categorie: "COULEUR",
    ordre: 7,
    prix: [6500, 7000, 7500, 8500, 9000],
    duree: [110, 120, 130, 140, 150],
  },
];

// Espace bien-être (prix/durées estimés ⚠️, noms non trouvés tels quels dans les tarifs fournis).
const PRESTATIONS_BIEN_ETRE = [
  {
    nom: "Head Spa Découverte",
    categorie: "HEAD_SPA" as const,
    prixCentimes: 7500,
    dureeMinutes: 50,
    ordre: 8,
  },
  {
    nom: "Head Spa Signature",
    categorie: "HEAD_SPA" as const,
    prixCentimes: 12000,
    dureeMinutes: 90,
    ordre: 9,
  },
  {
    nom: "Shiroschampi",
    categorie: "MASSAGE" as const,
    prixCentimes: 6500,
    dureeMinutes: 60,
    ordre: 10,
  },
  {
    nom: "Hasta Prâna",
    categorie: "MASSAGE" as const,
    prixCentimes: 5000,
    dureeMinutes: 50,
    ordre: 11,
  },
  {
    nom: "Rituel Ayurvédique complet",
    categorie: "MASSAGE" as const,
    prixCentimes: 9000,
    dureeMinutes: 75,
    ordre: 12,
  },
];

const PRESTATIONS_HOMME = [
  { nom: "Coupe Homme Essentielle", prixCentimes: 2200, dureeMinutes: 45, ordre: 1 },
  { nom: "Entretien Couronne", prixCentimes: 1500, dureeMinutes: 20, ordre: 2 },
];

// Prix réels (Calendly). Durées estimées ⚠️.
const PRESTATIONS_ENFANT = [
  { nom: "Bébé coupe (jusqu'à 5 ans)", prixCentimes: 1000, dureeMinutes: 20, ordre: 1 },
  { nom: "Fille Sh + Coupe (6-11 ans)", prixCentimes: 1800, dureeMinutes: 30, ordre: 2 },
  { nom: "Fille Sh + Coupe (12-15 ans)", prixCentimes: 2000, dureeMinutes: 35, ordre: 3 },
  { nom: "Fille Sh + Coupe (16-18 ans)", prixCentimes: 2500, dureeMinutes: 40, ordre: 4 },
  { nom: "Garçon coupe tondeuse (6-15 ans)", prixCentimes: 1700, dureeMinutes: 25, ordre: 5 },
  { nom: "Ado coupe fondu tondeuse (16-18 ans)", prixCentimes: 1900, dureeMinutes: 30, ordre: 6 },
];

// Matrice de tarifs lissage — entièrement estimée ⚠️ (aucune donnée fournie).
const LISSAGE_MATRICE: { longueur: Longueur; densite: Densite; prixCentimes: number; dureeMinutes: number }[] = [
  { longueur: "COURT", densite: "FIN", prixCentimes: 8000, dureeMinutes: 60 },
  { longueur: "COURT", densite: "NORMAL", prixCentimes: 9000, dureeMinutes: 75 },
  { longueur: "COURT", densite: "EPAIS", prixCentimes: 10000, dureeMinutes: 90 },
  { longueur: "MI_LONG", densite: "FIN", prixCentimes: 11000, dureeMinutes: 90 },
  { longueur: "MI_LONG", densite: "NORMAL", prixCentimes: 13000, dureeMinutes: 105 },
  { longueur: "MI_LONG", densite: "EPAIS", prixCentimes: 15000, dureeMinutes: 120 },
  { longueur: "LONG", densite: "FIN", prixCentimes: 15000, dureeMinutes: 120 },
  { longueur: "LONG", densite: "NORMAL", prixCentimes: 17000, dureeMinutes: 135 },
  { longueur: "LONG", densite: "EPAIS", prixCentimes: 19000, dureeMinutes: 150 },
  { longueur: "TRES_LONG", densite: "FIN", prixCentimes: 19000, dureeMinutes: 150 },
  { longueur: "TRES_LONG", densite: "NORMAL", prixCentimes: 21000, dureeMinutes: 165 },
  { longueur: "TRES_LONG", densite: "EPAIS", prixCentimes: 23000, dureeMinutes: 180 },
];

// Options additionnelles. prixCentimes=null => tarif variable par longueur (voir variantes).
const OPTIONS: {
  nom: string;
  groupe: "RITUEL_FEMME" | "BIEN_ETRE" | "COIFFAGE" | "COULEUR" | "HOMME";
  description: string;
  prixCentimes: number | null;
  dureeMinutes: number;
  ordre: number;
  variantes?: Partial<Record<Longueur, number>>;
}[] = [
  {
    nom: "Rituel Coiffure Détente",
    groupe: "RITUEL_FEMME",
    description: "Bac massant, massage cuir chevelu, soin Belmakosmetik, moment relaxation.",
    prixCentimes: 1000,
    dureeMinutes: 10,
    ordre: 1,
  },
  {
    nom: "Massage cuir chevelu prolongé",
    groupe: "BIEN_ETRE",
    description: "",
    prixCentimes: 1000,
    dureeMinutes: 10,
    ordre: 2,
  },
  {
    nom: "Massage des mains pendant la pause couleur",
    groupe: "BIEN_ETRE",
    description: "",
    prixCentimes: 1000,
    dureeMinutes: 10,
    ordre: 3,
  },
  {
    nom: "Wavy",
    groupe: "COIFFAGE",
    description: "",
    prixCentimes: null,
    dureeMinutes: 10,
    ordre: 4,
    variantes: { COURT: 500, CARRE: 500, MI_LONG: 1000, LONG: 1500, TRES_LONG: 1500 },
  },
  {
    nom: "Gloss / Patine",
    groupe: "COULEUR",
    description: "",
    prixCentimes: 1500,
    dureeMinutes: 15,
    ordre: 5,
  },
  {
    nom: "Allongement couleur",
    groupe: "COULEUR",
    description: "",
    prixCentimes: 800,
    dureeMinutes: 10,
    ordre: 6,
  },
  {
    nom: "Rituel Détente Homme",
    groupe: "HOMME",
    description: "Bac massant, massage cuir chevelu, soin.",
    prixCentimes: 1000,
    dureeMinutes: 10,
    ordre: 7,
  },
];

async function main() {
  // --- Prestations femmes avec variantes de longueur ---
  for (const p of PRESTATIONS_FEMME_LONGUEUR) {
    const prestation = await prisma.prestation.upsert({
      where: { id: p.nom },
      update: {
        categorie: p.categorie,
        profil: "FEMME",
        prixCentimes: p.prix[0],
        dureeMinutes: p.duree[0],
        tempsNettoyageMinutes: p.categorie === "COULEUR" ? 15 : 10,
        ordre: p.ordre,
      },
      create: {
        id: p.nom,
        nom: p.nom,
        categorie: p.categorie,
        profil: "FEMME",
        prixCentimes: p.prix[0],
        dureeMinutes: p.duree[0],
        tempsNettoyageMinutes: p.categorie === "COULEUR" ? 15 : 10,
        ordre: p.ordre,
      },
    });

    for (let i = 0; i < LONGUEURS.length; i++) {
      await prisma.prestationLongueur.upsert({
        where: { prestationId_longueur: { prestationId: prestation.id, longueur: LONGUEURS[i] } },
        update: { prixCentimes: p.prix[i], dureeMinutes: p.duree[i] },
        create: {
          prestationId: prestation.id,
          longueur: LONGUEURS[i],
          prixCentimes: p.prix[i],
          dureeMinutes: p.duree[i],
        },
      });
    }
  }

  // --- Lissage Belmakosmetik (prix géré par la matrice, pas par longueur simple) ---
  const lissage = await prisma.prestation.upsert({
    where: { id: "Lissage Belmakosmetik" },
    update: {
      categorie: "SOIN",
      profil: "FEMME",
      estLissage: true,
      prixCentimes: LISSAGE_MATRICE[0].prixCentimes,
      dureeMinutes: LISSAGE_MATRICE[0].dureeMinutes,
      tempsNettoyageMinutes: 20,
      ordre: 20,
    },
    create: {
      id: "Lissage Belmakosmetik",
      nom: "Lissage Belmakosmetik",
      categorie: "SOIN",
      profil: "FEMME",
      estLissage: true,
      prixCentimes: LISSAGE_MATRICE[0].prixCentimes,
      dureeMinutes: LISSAGE_MATRICE[0].dureeMinutes,
      tempsNettoyageMinutes: 20,
      ordre: 20,
    },
  });
  void lissage;

  for (const t of LISSAGE_MATRICE) {
    await prisma.lissageTarif.upsert({
      where: { longueur_densite: { longueur: t.longueur, densite: t.densite } },
      update: { prixCentimes: t.prixCentimes, dureeMinutes: t.dureeMinutes },
      create: t,
    });
  }

  // --- Espace bien-être ---
  for (const p of PRESTATIONS_BIEN_ETRE) {
    await prisma.prestation.upsert({
      where: { id: p.nom },
      update: {
        categorie: p.categorie,
        profil: "FEMME",
        prixCentimes: p.prixCentimes,
        dureeMinutes: p.dureeMinutes,
        tempsNettoyageMinutes: 20,
        ordre: p.ordre,
      },
      create: {
        id: p.nom,
        nom: p.nom,
        categorie: p.categorie,
        profil: "FEMME",
        prixCentimes: p.prixCentimes,
        dureeMinutes: p.dureeMinutes,
        tempsNettoyageMinutes: 20,
        ordre: p.ordre,
      },
    });
  }

  // --- Hommes ---
  for (const p of PRESTATIONS_HOMME) {
    await prisma.prestation.upsert({
      where: { id: p.nom },
      update: {
        categorie: "COUPE",
        profil: "HOMME",
        prixCentimes: p.prixCentimes,
        dureeMinutes: p.dureeMinutes,
        tempsNettoyageMinutes: 10,
        ordre: p.ordre,
      },
      create: {
        id: p.nom,
        nom: p.nom,
        categorie: "COUPE",
        profil: "HOMME",
        prixCentimes: p.prixCentimes,
        dureeMinutes: p.dureeMinutes,
        tempsNettoyageMinutes: 10,
        ordre: p.ordre,
      },
    });
  }

  // --- Enfants (réservation mercredi uniquement, géré côté application) ---
  for (const p of PRESTATIONS_ENFANT) {
    await prisma.prestation.upsert({
      where: { id: p.nom },
      update: {
        categorie: "COUPE",
        profil: "ENFANT",
        prixCentimes: p.prixCentimes,
        dureeMinutes: p.dureeMinutes,
        tempsNettoyageMinutes: 10,
        ordre: p.ordre,
      },
      create: {
        id: p.nom,
        nom: p.nom,
        categorie: "COUPE",
        profil: "ENFANT",
        prixCentimes: p.prixCentimes,
        dureeMinutes: p.dureeMinutes,
        tempsNettoyageMinutes: 10,
        ordre: p.ordre,
      },
    });
  }

  // --- Options ---
  for (const o of OPTIONS) {
    const option = await prisma.option.upsert({
      where: { id: o.nom },
      update: {
        groupe: o.groupe,
        description: o.description || undefined,
        prixCentimes: o.prixCentimes,
        dureeMinutes: o.dureeMinutes,
        ordre: o.ordre,
      },
      create: {
        id: o.nom,
        nom: o.nom,
        groupe: o.groupe,
        description: o.description || undefined,
        prixCentimes: o.prixCentimes,
        dureeMinutes: o.dureeMinutes,
        ordre: o.ordre,
      },
    });

    if (o.variantes) {
      for (const [longueur, prixCentimes] of Object.entries(o.variantes)) {
        await prisma.optionLongueur.upsert({
          where: {
            optionId_longueur: { optionId: option.id, longueur: longueur as Longueur },
          },
          update: { prixCentimes },
          create: { optionId: option.id, longueur: longueur as Longueur, prixCentimes },
        });
      }
    }
  }

  // --- Cliente de test ---
  // Le téléphone n'étant plus unique, on cherche la fiche avant de la créer.
  const clienteTest = await prisma.client.findFirst({
    where: { nom: "Martin", prenom: "Sophie" },
  });
  if (!clienteTest) {
    await prisma.client.create({
      data: {
        nom: "Martin",
        prenom: "Sophie",
        telephone: "0612345678",
        email: "sophie.martin@example.com",
        commentConnue: "Cliente historique du salon",
      },
    });
  }

  console.log("Seed terminé : carte finale (femmes/hommes/enfants, options, lissage).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
