import { Ciseau } from "@/components/Ciseau";

export function HaircutIcons() {
  return (
    // z-10 : sans lui, ces éléments positionnés sont peints avant les sections
    // (positionnées elles aussi, mais plus loin dans le DOM) et passent donc
    // sous leurs panneaux en verre dépoli, où ils deviennent invisibles.
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Le motif ciseau du salon, semé sur toute la hauteur de la page, dans
          les marges pour ne pas retomber sur le texte. Chaque instance a sa
          rotation, sa taille et son animation propres : un motif répété à
          l'identique se verrait comme une trame. */}
      <Ciseau className="absolute right-2 top-[26%] h-12 w-12 -rotate-12 text-primary/30 animate-float sm:right-4 sm:h-14 sm:w-14" />
      <Ciseau className="absolute left-2 top-[41%] h-10 w-10 rotate-[24deg] text-primary/25 animate-pulse-soft sm:left-4 sm:h-12 sm:w-12" />
      <Ciseau className="absolute right-2 top-[58%] h-12 w-12 -rotate-[35deg] text-primary/25 animate-float sm:right-4 sm:h-14 sm:w-14" />
      <Ciseau className="absolute left-2 top-[73%] h-10 w-10 rotate-[8deg] text-primary/25 animate-wiggle sm:left-4 sm:h-12 sm:w-12" />
      <Ciseau className="absolute right-3 top-[88%] h-11 w-11 -rotate-6 text-primary/20 animate-pulse-soft sm:right-6 sm:h-12 sm:w-12" />

      {/* Peigne animé */}
      <svg
        className="absolute top-40 left-8 h-10 w-10 text-primary/35 animate-blob"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M7 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2s2-.9 2-2V8c0-1.1-.9-2-2-2zm4 0c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2s2-.9 2-2V8c0-1.1-.9-2-2-2zm4 0c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2s2-.9 2-2V8c0-1.1-.9-2-2-2zm4 0c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2s2-.9 2-2V8c0-1.1-.9-2-2-2z" />
      </svg>

      {/* Cheveux/ondulation animée */}
      <svg
        className="absolute bottom-32 right-20 h-14 w-14 text-primary/30 animate-float"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
      </svg>

      {/* Miroir animé */}
      <svg
        className="absolute top-1/3 left-20 h-11 w-11 text-primary/25 animate-pulse-soft"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
      </svg>

      {/* Spray/Bouteille animée */}
      <svg
        className="absolute bottom-20 left-1/4 h-12 w-12 text-primary/20 animate-wiggle"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M13 3h-2v2h2V3zm0 4h-2v2h2V7zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2zm4 0h-2v2h2v-2zm0-4h-2v2h2v-2zm0-4h-2v2h2V7zm0-4h-2v2h2V3zM9 3H7v2h2V3zm0 4H7v2h2V7zm0 4H7v2h2v-2zm0 4H7v2h2v-2z" />
      </svg>

      {/* Couronne/Diamond animée */}
      <svg
        className="absolute bottom-40 right-1/4 h-10 w-10 text-primary/30 animate-heartbeat"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>

      {/* Cheveux wavy */}
      <svg
        className="absolute top-1/2 right-5 h-16 w-16 text-primary/15 animate-float"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <path d="M5 10c1-2 3-3 4-5m4 5c1-2 3-3 4-5m4 5c1-2 3-3 4-5" />
        <path d="M5 16c1-2 3-3 4-5m4 5c1-2 3-3 4-5m4 5c1-2 3-3 4-5" />
      </svg>
    </div>
  );
}
