import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

/**
 * Rituels Head Spa et descriptifs affiches derriere « Voir le detail ».
 *
 *   npx tsx prisma/seedDetails.ts
 *
 * Les durees retenues sont les « durees totales a prevoir » de la plaquette,
 * sechage compris. Le moteur de creneaux y ajoute encore 15 min de mise en
 * place propres au Head Spa et aux massages.
 */
const prisma = new PrismaClient();

const RITUEL_DETENTE = `Rituel Détente — 45 min de soin, plus 15 min de séchage. Durée totale à prévoir : 1h15.

Déroulé :
• Gommage
• Shampooing adapté
• Soin adapté
• Modelage du cuir chevelu
• Modelage visage, nuque et épaules
• Arceau de pluie
• Rinçage
• Séchage naturel`;

const RITUEL_EVASION = `Rituel Évasion — 90 min de soin, plus 15 min de séchage. Durée totale à prévoir : 2h.

Déroulé :
• Analyse du cuir chevelu et du cheveu au tricoscope
• Gommage adapté
• Scrub
• Shampooing adapté
• Air brush aux hydrolats
• Peigne haute fréquence
• Soin adapté
• Modelage du cuir chevelu
• Modelage nuque, épaules et visage
• Patchs à l'aloe vera pour les yeux
• Arceau de pluie
• Bulle de vapeur aux huiles essentielles
• Rinçage
• Séchage naturel`;

const SHIROSCHAMPI = `Origine : Inde. Huile végétale de sésame — pensez à prévoir un débardeur.

Massage à la fois profond et doux, pratiqué sur le crâne, le visage, la nuque et le cou. Idéal pour apaiser le mental, très relaxant.

Ses bienfaits :
• Aide à lutter contre les insomnies
• Réduit les migraines
• Améliore les troubles de la vue liés à la fatigue oculaire
• Éclaircit les idées et favorise la concentration
• Améliore la qualité du travail intellectuel
• Recommandé en cas de chute de cheveux : les huiles les rendent plus brillants et plus vigoureux`;

async function renommer(ancien: string, nom: string, prix: number, duree: number, description: string) {
  const p = await prisma.prestation.findFirst({ where: { nom: ancien } });
  if (!p) {
    console.log(`  introuvable : ${ancien}`);
    return;
  }
  await prisma.prestation.update({
    where: { id: p.id },
    data: { nom, prixCentimes: prix * 100, dureeMinutes: duree, description },
  });
  console.log(`  ${ancien}  ->  ${nom}  ${prix} E  ${duree} min`);
}

async function main() {
  console.log("Head Spa :");
  await renommer("Head Spa Découverte", "Rituel Détente", 80, 75, RITUEL_DETENTE);
  await renommer("Head Spa Signature", "Rituel Évasion", 120, 120, RITUEL_EVASION);

  console.log("\nMassage :");
  const s = await prisma.prestation.findFirst({ where: { nom: "Shiroschampi" } });
  if (s) {
    await prisma.prestation.update({ where: { id: s.id }, data: { description: SHIROSCHAMPI } });
    console.log("  descriptif ajoute : Shiroschampi");
  }

  console.log("\nPrestations avec un deroule affichable :");
  const avec = await prisma.prestation.findMany({
    where: { actif: true, description: { not: null } },
    select: { nom: true, categorie: true, description: true },
    orderBy: { categorie: "asc" },
  });
  avec
    .filter((p) => (p.description ?? "").length > 120)
    .forEach((p) => console.log(`  ${p.categorie.padEnd(10)} ${p.nom}`));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
