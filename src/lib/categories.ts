export const LABEL_CATEGORIE: Record<string, string> = {
  COUPE: "Coupe & brushing",
  COULEUR: "Couleur & techniques",
  SOIN: "Soins capillaires",
  HEAD_SPA: "Head Spa",
  MASSAGE: "Massage bien-être",
  EVENEMENTIEL: "Coiffure événementielle",
};

export const DESCRIPTION_CATEGORIE: Record<string, string> = {
  COUPE: "Des coupes sur mesure, pensées pour votre visage et votre quotidien.",
  COULEUR: "Techniques de coloration précises, du plus subtil au plus intense.",
  SOIN: "Des rituels ciblés pour nourrir et réparer la fibre capillaire.",
  HEAD_SPA: "Un moment de pure détente pour le cuir chevelu et l'esprit.",
  MASSAGE: "Des techniques de relaxation pour relâcher les tensions.",
  EVENEMENTIEL: "Des coiffures d'exception pour vos occasions spéciales.",
};

// Photos du salon associées à chaque famille de prestations (dans /public/images).
export const IMAGE_CATEGORIE: Record<string, { src: string; alt: string }> = {
  COUPE: {
    src: "/images/i4.png",
    alt: "Poste de coiffage du salon : miroir rond, fauteuil et produits de coiffage",
  },
  COULEUR: {
    src: "/images/i5.png",
    alt: "Bac de lavage avec fauteuil relax et gamme de soins colorants",
  },
  SOIN: {
    src: "/images/i3.png",
    alt: "Espace soins du salon et étagères de produits capillaires",
  },
  HEAD_SPA: {
    src: "/images/i2.png",
    alt: "Bac Head Spa en chromothérapie, dans la salle de soin tamisée",
  },
  MASSAGE: {
    src: "/images/i6.png",
    alt: "Table de massage préparée, huiles essentielles et arbre de vie",
  },
  EVENEMENTIEL: {
    src: "/images/i8.png",
    alt: "Plateau en bois gravé d'un arbre de vie posé sur une console",
  },
};

// Les deux formules de coiffure femme, telles qu'elles figurent sur les
// plaquettes du salon.
export const ORDRE_FORMULES = ["ESSENTIELLE", "BIEN_ETRE"];

export const LABEL_FORMULE: Record<string, string> = {
  ESSENTIELLE: "Coiffure Essentielle",
  BIEN_ETRE: "Coiffure Bien-être",
};

export const DESCRIPTION_FORMULE: Record<string, string> = {
  ESSENTIELLE: "L'entretien de vos cheveux avec efficacité et qualité.",
  BIEN_ETRE:
    "Les mêmes prestations que la Coiffure Essentielle, enrichies d'une véritable expérience de détente.",
};

/** Ce que comprend chaque formule, quelle que soit la prestation choisie. */
export const INCLUS_FORMULE: Record<string, string[]> = {
  ESSENTIELLE: [
    "Shampooing adapté",
    "Soin classique",
    "Coupe et/ou coiffage selon la prestation",
  ],
  BIEN_ETRE: [
    "Shampooing adapté",
    "Soin professionnel Belmakosmetik",
    "Bac massant",
    "Massage relaxant du cuir chevelu",
    "Temps de détente personnalisé",
    "Coupe et/ou coiffage selon la prestation",
  ],
};

export const ORDRE_CATEGORIES = [
  "COUPE",
  "COULEUR",
  "SOIN",
  "HEAD_SPA",
  "MASSAGE",
  "EVENEMENTIEL",
];

export const LABEL_PROFIL: Record<string, string> = {
  FEMME: "Femmes",
  HOMME: "Hommes",
  ENFANT: "Enfants",
};


export const LABEL_LONGUEUR: Record<string, string> = {
  COURT: "Courts",
  CARRE: "Carré",
  MI_LONG: "Mi-longs",
  LONG: "Longs",
  TRES_LONG: "Très longs / épais",
};

export const ORDRE_LONGUEURS = ["COURT", "CARRE", "MI_LONG", "LONG", "TRES_LONG"] as const;

export const LABEL_DENSITE: Record<string, string> = {
  FIN: "Fins",
  NORMAL: "Normaux",
  EPAIS: "Épais",
};

export const ORDRE_DENSITES = ["FIN", "NORMAL", "EPAIS"] as const;

export const LABEL_GROUPE_OPTION: Record<string, string> = {
  RITUEL_FEMME: "Rituel coiffure détente",
  BIEN_ETRE: "Options bien-être",
  COIFFAGE: "Options coiffage",
  COULEUR: "Options couleur",
  HOMME: "Options",
};
