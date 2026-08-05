/**
 * Une cliente ne peut modifier ou annuler elle-même son rendez-vous que
 * jusqu'à 24 h avant. Passé ce délai, elle doit appeler le salon.
 *
 * Cette règle est appliquée côté serveur dans les actions ; l'interface
 * s'appuie sur les mêmes fonctions pour rester cohérente avec elle.
 */
export const DELAI_MODIFICATION_HEURES = 24;

const DELAI_MS = DELAI_MODIFICATION_HEURES * 60 * 60 * 1000;

export function peutEtreModifie(dateDebut: Date, maintenant = new Date()): boolean {
  return dateDebut.getTime() - maintenant.getTime() >= DELAI_MS;
}

/** Dernier instant où la cliente peut encore agir seule. */
export function limiteModification(dateDebut: Date): Date {
  return new Date(dateDebut.getTime() - DELAI_MS);
}

export const MESSAGE_HORS_DELAI =
  `Ce rendez-vous a lieu dans moins de ${DELAI_MODIFICATION_HEURES} h : ` +
  `il n'est plus modifiable en ligne. Merci d'appeler le salon.`;
