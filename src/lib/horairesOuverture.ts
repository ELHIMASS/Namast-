/**
 * Horaires d'ouverture et pauses du salon par jour de la semaine
 */

export interface CreneauHoraire {
  debut: string; // Format "HH:mm"
  fin: string;   // Format "HH:mm"
}

export interface JourHoraires {
  ouvert: boolean;
  creneaux: CreneauHoraire[]; // Peut avoir plusieurs créneaux (ex: matin et après-midi)
}

// Les jours de la semaine: 0=Dimanche, 1=Lundi, 2=Mardi, etc.
export const HORAIRES_OUVERTURE: Record<number, JourHoraires> = {
  0: { // Dimanche
    ouvert: false,
    creneaux: []
  },
  1: { // Lundi
    ouvert: true,
    creneaux: [
      { debut: "13:30", fin: "17:30" }
    ]
  },
  2: { // Mardi
    ouvert: false,
    creneaux: []
  },
  3: { // Mercredi
    ouvert: true,
    creneaux: [
      { debut: "09:00", fin: "12:30" },
      { debut: "14:00", fin: "18:00" }
    ]
  },
  4: { // Jeudi
    ouvert: true,
    creneaux: [
      { debut: "09:00", fin: "13:00" },
      { debut: "14:00", fin: "18:00" }
    ]
  },
  5: { // Vendredi
    ouvert: true,
    creneaux: [
      { debut: "09:00", fin: "13:00" },
      { debut: "14:00", fin: "18:30" }
    ]
  },
  6: { // Samedi
    ouvert: true,
    creneaux: [
      { debut: "09:00", fin: "14:00" }
    ]
  }
};

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
  const resultat = horaires.creneaux.some(creneau => {
    const fin = heureEnMinutes(creneau.fin);
    return heureFinRDV <= fin;
  });

  console.log(`[DEBUG] respecteHorairesOuverture: dateFin=${dateFin.toISOString()}, heureFinRDV=${heureFinRDV}min, horaires=${JSON.stringify(horaires)}, resultat=${resultat}`);
  return resultat;
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
