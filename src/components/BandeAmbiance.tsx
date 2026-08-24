import Image from "next/image";

// Bande photo pleine largeur, seule image du lot au format paysage.
export function BandeAmbiance() {
  return (
    // La hauteur suit les proportions de la photo (1600x900, soit 16/9) au lieu
    // d'être fixée : la salle est montrée en entier, sans recadrage.
    <section className="relative aspect-video w-full">
      {/* La photo et son voile sombre sont masqués ensemble : la bande entière
          se fond dans la page en haut et en bas, sans bord marqué. */}
      <div className="photo-frame photo-fondue-verticale absolute inset-0">
        <Image
          src="/images/salle-soin-ensemble.jpg"
          alt="Salle de soin du salon : table de massage, bac Head Spa, toile de Bouddha et arbre de vie"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1015]/80 via-[#1c1015]/45 to-[#1c1015]/10" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-center px-6">
        <span className="text-xs uppercase tracking-[0.35em] text-[#f5ead9]/70">
          L&apos;atelier
        </span>
        <p className="mt-4 max-w-md font-serif text-2xl leading-snug text-[#f5ead9] sm:text-3xl">
          Un espace pensé pour le calme, où chaque rendez-vous prend son temps.
        </p>
      </div>
    </section>
  );
}
