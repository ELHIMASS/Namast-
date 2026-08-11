import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

/**
 * Retire « + Brushing » du nom des prestations de coiffure : la finition
 * n'est plus dans le titre, elle est demandée à la cliente au moment du
 * choix (brushing ou séchage, tous deux compris).
 *
 * « Shampoing + Brushing » n'est pas touchée : le brushing y est l'objet
 * même de la prestation, pas sa finition.
 */
const prisma = new PrismaClient();

async function main() {
  const prestations = await prisma.prestation.findMany({
    where: { formule: { not: null } },
    select: { id: true, nom: true },
    orderBy: { ordre: "asc" },
  });

  for (const p of prestations) {
    if (/^shampoing \+ brushing$/i.test(p.nom.trim())) {
      console.log(`  inchange  ${p.nom}`);
      continue;
    }
    const nouveau = p.nom.replace(/\s*\+\s*Brushing\s*$/i, "").trim();
    if (nouveau === p.nom) {
      console.log(`  inchange  ${p.nom}`);
      continue;
    }
    await prisma.prestation.update({ where: { id: p.id }, data: { nom: nouveau } });
    console.log(`  ${p.nom}\n       -> ${nouveau}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
