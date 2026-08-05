import "dotenv/config";
import { randomInt } from "crypto";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function tirerCode(): string {
  let suffixe = "";
  for (let i = 0; i < 4; i++) suffixe += ALPHABET[randomInt(ALPHABET.length)];
  return `NAM-${suffixe}`;
}

/**
 * Attribue un code de gestion aux rendez-vous créés avant la mise en place de
 * l'espace cliente. Réexécutable sans risque : ne touche que les codes vides.
 */
async function main() {
  const sansCode = await prisma.rendezVous.findMany({
    where: { code: null },
    select: { id: true, dateDebut: true },
  });

  const pris = new Set(
    (
      await prisma.rendezVous.findMany({
        where: { code: { not: null } },
        select: { code: true },
      })
    ).map((r) => r.code as string),
  );

  for (const rdv of sansCode) {
    let code = tirerCode();
    while (pris.has(code)) code = tirerCode();
    pris.add(code);
    await prisma.rendezVous.update({ where: { id: rdv.id }, data: { code } });
    console.log(`${rdv.dateDebut.toISOString().slice(0, 16)} → ${code}`);
  }

  console.log(`\n${sansCode.length} rendez-vous complété(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
