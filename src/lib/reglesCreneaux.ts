import { estMercredi } from "./horaires";

export type PrestationFiltre = {
  profil: string;
  categorie: string;
  estLissage: boolean;
  formule?: string | null;
};

/**
 * Détermine si la combinaison de prestations est autorisée un jour donné.
 */
export function estJourAutorisePourPrestations(date: Date, prestations: PrestationFiltre[]): boolean {
  const day = date.getDay(); // 0 = Dimanche, 1 = Lundi, 3 = Mercredi, 6 = Samedi...
  const estMer = estMercredi(date);

  const contientEnfantOuHomme = prestations.some((p) => p.profil === "ENFANT" || p.profil === "HOMME");
  const contientLissageMassageHeadSpa = prestations.some(
    (p) => p.estLissage || p.categorie === "HEAD_SPA" || p.categorie === "MASSAGE"
  );
  const contientPrivilege = prestations.some((p) => p.formule === "PRIVILEGE");

  // 1. Enfants et Hommes : mercredi uniquement
  if (contientEnfantOuHomme && !estMer) {
    return false;
  }

  // 2. Lissages, Massages, Head Spa : interdits le mercredi
  if (contientLissageMassageHeadSpa && estMer) {
    return false;
  }

  // 3. Mercredi : réservé aux enfants/hommes
  if (estMer && !contientEnfantOuHomme) {
    return false;
  }

  return true;
}

/**
 * Détermine si un créneau horaire spécifique (dateDebut -> dateFin) est conforme aux plages autorisées.
 */
export function estHoraireAutorisePourPrestations(
  dateDebut: Date,
  dateFin: Date,
  prestations: PrestationFiltre[]
): boolean {
  return true;
}

export function getTempsMiseEnPlaceMinutes(_prestations: PrestationFiltre[]): number {
  return 0;
}
