/**
 * Génération d'un document iCalendar (RFC 5545).
 *
 * Le format est plus strict qu'il n'y paraît : lignes terminées par CRLF,
 * repliées à 75 octets, et certains caractères échappés dans les champs
 * texte. Outlook refuse silencieusement un fichier mal formé — d'où ces
 * précautions plutôt qu'une simple concaténation.
 */

export type EvenementCalendrier = {
  /** Identifiant stable : un même rendez-vous doit garder le même d'une
   *  actualisation à l'autre, sinon l'agenda le duplique. */
  id: string;
  debut: Date;
  fin: Date;
  /** Date de dernière modification, pour que l'agenda détecte les changements. */
  modifieLe: Date;
  titre: string;
  description?: string;
  /** Un rendez-vous en attente de validation est marqué « provisoire ». */
  provisoire?: boolean;
};

/** Échappe les caractères réservés d'un champ TEXT iCalendar. */
function echapper(valeur: string): string {
  return valeur
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Replie une ligne à 75 octets, les suivantes commençant par une espace.
 * La coupe se fait sur les octets et non sur les caractères : un accent
 * compte double en UTF-8, et couper au milieu produirait un fichier illisible.
 */
function replier(ligne: string): string {
  const octets = Buffer.from(ligne, "utf8");
  if (octets.length <= 75) return ligne;

  const morceaux: string[] = [];
  let debut = 0;
  let limite = 75;

  while (debut < octets.length) {
    let fin = Math.min(debut + limite, octets.length);
    // Ne pas couper au milieu d'un caractère multi-octets : les octets de
    // continuation UTF-8 valent 10xxxxxx.
    while (fin < octets.length && (octets[fin] & 0b1100_0000) === 0b1000_0000) {
      fin--;
    }
    morceaux.push(octets.subarray(debut, fin).toString("utf8"));
    debut = fin;
    limite = 74; // les lignes suivantes perdent un octet pour l'espace initiale
  }

  return morceaux.join("\r\n ");
}

/** Horodatage UTC au format iCalendar : 20260826T070000Z */
function horodatage(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function construireCalendrier({
  nom,
  evenements,
}: {
  nom: string;
  evenements: EvenementCalendrier[];
}): string {
  const lignes: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Namaste//Planning//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${echapper(nom)}`,
    // Indication de fréquence d'actualisation. Les agendas restent libres de
    // l'ignorer — Outlook notamment n'en tient pas toujours compte.
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
    "X-PUBLISHED-TTL:PT15M",
  ];

  for (const e of evenements) {
    lignes.push(
      "BEGIN:VEVENT",
      `UID:${e.id}`,
      `DTSTAMP:${horodatage(e.modifieLe)}`,
      `DTSTART:${horodatage(e.debut)}`,
      `DTEND:${horodatage(e.fin)}`,
      `SUMMARY:${echapper(e.titre)}`,
      ...(e.description ? [`DESCRIPTION:${echapper(e.description)}`] : []),
      `STATUS:${e.provisoire ? "TENTATIVE" : "CONFIRMED"}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  lignes.push("END:VCALENDAR");

  return lignes.map(replier).join("\r\n") + "\r\n";
}
