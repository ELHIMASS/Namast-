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

  // 4. Samedi : Privilège interdit
  if (day === 6 && contientPrivilege) {
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
  const day = dateDebut.getDay();
  const contientPrivilege = prestations.some((p) => p.formule === "PRIVILEGE");

  // Si pas de prestation Privilège, pas de restriction d'horaire spécifique
  if (!contientPrivilege) return true;

  // Samedi : Privilège totalement interdit
  if (day === 6) return false;

  // Jeudi (4) et Vendredi (5) :
  // Privilège autorisé de 09h00 à 11h00 et de 16h00 à la fin de journée.
  // Interdit entre 11h00 et 16h00.
  if (day === 4 || day === 5) {
    const minutesDebut = dateDebut.getHours() * 60 + dateDebut.getMinutes();
    const minutesFin = dateFin.getHours() * 60 + dateFin.getMinutes();

    const min11h = 11 * 60; // 660
    const min16h = 16 * 60; // 960

    // Si le créneau chevauche la période restreinte [11h00, 16h00[
    const chevaucheIntervalleInterdit = minutesDebut < min16h && minutesFin > min11h;
    if (chevaucheIntervalleInterdit) {
      return false;
    }
  }

  return true;
}

export function getTempsMiseEnPlaceMinutes(_prestations: PrestationFiltre[]): number {
  return 0;
}
