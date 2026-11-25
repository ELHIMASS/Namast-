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
  const estMer = estMercredi(date);

  const contientEnfantOuHomme = prestations.some((p) => p.profil === "ENFANT" || p.profil === "HOMME");

  // 1. Enfants et Hommes : mercredi uniquement
  if (contientEnfantOuHomme && !estMer) {
    return false;
  }

  // 2. Mercredi : ouvert aux enfants/hommes (à partir de 11h) ET à toutes les
  //    prestations femmes (9h-12h, y compris Bien-être, Lissage, Head Spa et Massage).
  // 3. Vendredi : Privilège autorisé avant 16h seulement → vérification fine dans estHoraireAutorisePourPrestations

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
  const heureDebut = dateDebut.getHours() * 60 + dateDebut.getMinutes();

  const contientFemme = prestations.some((p) => p.profil === "FEMME");
  const contientEnfantOuHomme = prestations.some((p) => p.profil === "ENFANT" || p.profil === "HOMME");
  const contientPrivilege = prestations.some((p) => p.formule === "PRIVILEGE");

  const h9  = 9  * 60; //  540 min
  const h11 = 11 * 60; //  660 min
  const h12 = 12 * 60; //  720 min
  const h16 = 16 * 60; //  960 min

  // --- MERCREDI ---
  if (day === 3) {
    if (contientFemme && (heureDebut < h9 || heureDebut >= h12)) {
      // Femmes (toutes prestations) : uniquement 9h–12h
      return false;
    }
    if (contientEnfantOuHomme && heureDebut < h11) {
      // Enfants & Hommes : à partir de 11h (créneaux 11h–13h et 14h–18h)
      return false;
    }
    return true;
  }

  // --- VENDREDI ---
  if (day === 5 && contientPrivilege) {
    // Privilège uniquement avant 16h
    return heureDebut < h16;
  }

  return true;
}

export function getTempsMiseEnPlaceMinutes(_prestations: PrestationFiltre[]): number {
  return 0;
}
