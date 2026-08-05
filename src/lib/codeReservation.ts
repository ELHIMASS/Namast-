import { randomInt } from "crypto";
import { prisma } from "./prisma";

// Alphabet sans caractères ambigus à l'oral ou à la lecture (ni O/0, ni I/1/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LONGUEUR = 4;

function tirerCode(): string {
  let suffixe = "";
  for (let i = 0; i < LONGUEUR; i++) {
    suffixe += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `NAM-${suffixe}`;
}

/** Normalise la saisie de la cliente : casse, espaces et tiret facultatif. */
export function normaliserCode(saisie: string): string {
  const brut = saisie.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sansPrefixe = brut.startsWith("NAM") ? brut.slice(3) : brut;
  return `NAM-${sansPrefixe}`;
}

/**
 * Tire un code encore libre. La collision est très improbable
 * (31^4 ≈ 920 000 combinaisons) mais on vérifie quand même.
 */
export async function genererCodeUnique(): Promise<string> {
  for (let essai = 0; essai < 8; essai++) {
    const code = tirerCode();
    const existe = await prisma.rendezVous.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existe) return code;
  }
  // Repli : on suffixe par l'horodatage, qui ne peut pas entrer en collision.
  return `NAM-${Date.now().toString(36).toUpperCase()}`;
}
