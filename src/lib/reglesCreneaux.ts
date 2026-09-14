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

  // 3. Mercredi : réservé aux enfants/hommes ET aux femmes Privilège (9h-11h)
  //    Les femmes Bien-être (sans Privilège, sans enfant/homme) restent interdites.
  if (estMer && !contientEnfantOuHomme && !contientPrivilege) {
    return false;
  }

  // 4. Vendredi : Privilège autorisé avant 16h seulement → vérification fine dans estHoraireAutorisePourPrestations

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

  const contientEnfantOuHomme = prestations.some((p) => p.profil === "ENFANT" || p.profil === "HOMME");
  const contientPrivilege = prestations.some((p) => p.formule === "PRIVILEGE");

  const h9  = 9  * 60; //  540 min
  const h11 = 11 * 60; //  660 min
  const h16 = 16 * 60; //  960 min

  // --- MERCREDI ---
  if (day === 3) {
    if (contientPrivilege && !contientEnfantOuHomme) {
      // Femmes Privilège : uniquement 9h–11h
      return heureDebut >= h9 && heureDebut < h11;
    }
    if (contientEnfantOuHomme) {
      // Enfants & Hommes : à partir de 11h (créneaux 11h–13h et 14h–18h)
      return heureDebut >= h11;
    }
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
