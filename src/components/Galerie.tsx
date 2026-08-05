import Image from "next/image";

const PHOTOS = [
  {
    src: "/images/i7.png",
    alt: "Toile représentant un Bouddha doré sur fond noir, accrochée dans le salon",
  },
  {
    src: "/images/i9.png",
    alt: "Peinture colorée d'un visage de Bouddha, accrochée près de l'entrée",
  },
  {
    src: "/images/i8.png",
    alt: "Plateau en bois gravé d'un arbre de vie, posé près d'un bonsaï",
  },
];

export function Galerie() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Le lieu
        </span>
        <h2 className="mt-2 font-serif text-3xl text-foreground">
          Quelques détails
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {PHOTOS.map((photo) => (
          <div
            key={photo.src}
            className="photo-frame group relative aspect-square rounded-3xl border border-white/50"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
