import { estFerme, type Fermeture } from "./fermetures";
import { HORAIRES_SALON } from "./horaires";
import {
  estHoraireAutorisePourPrestations,
  estJourAutorisePourPrestations,
  getTempsMiseEnPlaceMinutes,
  type PrestationFiltre,
} from "./reglesCreneaux";
import { respecteHorairesOuverture, getCreneauxOuverture } from "./horairesOuverture";

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
  estAdmin = false,
}: {
  date: Date;
  dureeTotaleMinutes: number;
  prestations?: PrestationFiltre[];
  rendezVousExistants: Periode[];
  fermetures?: Fermeture[];
  pasMinutes?: number;
  estAdmin?: boolean;
}): Date[] {
  // Jour de congé posé par le salon : aucun créneau. L'espace pro n'est pas
  // concerné, il doit pouvoir poser un rendez-vous même un jour de fermeture.
  if (!estAdmin && estFerme(date, fermetures)) return [];

  // Pour les clientes (non-admin), vérification de la compatibilité des prestations pour ce jour
  if (!estAdmin && prestations.length > 0 && !estJourAutorisePourPrestations(date, prestations)) {
    return [];
  }

  const tempsMiseEnPlace = getTempsMiseEnPlaceMinutes(prestations);
  // Espace pro : la journée entière, de 00:00 à minuit, sans égard pour les
  // horaires d'ouverture — dimanche et mardi compris.
  const creneauxDuJour = getCreneauxOuverture(date.getDay());
  const plages = estAdmin
    ? [{ debut: "00:00", fin: "24:00" }]
    : (creneauxDuJour ?? []);
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

      // La mise en place ne peut pas dépasser avant l'ouverture du salon
      // (sans objet pour l'espace pro, qui n'a pas d'heure d'ouverture).
      const horsPlageOuverture =
        !estAdmin &&
        debutReel < debutPlage &&
        debutPlage.getTime() - debutReel.getTime() > 15 * 60000;

      // Pour les clientes, vérification des règles d'horaires (ex: Privilège 9h-11h & 16h-18h30)
      const horaireValide =
        estAdmin || prestations.length === 0 || estHoraireAutorisePourPrestations(curseur, finPrestation, prestations);

      // Vérification que le RDV finit avant l'horaire limite du jour (18h30 lun, 18h mer/jeu/ven, 14h sam, mardi fermé)
      // et qu'il ne chevauche pas les pauses déjeuner
      const respecteHoraireLimite = estAdmin || respecteHorairesOuverture(finPrestation);

      const chevauche = rendezVousExistants.some(
        (rdv) => debutReel < rdv.dateFin && finPrestation > rdv.dateDebut,
      );
      // L'espace pro peut aussi noter un rendez-vous sur une heure déjà passée
      // dans la journée en cours (saisie après coup).
      const estPasse = !estAdmin && curseur < maintenant;

      if (!chevauche && !estPasse && !horsPlageOuverture && horaireValide && respecteHoraireLimite) {
        creneaux.push(new Date(curseur));
      }

      curseur = new Date(curseur.getTime() + pasMinutes * 60000);
    }
  }

  return creneaux;
}

/**
 * Vérifie qu'un créneau précis tient : salon ouvert, prestation entièrement
 * contenue dans une plage d'ouverture, et aucun chevauchement.
 */
export function creneauEstLibre({
  dateDebut,
  dateFin,
  prestations = [],
  rendezVousExistants,
  fermetures = [],
  estAdmin = false,
}: {
  dateDebut: Date;
  dateFin: Date;
  prestations?: PrestationFiltre[];
  rendezVousExistants: Periode[];
  fermetures?: Fermeture[];
  estAdmin?: boolean;
}): { libre: true } | { libre: false; raison: "ferme" | "hors-horaires" | "occupe" } {
  if (estFerme(dateDebut, fermetures)) return { libre: false, raison: "ferme" };

  if (!estAdmin && prestations.length > 0 && !estJourAutorisePourPrestations(dateDebut, prestations)) {
    return { libre: false, raison: "hors-horaires" };
  }

  if (!estAdmin && prestations.length > 0 && !estHoraireAutorisePourPrestations(dateDebut, dateFin, prestations)) {
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
