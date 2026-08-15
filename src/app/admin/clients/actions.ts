"use server";

import { prisma } from "@/lib/prisma";

export async function getClientsAction() {
  return prisma.client.findMany({
    orderBy: { prenom: "asc" },
  });
}

export async function ajouterClientAction({
  nom,
  prenom,
  telephone,
  email,
  commentConnue,
}: {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  commentConnue?: string;
}) {
  if (!nom.trim() || !prenom.trim() || !email.trim()) {
    return { ok: false, error: "Nom, prénom et email sont obligatoires." };
  }

  try {
    const client = await prisma.client.create({
      data: {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim() || undefined,
        email: email.trim(),
        commentConnue: commentConnue?.trim() || undefined,
      },
    });
    return { ok: true, client };
  } catch (error) {
    return { ok: false, error: "Erreur lors de l'ajout du client." };
  }
}

export async function modifierClientAction({
  id,
  nom,
  prenom,
  telephone,
  email,
  commentConnue,
}: {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  commentConnue?: string;
}) {
  if (!nom.trim() || !prenom.trim() || !email.trim()) {
    return { ok: false, error: "Nom, prénom et email sont obligatoires." };
  }

  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim() || undefined,
        email: email.trim(),
        commentConnue: commentConnue?.trim() || undefined,
      },
    });
    return { ok: true, client };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la modification du client." };
  }
}

export async function supprimerClientAction(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Erreur lors de la suppression du client." };
  }
}
