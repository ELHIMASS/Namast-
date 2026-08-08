import "dotenv/config";
import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma";

/**
 * Import du fichier clientes du salon.
 *
 *   npx tsx prisma/importClientes.ts <fichier.csv> [--sec]
 *
 * Colonnes attendues : Name, Email, Phone Number, Last Meeting Date,
 * Next Meeting Date, Company.
 *
 * Le fichier contient des données personnelles : le garder hors du dépôt.
 * --sec (dry run) affiche ce qui serait fait sans rien écrire.
 */

const prisma = new PrismaClient();

/** Découpage CSV tolérant aux virgules entre guillemets. */
function champs(ligne: string): string[] {
  const out: string[] = [];
  let cur = "";
  let dansGuillemets = false;
  for (let i = 0; i < ligne.length; i++) {
    const ch = ligne[i];
    if (ch === '"') {
      if (dansGuillemets && ligne[i + 1] === '"') {
        cur += '"';
        i++;
      } else dansGuillemets = !dansGuillemets;
    } else if (ch === "," && !dansGuillemets) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/**
 * Format français standard : 10 chiffres commençant par 0.
 * Le fichier source est en indicatif international ("'+33 6 89 99 26 39").
 */
export function normaliserTelephone(brut: string): string | null {
  let d = (brut ?? "").replace(/^'/, "").replace(/[^\d+]/g, "");
  if (d.startsWith("+33")) d = "0" + d.slice(3);
  else if (d.startsWith("0033")) d = "0" + d.slice(4);
  else if (d.startsWith("33") && d.length === 11) d = "0" + d.slice(2);
  d = d.replace(/\D/g, "");
  if (d.length === 9 && !d.startsWith("0")) d = "0" + d;
  return /^0\d{9}$/.test(d) ? d : null;
}

/**
 * Le fichier mélange les usages : « AGNOLIN Jacky », « Alicia MATHIAS »,
 * « Amaury sanchez », ou un patronyme seul. Le bloc en majuscules est traité
 * comme le nom ; à défaut on suit l'usage « Prénom Nom » ; un mot seul est
 * considéré comme un nom de famille.
 */
export function separerNom(nomComplet: string): { prenom: string; nom: string } {
  const mots = nomComplet.trim().split(/\s+/).filter(Boolean);
  if (mots.length === 0) return { prenom: "", nom: "" };
  if (mots.length === 1) return { prenom: "", nom: mots[0] };

  const majuscules = mots.filter(
    (m) => m.length > 1 && m === m.toLocaleUpperCase("fr") && /\p{Lu}/u.test(m),
  );
  if (majuscules.length > 0 && majuscules.length < mots.length) {
    return {
      nom: majuscules.join(" "),
      prenom: mots.filter((m) => !majuscules.includes(m)).join(" "),
    };
  }
  return { prenom: mots[0], nom: mots.slice(1).join(" ") };
}

const cle = (prenom: string, nom: string, tel: string | null) =>
  `${prenom.toLocaleLowerCase("fr")}|${nom.toLocaleLowerCase("fr")}|${tel ?? ""}`;

async function main() {
  const chemin = process.argv[2];
  const dryRun = process.argv.includes("--sec");
  if (!chemin) {
    console.error("Usage : npx tsx prisma/importClientes.ts <fichier.csv> [--sec]");
    process.exit(1);
  }

  const lignes = readFileSync(chemin, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");

  const vues = new Set<string>();
  const aImporter: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string | null;
    notes: string | null;
  }[] = [];
  const doublonsFichier: string[] = [];

  for (const ligne of lignes.slice(1)) {
    const f = champs(ligne);
    const { prenom, nom } = separerNom(f[0] ?? "");
    const telephone = normaliserTelephone(f[2] ?? "");
    const k = cle(prenom, nom, telephone);

    // Même personne présente deux fois dans le fichier source.
    if (vues.has(k)) {
      doublonsFichier.push(f[0]);
      continue;
    }
    vues.add(k);

    // Les dates de rendez-vous du fichier sont conservées en note : elles ne
    // permettent pas de reconstituer un rendez-vous (ni prestation, ni durée).
    const notes = [
      f[3] ? `Dernier rendez-vous connu : ${f[3]}` : null,
      f[4] ? `Prochain rendez-vous prévu : ${f[4]}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    aImporter.push({
      prenom,
      nom,
      email: (f[1] ?? "").toLocaleLowerCase("fr"),
      telephone,
      notes: notes || null,
    });
  }

  let crees = 0;
  let dejaPresents = 0;

  for (const c of aImporter) {
    const existante = await prisma.client.findFirst({
      where: {
        prenom: { equals: c.prenom, mode: "insensitive" },
        nom: { equals: c.nom, mode: "insensitive" },
        email: { equals: c.email, mode: "insensitive" },
      },
    });

    if (existante) {
      dejaPresents++;
      continue;
    }
    if (!dryRun) await prisma.client.create({ data: c });
    crees++;
  }

  console.log(`Lignes lues            : ${lignes.length - 1}`);
  console.log(`Doublons du fichier    : ${doublonsFichier.length}${
    doublonsFichier.length ? ` (${doublonsFichier.join(", ")})` : ""
  }`);
  console.log(`Deja en base           : ${dejaPresents}`);
  console.log(`${dryRun ? "A creer" : "Creees"}                : ${crees}`);
  console.log(`Sans telephone         : ${aImporter.filter((c) => !c.telephone).length}`);
  if (dryRun) console.log("\n(dry run : aucune ecriture)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
