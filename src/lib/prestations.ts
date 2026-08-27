export type PrestationCalcul = {
  dureeMinutes: number;
  prixCentimes: number;
  tempsNettoyageMinutes: number;
};

// Utilisé par le flux admin (prestations simples, sans longueur ni options).
export function calculerTotal(prestations: PrestationCalcul[]) {
  const dureePrestations = prestations.reduce((s, p) => s + p.dureeMinutes, 0);
  const prixTotalCentimes = prestations.reduce((s, p) => s + p.prixCentimes, 0);

  return {
    dureePrestations,
    dureeTotaleAvecNettoyage: dureePrestations,
    prixTotalCentimes,
    tempsNettoyage: 0,
  };
}

export function formatPrix(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
}

// --- Carte finale : longueur, densité, options ---

export type Longueur = "COURT" | "CARRE" | "MI_LONG" | "LONG" | "TRES_LONG";
export type Densite = "FIN" | "NORMAL" | "EPAIS";
export type Finition = "BRUSHING" | "SECHAGE";

/**
 * La finition est demandée sur les prestations de coiffure femme, où le
 * séchage et le brushing sont l'un comme l'autre compris. Elle ne l'est pas
 * sur « Shampoing + Brushing », dont le brushing est l'objet même.
 */
export function demandeFinition(prestation: {
  profil: string;
  formule?: string | null;
  nom: string;
}): boolean {
  if (prestation.profil !== "FEMME" || !prestation.formule) return false;
  return !/^shampoing \+ brushing$/i.test(prestation.nom.trim());
}

/** Le brushing est compris ; le séchage, plus rapide, vaut 5 € de moins. */
export const REMISE_SECHAGE_CENTIMES = 500;

export function remiseFinition(ligne: {
  prestation: { profil: string; formule?: string | null; nom: string };
  finition?: Finition;
}): number {
  if (!demandeFinition(ligne.prestation)) return 0;
  return ligne.finition === "SECHAGE" ? REMISE_SECHAGE_CENTIMES : 0;
}

export type PrestationAvecVariantes = {
  id: string;
  nom: string;
  /** Déroulé de la prestation, affiché derrière « Voir le détail ». */
  description?: string | null;
  categorie: string;
  profil: string;
  prixCentimes: number;
  dureeMinutes: number;
  tempsNettoyageMinutes: number;
  estLissage: boolean;
  /** "PRIVILEGE" | "BIEN_ETRE", ou null hors formule de coiffure. */
  formule: string | null;
  variantesLongueur: { longueur: Longueur; prixCentimes: number; dureeMinutes: number }[];
};

export type OptionAvecVariantes = {
  id: string;
  nom: string;
  groupe: string;
  description: string | null;
  prixCentimes: number | null;
  dureeMinutes: number;
  variantesLongueur: { longueur: Longueur; prixCentimes: number }[];
};

export type LissageTarifSimple = {
  longueur: Longueur;
  densite: Densite;
  prixCentimes: number;
  dureeMinutes: number;
};

export function resoudrePrestation(
  prestation: PrestationAvecVariantes,
  longueur: Longueur | undefined,
  densite: Densite | undefined,
  matriceLissage: LissageTarifSimple[],
): { prixCentimes: number; dureeMinutes: number } {
  if (prestation.estLissage) {
    const tarif = matriceLissage.find((t) => t.longueur === longueur && t.densite === densite);
    if (tarif) return { prixCentimes: tarif.prixCentimes, dureeMinutes: tarif.dureeMinutes };
    return { prixCentimes: prestation.prixCentimes, dureeMinutes: prestation.dureeMinutes };
  }
  if (prestation.variantesLongueur.length > 0 && longueur) {
    const variante = prestation.variantesLongueur.find((v) => v.longueur === longueur);
    if (variante) return { prixCentimes: variante.prixCentimes, dureeMinutes: variante.dureeMinutes };
  }
  return { prixCentimes: prestation.prixCentimes, dureeMinutes: prestation.dureeMinutes };
}

