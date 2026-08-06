"use client";

import { useEffect, useRef } from "react";

// Une seule vidéo, lue en boucle continue. Les autres fichiers restent
// disponibles dans /public/videos si besoin d'y revenir.
const SLIDE = {
  video: "/videos/V1.mp4",
  label: "Coiffure sur mesure",
  sousLabel: "Coupe, brushing, conseils personnalisés",
};

export function VideoCarousel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Relance la lecture tant que le navigateur la refuse ou la met en pause.
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

    lancer();
    video.addEventListener("pause", lancer);

    return () => {
      if (relance) clearTimeout(relance);
      video.removeEventListener("pause", lancer);
    };
  }, []);

  return (
    // Cadrage plein (object-cover) à toutes les tailles : la vidéo est au
    // format portrait, object-contain laissait de larges bandes noires — en
    // haut et en bas sur téléphone, sur les côtés en desktop.
    <div className="relative h-[62vh] min-h-[420px] w-full select-none overflow-hidden bg-[#1c1015] sm:h-[80vh] sm:min-h-[560px]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={SLIDE.video}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1015] via-[#1c1015]/55 to-[#1c1015]/10" />

      <div className="relative z-10 flex h-full items-end px-6 pb-16 sm:px-12">
        <div>
          <span className="handwriting block text-3xl leading-tight text-[#f5ead9] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:text-4xl">
            Namasté
          </span>
          <h2 className="mt-3 max-w-lg font-serif text-3xl text-[#f5ead9] sm:text-4xl">
            {SLIDE.label}
          </h2>
          <p className="mt-2 text-[#f5ead9]/70">{SLIDE.sousLabel}</p>
        </div>
      </div>
    </div>
  );
}
