import Image from "next/image";
import { SeparateurCiseau } from "@/components/Ciseau";
import { Reveal } from "@/components/Reveal";

const PHOTOS = [
  {
    src: "/images/i7.png",
    legende: "Bouddha doré",
    alt: "Toile représentant un Bouddha doré sur fond noir, accrochée dans le salon",
  },
  {
    src: "/images/bouddha-statue.jpg",
    legende: "Bouddha",
    alt: "Statue de Bouddha en méditation, patinée argent, posée sur une console en bois",
  },
  {
    src: "/images/detail-lampe-sel.jpg",
    legende: "Coin détente",
    alt: "Lampe de sel allumée, terrarium suspendu et fontaine de galets sur une étagère",
  },
];

// Inclinaison et décalage vertical propres à chaque cadre : l'accrochage
// irrégulier donne l'impression d'un vrai mur de photos.
const INCLINAISON = ["cadre-incline-a", "cadre-incline-b", "cadre-incline-c"];
const DECALAGE = ["cadre-decale-a", "cadre-decale-b", "cadre-decale-c"];

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

      <div className="grid gap-10 sm:grid-cols-3 sm:gap-7">
        {PHOTOS.map((photo, index) => (
          <Reveal key={photo.src} delay={index * 90} className={DECALAGE[index]}>
            <figure className={`cadre-photo group ${INCLINAISON[index]}`}>
              <div className="photo-frame aspect-square rounded-[18px]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
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
