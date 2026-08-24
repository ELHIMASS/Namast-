/**
 * Contrôles d'ouverture du salon.
 *
 * Les horaires eux-mêmes ne sont plus définis ici : ce fichier les dérive de
 * HORAIRES_SALON (src/lib/horaires.ts), désormais source unique. La table qui
 * s'y trouvait auparavant avait divergé de celle qui génère les créneaux, si
 * bien que le mercredi soir était proposé jusqu'à 18h30 puis refusé à 18h00.
 */

import { HORAIRES_SALON } from "./horaires";

export interface CreneauHoraire {
  debut: string; // Format "HH:mm"
  fin: string;   // Format "HH:mm"
}

export interface JourHoraires {
  ouvert: boolean;
  creneaux: CreneauHoraire[]; // Peut avoir plusieurs créneaux (ex: matin et après-midi)
}

// Les jours de la semaine: 0=Dimanche, 1=Lundi, 2=Mardi, etc.
export const HORAIRES_OUVERTURE: Record<number, JourHoraires> = Object.fromEntries(
  Object.entries(HORAIRES_SALON).map(([jour, plages]) => [
    Number(jour),
    { ouvert: plages.length > 0, creneaux: plages },
  ]),
);

/**
 * Convertit une heure "HH:mm" en minutes depuis minuit
 */
export function heureEnMinutes(heure: string): number {
  const [h, m] = heure.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Vérifie si une heure donnée est dans les horaires d'ouverture
 */
export function estDansHoraires(date: Date): boolean {
  const jour = date.getDay();
  const horaires = HORAIRES_OUVERTURE[jour];

  if (!horaires.ouvert) {
    return false;
  }

  const heureActuelle = date.getHours() * 60 + date.getMinutes();

  return horaires.creneaux.some(creneau => {
    const debut = heureEnMinutes(creneau.debut);
    const fin = heureEnMinutes(creneau.fin);
    return heureActuelle >= debut && heureActuelle < fin;
  });
}

/**
 * Vérifie si une date/heure de fin de RDV respecte les horaires du salon
 */
export function respecteHorairesOuverture(dateFin: Date): boolean {
  const jour = dateFin.getDay();
  const horaires = HORAIRES_OUVERTURE[jour];

  if (!horaires.ouvert) {
    return false;
  }

  const heureFinRDV = dateFin.getHours() * 60 + dateFin.getMinutes();

  // Vérifie que la fin du RDV est dans un des créneaux d'ouverture
  return horaires.creneaux.some((creneau) => {
    const fin = heureEnMinutes(creneau.fin);
    return heureFinRDV <= fin;
  });
}

/**
 * Obtient l'horaire de fermeture maximum pour un jour donné
 */
export function getHoraireFermetureMax(jour: number): string | null {
  const horaires = HORAIRES_OUVERTURE[jour];
  if (!horaires.ouvert || horaires.creneaux.length === 0) {
    return null;
  }

  // Retourne l'heure de fin du dernier créneau
  return horaires.creneaux[horaires.creneaux.length - 1].fin;
}

/**
 * Obtient tous les créneaux d'ouverture pour un jour
 */
export function getCreneauxOuverture(jour: number): CreneauHoraire[] {
  return HORAIRES_OUVERTURE[jour]?.creneaux || [];
}

/**
 * Label du jour en français
 */
export function getLabelJour(jour: number): string {
  const labels = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return labels[jour];
}

/**
 * Obtient le statut du jour (ouvert/fermé avec horaires)
 */
export function getStatusJour(jour: number): string {
  const horaires = HORAIRES_OUVERTURE[jour];

  if (!horaires.ouvert) {
    return "Fermé";
  }

  const creneaux = horaires.creneaux
    .map(c => `${c.debut} – ${c.fin}`)
    .join(" / ");

  return creneaux;
}
