import { estFerme, type Fermeture } from "./fermetures";
import { HORAIRES_SALON } from "./horaires";

function parseHeureSurDate(date: Date, heure: string): Date {
  const [h, m] = heure.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

type Periode = { dateDebut: Date; dateFin: Date };

export function getCreneauxDisponibles({
  date,
  dureeTotaleMinutes,
  rendezVousExistants,
  fermetures = [],
  pasMinutes = 15,
}: {
  date: Date;
  dureeTotaleMinutes: number;
  rendezVousExistants: Periode[];
  fermetures?: Fermeture[];
  pasMinutes?: number;
}): Date[] {
  // Jour de congé posé par le salon : aucun créneau, quels que soient les horaires.
  if (estFerme(date, fermetures)) return [];

  const plages = HORAIRES_SALON[date.getDay()] ?? [];
  const creneaux: Date[] = [];
  const maintenant = new Date();

  for (const plage of plages) {
    const debutPlage = parseHeureSurDate(date, plage.debut);
    const finPlage = parseHeureSurDate(date, plage.fin);

    let curseur = new Date(debutPlage);
    while (true) {
      const finPrestation = new Date(curseur.getTime() + dureeTotaleMinutes * 60000);
      if (finPrestation > finPlage) break;

      const chevauche = rendezVousExistants.some(
        (rdv) => curseur < rdv.dateFin && finPrestation > rdv.dateDebut,
      );
      const estPasse = curseur < maintenant;

      if (!chevauche && !estPasse) {
        creneaux.push(new Date(curseur));
      }

      curseur = new Date(curseur.getTime() + pasMinutes * 60000);
    }
  }

  return creneaux;
}