export function resoudreOption(
  option: OptionAvecVariantes,
  longueur: Longueur | undefined,
): { prixCentimes: number; dureeMinutes: number } {
  if (option.prixCentimes !== null) {
    return { prixCentimes: option.prixCentimes, dureeMinutes: option.dureeMinutes };
  }
  const variante = option.variantesLongueur.find((v) => v.longueur === longueur);
  return { prixCentimes: variante?.prixCentimes ?? 0, dureeMinutes: option.dureeMinutes };
}

export type LigneReservation = {
  prestation: PrestationAvecVariantes;
  longueur?: Longueur;
  densite?: Densite;
  finition?: Finition;
  options: OptionAvecVariantes[];
  /**
   * Bénéficiaire de la ligne, quand le rendez-vous en concerne plusieurs :
   * un parent venant avec ses enfants nomme chacun d'eux. Absent quand la
   * réservation ne concerne que la cliente elle-même.
   */
  personne?: string;
};

export function calculerTotalAvecOptions(
  lignes: LigneReservation[],
  matriceLissage: LissageTarifSimple[] = [],
) {
  let prixTotalCentimes = 0;
  let dureePrestations = 0;

  for (const ligne of lignes) {
    const base = resoudrePrestation(ligne.prestation, ligne.longueur, ligne.densite, matriceLissage);
    prixTotalCentimes += base.prixCentimes - remiseFinition(ligne);
    dureePrestations += base.dureeMinutes;

    for (const option of ligne.options) {
      const resolu = resoudreOption(option, ligne.longueur);
      prixTotalCentimes += resolu.prixCentimes;
      dureePrestations += resolu.dureeMinutes;
    }
  }

  return {
    dureePrestations,
    dureeTotaleAvecNettoyage: dureePrestations,
    prixTotalCentimes,
    tempsNettoyage: 0,
  };
}

// Détermine quels groupes d'options proposer selon la prestation choisie.
// Une prestation vendue dans une formule est tout compris : aucune option
// payante ne s'y ajoute, ce qui est déjà inclus est simplement affiché.
export function getGroupesOptionsPourPrestation(prestation: {
  categorie: string;
  profil: string;
  estLissage: boolean;
  formule?: string | null;
  nom?: string;
}): string[] {
  if (prestation.estLissage) return [];
  if (prestation.profil === "HOMME") return ["HOMME"];

  // Chez les enfants, les options de coiffage ne concernent que les filles.
  if (prestation.profil === "ENFANT") {
    return /fille/i.test(prestation.nom ?? "") ? ["ENFANT"] : [];
  }

  if (prestation.profil === "FEMME") {
    const groupes =
      prestation.categorie === "COULEUR"
        ? ["BIEN_ETRE", "COIFFAGE", "COULEUR"]
        : ["BIEN_ETRE", "COIFFAGE"];

    // La formule Bien-être comprend déjà soin profond, bac massant et
    // modelage : les rituels de soin n'ont pas à être reproposés en supplément.
    return prestation.formule === "BIEN_ETRE"
      ? groupes
      : ["RITUEL_FEMME", ...groupes];
  }

  return [];
}

// Une ligne est complète quand toutes les informations requises (longueur,
// densité pour le lissage) ont été renseignées.
export function ligneEstComplete(ligne: {
  prestation: PrestationAvecVariantes;
  longueur?: Longueur;
  densite?: Densite;
  finition?: Finition;
}): boolean {
  if (demandeFinition(ligne.prestation) && !ligne.finition) return false;
  if (ligne.prestation.estLissage) return !!ligne.longueur && !!ligne.densite;
  if (ligne.prestation.variantesLongueur.length > 0) return !!ligne.longueur;
  return true;
}

// Prix "à partir de" pour l'affichage catalogue (plus bas tarif disponible).
export function prixAPartirDe(prestation: PrestationAvecVariantes, matriceLissage: LissageTarifSimple[] = []): number {
  if (prestation.estLissage) {
    return matriceLissage.length
      ? Math.min(...matriceLissage.map((t) => t.prixCentimes))
      : prestation.prixCentimes;
  }
  if (prestation.variantesLongueur.length > 0) {
    return Math.min(...prestation.variantesLongueur.map((v) => v.prixCentimes));
  }
  return prestation.prixCentimes;
}
