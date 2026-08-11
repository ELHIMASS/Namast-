export type PrestationCalcul = {
  dureeMinutes: number;
  prixCentimes: number;
  tempsNettoyageMinutes: number;
};

// Utilisé par le flux admin (prestations simples, sans longueur ni options).
export function calculerTotal(prestations: PrestationCalcul[]) {
  const dureePrestations = prestations.reduce((s, p) => s + p.dureeMinutes, 0);
  const prixTotalCentimes = prestations.reduce((s, p) => s + p.prixCentimes, 0);
  const tempsNettoyage = prestations.length
    ? Math.max(...prestations.map((p) => p.tempsNettoyageMinutes))
    : 0;

  return {
    dureePrestations,
    dureeTotaleAvecNettoyage: dureePrestations + tempsNettoyage,
    prixTotalCentimes,
    tempsNettoyage,
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

export type PrestationAvecVariantes = {
  id: string;
  nom: string;
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
  options: OptionAvecVariantes[];
};

export function calculerTotalAvecOptions(
  lignes: LigneReservation[],
  matriceLissage: LissageTarifSimple[] = [],
) {
  let prixTotalCentimes = 0;
  let dureePrestations = 0;
  let tempsNettoyage = 0;

  for (const ligne of lignes) {
    const base = resoudrePrestation(ligne.prestation, ligne.longueur, ligne.densite, matriceLissage);
    prixTotalCentimes += base.prixCentimes;
    dureePrestations += base.dureeMinutes;
    tempsNettoyage = Math.max(tempsNettoyage, ligne.prestation.tempsNettoyageMinutes);

    for (const option of ligne.options) {
      const resolu = resoudreOption(option, ligne.longueur);
      prixTotalCentimes += resolu.prixCentimes;
      dureePrestations += resolu.dureeMinutes;
    }
  }

  return {
    dureePrestations,
    dureeTotaleAvecNettoyage: lignes.length ? dureePrestations + tempsNettoyage : 0,
    prixTotalCentimes,
    tempsNettoyage,
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
}): string[] {
  if (prestation.estLissage) return [];
  if (prestation.profil === "HOMME") return ["HOMME"];
  if (prestation.profil === "ENFANT") return ["ENFANT"];
  if (prestation.profil === "FEMME") {
    if (prestation.categorie === "COULEUR") {
      return ["BIEN_ETRE", "COULEUR"];
    }
    return ["RITUEL_FEMME", "BIEN_ETRE", "COIFFAGE"];
  }
  return [];
}

// Une ligne est complète quand toutes les informations requises (longueur,
// densité pour le lissage) ont été renseignées.
export function ligneEstComplete(ligne: { prestation: PrestationAvecVariantes; longueur?: Longueur; densite?: Densite }): boolean {
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
