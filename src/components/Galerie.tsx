import Image from "next/image";
import { SeparateurCiseau } from "@/components/Ciseau";
import { Reveal } from "@/components/Reveal";

// Les dimensions réelles sont déclarées : chaque cadre adopte les proportions
// de sa photo au lieu de la rogner dans un carré. Les trois formats présents —
// carré, portrait et paysage — donnent des cadres de hauteurs différentes,
// ce qui accentue l'effet de mur de photos.
const PHOTOS = [
  {
    src: "/images/i7.png",
    legende: "Bouddha doré",
    alt: "Toile représentant un Bouddha doré sur fond noir, accrochée dans le salon",
    largeur: 2048,
    hauteur: 2048,
  },
  {
    src: "/images/bouddha-statue.jpg",
    legende: "Bouddha",
    alt: "Statue de Bouddha en méditation, patinée argent, posée sur une console en bois",
    largeur: 900,
    hauteur: 1600,
  },
  {
    src: "/images/detail-lampe-sel.jpg",
    legende: "Coin détente",
    alt: "Lampe de sel allumée, terrarium suspendu et fontaine de galets sur une étagère",
    largeur: 1600,
    hauteur: 900,
  },
  {
    src: "/images/salle-soin-table.jpg",
    legende: "Salle de soin",
    alt: "Table de massage préparée face au bac Head Spa et aux étagères de produits",
    largeur: 900,
    hauteur: 1600,
  },
  {
    src: "/images/headspa-chromotherapie.jpg",
    legende: "Head Spa",
    alt: "Bac Head Spa en chromothérapie violette, dans la salle de soin tamisée",
    largeur: 900,
    hauteur: 1600,
  },
  {
    src: "/images/massage.jpeg",
    legende: "Salle de massage",
    alt: "Table de massage préparée, huiles essentielles et arbre de vie",
    largeur: 2048,
    hauteur: 2048,
  },
  {
    src: "/images/bac-lavage.jpg",
    legende: "Le bac",
    alt: "Bac de lavage du salon, fauteuil en cuir et gamme de soins",
    largeur: 900,
    hauteur: 1600,
  },
  {
    src: "/images/i9.png",
    legende: "Visage serein",
    alt: "Peinture colorée d'un visage de Bouddha, accrochée près de l'entrée",
    largeur: 2048,
    hauteur: 2048,
  },
];

// Inclinaison et décalage vertical propres à chaque cadre : l'accrochage
// irrégulier donne l'impression d'un vrai mur de photos.
// Trois inclinaisons, reprises en boucle : au-delà, l'œil percevrait une
// répétition régulière plutôt qu'un accrochage à la main.
const INCLINAISON = ["cadre-incline-a", "cadre-incline-b", "cadre-incline-c"];

export function Galerie() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-28">
      <div className="mb-12 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Le lieu
        </span>
        <h2 className="mt-2 font-serif text-3xl text-foreground">
          Quelques détails
        </h2>
        <SeparateurCiseau className="mt-5" />
      </div>

      <div className="mur-photos">
        {PHOTOS.map((photo, index) => (
          <Reveal key={photo.src} delay={index * 90}>
            <figure className={`cadre-photo group ${INCLINAISON[index % 3]}`}>
              <div className="photo-frame rounded-[18px]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.largeur}
                  height={photo.hauteur}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="h-auto w-full transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="pt-3 pb-1 text-center text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                {photo.legende}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
