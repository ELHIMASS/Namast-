import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const prestations = [
  { nom: "Coupe femme", categorie: "COUPE", dureeMinutes: 45, prixCentimes: 4500, tempsNettoyageMinutes: 10, ordre: 1 },
  { nom: "Coupe homme", categorie: "COUPE", dureeMinutes: 30, prixCentimes: 2800, tempsNettoyageMinutes: 10, ordre: 2 },
  { nom: "Coupe enfant", categorie: "COUPE", dureeMinutes: 25, prixCentimes: 2000, tempsNettoyageMinutes: 10, ordre: 3 },
  { nom: "Brushing", categorie: "COUPE", dureeMinutes: 30, prixCentimes: 2500, tempsNettoyageMinutes: 10, ordre: 4 },
  { nom: "Couleur", categorie: "COULEUR", dureeMinutes: 90, prixCentimes: 6500, tempsNettoyageMinutes: 15, ordre: 5 },
  { nom: "Mèches", categorie: "COULEUR", dureeMinutes: 105, prixCentimes: 7500, tempsNettoyageMinutes: 15, ordre: 6 },
  { nom: "Balayage", categorie: "COULEUR", dureeMinutes: 120, prixCentimes: 8500, tempsNettoyageMinutes: 15, ordre: 7 },
  { nom: "Patine", categorie: "COULEUR", dureeMinutes: 30, prixCentimes: 2500, tempsNettoyageMinutes: 15, ordre: 8 },
  { nom: "Soin capillaire", categorie: "SOIN", dureeMinutes: 30, prixCentimes: 3000, tempsNettoyageMinutes: 15, ordre: 9 },
  { nom: "Massage cuir chevelu", categorie: "MASSAGE", dureeMinutes: 20, prixCentimes: 2500, tempsNettoyageMinutes: 15, ordre: 10 },
  { nom: "Head Spa", categorie: "HEAD_SPA", dureeMinutes: 60, prixCentimes: 7000, tempsNettoyageMinutes: 20, ordre: 11 },
  { nom: "Coiffure événementielle", categorie: "EVENEMENTIEL", dureeMinutes: 60, prixCentimes: 6000, tempsNettoyageMinutes: 15, ordre: 12 },
] as const;

async function main() {
  for (const prestation of prestations) {
    await prisma.prestation.upsert({
      where: { id: prestation.nom },
      update: {},
      create: { id: prestation.nom, ...prestation },
    });
  }

  await prisma.client.upsert({
    where: { telephone: "0612345678" },
    update: {},
    create: {
      nom: "Martin",
      prenom: "Sophie",
      telephone: "0612345678",
      email: "sophie.martin@example.com",
      commentConnue: "Cliente historique du salon",
    },
  });

  console.log("Seed terminé : prestations + cliente de test (06 12 34 56 78).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
