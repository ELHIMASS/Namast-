import { prisma } from "./prisma";

export type Fermeture = {
  id: string;
  dateDebut: Date;
  dateFin: Date;
  motif: string | null;
};

/**
 * Les fermetures sont stockées en colonne DATE : Prisma les renvoie à minuit
 * UTC. On compare donc des clés "AAAA-MM-JJ" plutôt que des horodatages, pour
 * éviter qu'un décalage de fuseau ne décale la fermeture d'un jour.
 */
function cleUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Même clé, mais lue en heure locale : pour le jour que la cliente réserve. */
export function cleLocale(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

/** Les deux bornes d'une fermeture sont incluses. */
export function estFerme(date: Date, fermetures: Fermeture[]): boolean {
  const jour = cleLocale(date);
  return fermetures.some(
    (f) => jour >= cleUTC(f.dateDebut) && jour <= cleUTC(f.dateFin),
  );
}

/**
 * Ramène une date locale sur minuit UTC du même jour civil.
 *
 * Indispensable ici : la colonne est de type DATE, donc stockée à minuit UTC,
 * alors que les dates manipulées côté application sont à minuit *local*. Sans
 * cette conversion, en UTC+2 le 13 août local vaut le 12 août 22 h UTC et la
 * comparaison rate la fermeture d'une journée entière.
 */
function minuitUTC(date: Date): Date {
  return new Date(`${cleLocale(date)}T00:00:00.000Z`);
}

/** Fermetures qui touchent la période demandée (bornes incluses). */
export async function getFermetures(du?: Date, au?: Date): Promise<Fermeture[]> {
  return prisma.fermeture.findMany({
    where:
      du && au
        ? { dateDebut: { lte: minuitUTC(au) }, dateFin: { gte: minuitUTC(du) } }
        : undefined,
    orderBy: { dateDebut: "asc" },
    select: { id: true, dateDebut: true, dateFin: true, motif: true },
  });
}

/** Une date est-elle fermée ? Interroge la base pour ce seul jour. */
export async function jourEstFerme(date: Date): Promise<boolean> {
  const fermetures = await getFermetures(date, date);
  return estFerme(date, fermetures);
}
