/**
 * Horaires de fermeture maximaux par jour de la semaine.
 * Format: { jour_semaine: "heure:minutes" ou null si fermé }
 * Les RDV doivent finir AVANT ou À cet horaire.
 */
export const HORAIRES_LIMITES_PAR_JOUR: Record<number, string | null> = {
  1: "18:30", // Lundi
  2: null, // Mardi - FERMÉ
  3: "18:00", // Mercredi
  4: "18:00", // Jeudi
  5: "18:00", // Vendredi
  6: "14:00", // Samedi
  0: null, // Dimanche - FERMÉ
};

/**
 * Vérifie si un RDV peut finir à l'heure limite du jour.
 * Retourne true si le RDV finit avant ou à l'horaire limite.
 */
export function peutFinirAuHoraireLimite(dateFin: Date): boolean {
  const jour = dateFin.getDay();
  const heureLimite = HORAIRES_LIMITES_PAR_JOUR[jour];

  if (heureLimite === null) {
    // Jour fermé
    return false;
  }

  const [heures, minutes] = heureLimite.split(":").map(Number);
  const limiteCentimes = heures * 60 + minutes;
  const finCentimes = dateFin.getHours() * 60 + dateFin.getMinutes();

  return finCentimes <= limiteCentimes;
}

/**
 * Obtient l'horaire limite pour un jour donné (au format "HH:mm").
 * Retourne null si le jour est fermé.
 */
export function getHoraireLimite(jour: number): string | null {
  return HORAIRES_LIMITES_PAR_JOUR[jour];
}

/**
 * Obtient le label du jour pour affichage.
 */
export function getLabelJour(jour: number): string {
  const labels = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return labels[jour];
}
