"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Les trois vidéos du salon, enchaînées. Toutes en 1024x576 (16/9), donc
 * cadrées pleine largeur sans bande noire ni recadrage notable en desktop.
 */
const SLIDES = [
  {
    video: "/videos/salon-1.mp4",
    label: "Coiffure sur mesure",
    sousLabel: "Coupe, brushing, conseils personnalisés",
  },
  {
    video: "/videos/salon-2.mp4",
    label: "Head Spa & soins",
    sousLabel: "Bac massant, chromothérapie, soins Belmakosmetik",
  },
  {
    video: "/videos/salon-3.mp4",
    label: "Un salon pensé pour le calme",
    sousLabel: "Sur rendez-vous uniquement, une cliente à la fois",
  },
];

export function VideoCarousel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  // Relance la lecture tant que le navigateur la refuse, et passe à la vidéo
  // suivante quand celle en cours se termine (pas de `loop` : c'est
  // l'enchaînement qui fait la boucle).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    let relance: ReturnType<typeof setTimeout> | null = null;

    const lancer = () => {
      video.play().catch(() => {
        relance = setTimeout(lancer, 100);
      });
    };

    const suivante = () => setIndex((i) => (i + 1) % SLIDES.length);

    lancer();
    video.addEventListener("pause", lancer);
    video.addEventListener("ended", suivante);

    return () => {
      if (relance) clearTimeout(relance);
      video.removeEventListener("pause", lancer);
      video.removeEventListener("ended", suivante);
    };
  }, [index]);

  return (
    <div className="relative h-[62vh] min-h-[420px] w-full select-none overflow-hidden bg-[#1c1015] sm:h-[80vh] sm:min-h-[560px]">
      <video
        ref={videoRef}
        key={slide.video}
        className="absolute inset-0 h-full w-full object-cover"
        src={slide.video}
        muted
        playsInline
        autoPlay
        // Seule la vidéo affichée est téléchargée : les suivantes ne partent
        // qu'à leur tour, pour ne pas charger 6 Mo d'un coup sur mobile.
        preload="auto"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1015] via-[#1c1015]/55 to-[#1c1015]/10" />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 sm:px-12">
        <div>
          <span className="handwriting block text-3xl leading-tight text-[#f5ead9] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:text-4xl">
            Namasté
          </span>
          <h2 className="mt-3 max-w-lg font-serif text-3xl text-[#f5ead9] sm:text-4xl">
            {slide.label}
          </h2>
          <p className="mt-2 text-[#f5ead9]/70">{slide.sousLabel}</p>
        </div>

        {/* Progression, et navigation directe entre les séquences. */}
        <div className="mt-8 flex gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.video}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir la séquence ${i + 1} : ${s.label}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-10 bg-[#f5ead9]" : "w-5 bg-[#f5ead9]/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
