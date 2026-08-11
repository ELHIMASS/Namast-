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
//
// Les dimensions réelles sont déclarées : elles permettent d'afficher chaque
// photo à ses proportions, sans recadrage, et laissent Next réserver la place
// exacte pour éviter les sauts de mise en page au chargement. Le parc est
// hétérogène — du 16/9 paysage, du 9/16 portrait et du carré.
export const IMAGE_CATEGORIE: Record<
  string,
  { src: string; alt: string; largeur: number; hauteur: number }
> = {
  // Coupe et Couleur n'ont pas d'illustration ici : chez les femmes elles
  // relèvent des formules, illustrées plus bas par IMAGE_FORMULE. La première
  // occurrence de « Coupe » dans la page étant celle des hommes, y placer une
  // photo de cliente mettait une femme sous le titre « Hommes ».
  SOIN: {
    src: "/images/i14.png",
    alt: "Coiffeuse travaillant les longueurs d'une cliente installée au poste de coiffage",
    largeur: 443,
    hauteur: 732,
  },
  HEAD_SPA: {
    src: "/images/i11.png",
    alt: "Head Spa en cours : cascade d'eau en chromothérapie au-dessus du visage de la cliente",
    largeur: 612,
    hauteur: 735,
  },
  MASSAGE: {
    src: "/images/i13.png",
    alt: "Massage du cuir chevelu sur table, sous la toile du Bouddha doré",
    largeur: 708,
    hauteur: 730,
  },
  EVENEMENTIEL: {
    src: "/images/i8.png",
    alt: "Plateau en bois gravé d'un arbre de vie posé sur une console",
    largeur: 2048,
    hauteur: 2048,
  },
};

// Photos des deux formules. C'est ici que vivent les images de coiffage :
// les prestations Coupe et Couleur des femmes relèvent des formules, pas des
// cartes de catégories.
export const IMAGE_FORMULE: Record<
  string,
  { src: string; alt: string; largeur: number; hauteur: number }
> = {
  PRIVILEGE: {
    src: "/images/i12.png",
    alt: "Coiffeuse lissant les cheveux d'une cliente au poste de coiffage, devant le miroir rond",
    largeur: 1107,
    hauteur: 736,
  },
  BIEN_ETRE: {
    src: "/images/i10.png",
    alt: "Shampooing au bac massant, la coiffeuse modelant le cuir chevelu d'une cliente",
    largeur: 535,
    hauteur: 698,
  },
};

// Les deux formules de coiffure femme, telles qu'elles figurent sur les
// plaquettes du salon.
export const ORDRE_FORMULES = ["PRIVILEGE", "BIEN_ETRE"];

export const LABEL_FORMULE: Record<string, string> = {
  PRIVILEGE: "Tarifs Privilège",
  BIEN_ETRE: "Tarifs Bien-être",
};

export const DESCRIPTION_FORMULE: Record<string, string> = {
  PRIVILEGE:
    "L'essentiel : shampooing, coupe et brushing. Pour un soin, une mousse coiffante ou toute autre prestation supplémentaire, cochez les options proposées.",
  BIEN_ETRE:
    "Les mêmes prestations, enrichies d'un soin profond, du bac massant et d'un modelage du cuir chevelu.",
};

/** Ce que comprend chaque formule, quelle que soit la prestation choisie. */
export const INCLUS_FORMULE: Record<string, string[]> = {
  PRIVILEGE: [
    "Shampooing adapté",
    "Coupe et/ou coiffage selon la prestation",
    "→ Soins, mousse coiffante et autres prestations disponibles en options",
  ],
  BIEN_ETRE: [
    "Shampooing adapté",
    "Soin profond",
    "Bac massant",
    "Modelage du cuir chevelu",
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
  ENFANT: "Options",
};
