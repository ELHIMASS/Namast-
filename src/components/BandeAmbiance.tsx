import Image from "next/image";

// Bande photo pleine largeur, seule image du lot au format paysage.
export function BandeAmbiance() {
  return (
    <section className="photo-frame relative h-72 w-full sm:h-96">
      <Image
        src="/images/i1.png"
        alt="Salle de soin du salon en lumière tamisée : table de massage, bac Head Spa et décoration zen"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1c1015]/80 via-[#1c1015]/45 to-[#1c1015]/10" />

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
