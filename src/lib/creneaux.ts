import { estFerme, type Fermeture } from "./fermetures";
import { HORAIRES_SALON } from "./horaires";
import {
  estHoraireAutorisePourPrestations,
  estJourAutorisePourPrestations,
  getTempsMiseEnPlaceMinutes,
  type PrestationFiltre,
} from "./reglesCreneaux";

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
  prestations = [],
  rendezVousExistants,
  fermetures = [],
  pasMinutes = 15,
}: {
  date: Date;
  dureeTotaleMinutes: number;
  prestations?: PrestationFiltre[];
  rendezVousExistants: Periode[];
  fermetures?: Fermeture[];
  pasMinutes?: number;
}): Date[] {
  // Jour de congé posé par le salon : aucun créneau.
  if (estFerme(date, fermetures)) return [];

  // Vérification de la compatibilité des prestations pour ce jour
  if (prestations.length > 0 && !estJourAutorisePourPrestations(date, prestations)) {
    return [];
  }

  const tempsMiseEnPlace = getTempsMiseEnPlaceMinutes(prestations);
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

      // Début réel incluant la mise en place de 15 min avant (Head Spa / Massage)
      const debutReel = new Date(curseur.getTime() - tempsMiseEnPlace * 60000);

      // La mise en place ne peut pas dépasser avant l'ouverture du salon de plus que raisonnable (ou doit être dans la journée)
      const horsPlageOuverture = debutReel < debutPlage && (debutPlage.getTime() - debutReel.getTime() > 15 * 60000);

      // Vérification des règles d'horaires (Privilège 9h-11h & 16h-18h30 le jeudi/vendredi, etc.)
      const horaireValide =
        prestations.length === 0 || estHoraireAutorisePourPrestations(curseur, finPrestation, prestations);

      const chevauche = rendezVousExistants.some(
        (rdv) => debutReel < rdv.dateFin && finPrestation > rdv.dateDebut,
      );
      const estPasse = curseur < maintenant;

      if (!chevauche && !estPasse && !horsPlageOuverture && horaireValide) {
        creneaux.push(new Date(curseur));
      }

      curseur = new Date(curseur.getTime() + pasMinutes * 60000);
    }
  }

  return creneaux;
}

/**
 * Vérifie qu'un créneau précis tient : salon ouvert, prestation entièrement
 * contenue dans une plage d'ouverture, règles horaires respectées et aucun chevauchement.
 */
export function creneauEstLibre({
  dateDebut,
  dateFin,
  prestations = [],
  rendezVousExistants,
  fermetures = [],
}: {
  dateDebut: Date;
  dateFin: Date;
  prestations?: PrestationFiltre[];
  rendezVousExistants: Periode[];
  fermetures?: Fermeture[];
}): { libre: true } | { libre: false; raison: "ferme" | "hors-horaires" | "occupe" } {
  if (estFerme(dateDebut, fermetures)) return { libre: false, raison: "ferme" };

  if (prestations.length > 0 && !estJourAutorisePourPrestations(dateDebut, prestations)) {
    return { libre: false, raison: "hors-horaires" };
  }

  if (prestations.length > 0 && !estHoraireAutorisePourPrestations(dateDebut, dateFin, prestations)) {
    return { libre: false, raison: "hors-horaires" };
  }

  const plages = HORAIRES_SALON[dateDebut.getDay()] ?? [];
  const tientDansUnePlage = plages.some((plage) => {
    const debutPlage = parseHeureSurDate(dateDebut, plage.debut);
    const finPlage = parseHeureSurDate(dateDebut, plage.fin);
    return dateDebut >= debutPlage && dateFin <= finPlage;
  });
  if (!tientDansUnePlage) return { libre: false, raison: "hors-horaires" };

  const tempsMiseEnPlace = getTempsMiseEnPlaceMinutes(prestations);
  const debutReel = new Date(dateDebut.getTime() - tempsMiseEnPlace * 60000);

  const chevauche = rendezVousExistants.some(
    (rdv) => debutReel < rdv.dateFin && dateFin > rdv.dateDebut,
  );
  if (chevauche) return { libre: false, raison: "occupe" };

  return { libre: true };
}
