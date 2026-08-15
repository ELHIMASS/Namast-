"use server";

import { prisma } from "@/lib/prisma";

export async function ajouterPrestationsBelmakosmetik() {
  try {
    // Vérifie si les prestations existent déjà
    const existing = await prisma.prestation.findMany({
      where: {
        nom: { in: ["Shampooing adapté Belmakosmetik", "Soin profond Belmakosmetik"] },
      },
    });

    if (existing.length > 0) {
      return { ok: false, error: "Les prestations Belmakosmetik existent déjà." };
    }

    // Ajoute les deux prestations
    await prisma.prestation.createMany({
      data: [
        {
          nom: "Shampooing adapté Belmakosmetik",
          description: "Shampooing professionnel adapté à votre cuir chevelu et vos cheveux",
          categorie: "SOIN",
          profil: "FEMME",
          prixCentimes: 1500, // 15€
          dureeMinutes: 10,
          tempsNettoyageMinutes: 5,
          ordre: 1,
        },
        {
          nom: "Soin profond Belmakosmetik",
          description: "Soin réparateur intense aux produits Belmakosmetik avec massage",
          categorie: "SOIN",
          profil: "FEMME",
          prixCentimes: 3000, // 30€
          dureeMinutes: 15,
          tempsNettoyageMinutes: 5,
          ordre: 2,
        },
      ],
    });

    return { ok: true, message: "Prestations Belmakosmetik ajoutées avec succès." };
  } catch (error) {
    console.error("Erreur ajout prestations:", error);
    return { ok: false, error: "Erreur lors de l'ajout des prestations." };
  }
}
