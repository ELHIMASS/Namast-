"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  video?: string;
  label: string;
  sousLabel: string;
};

// Ajoutez `video: "/videos/nom-du-fichier.mp4"` sur un slide dès que le fichier
// est disponible dans /public/videos — en son absence, un fond animé sert de
// substitut visuel.
const SLIDES: Slide[] = [
  {
    video: "/videos/V1.mp4",
    label: "Coiffure sur mesure",
    sousLabel: "Coupe, brushing, conseils personnalisés",
  },
  {
    video: "/videos/V2.mp4",
    label: "Couleur & techniques",
    sousLabel: "Balayage, mèches, patine",
  },
  {
    video: "/videos/V3.mp4",
    label: "Head Spa & bien-être",
    sousLabel: "Massages, soins, rituels apaisants",
  },
];

const AUTO_ADVANCE_MS = 6000;

export function VideoCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Autoplay automatique pour toutes les vidéos - une après l'autre
  useEffect(() => {
    const video = videoRefs.current[index];
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    // Essayer de lancer immédiatement
    const playVideo = () => {
      video.play().catch(() => {
        // Si échoue, réessayer après un court délai
        const timeout = setTimeout(playVideo, 100);
        return () => clearTimeout(timeout);
      });
    };

    playVideo();

    // Mettre en pause les autres vidéos
    videoRefs.current.forEach((v, i) => {
      if (i !== index && v) {
        v.pause();
      }
    });
  }, [index]);

  const goTo = useCallback((i: number) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    startX.current = e.clientX;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    if (dx < -50) {
      goTo(index + 1);
      resetTimer();
    } else if (dx > 50) {
      goTo(index - 1);
      resetTimer();
    }
  }

  return (
    <div
      className="relative h-[80vh] min-h-[560px] w-full touch-pan-y select-none overflow-hidden bg-[#1c1015]"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={() => {
        dragging.current = false;
      }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.label}
          className={`absolute inset-0 flex items-end transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.video ? (
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="absolute inset-0 h-full w-full object-cover"
              src={slide.video}
              muted
              playsInline
              autoPlay={i === index}
              preload={i === index ? "auto" : i === (index + 1) % SLIDES.length ? "metadata" : "none"}
              onEnded={() => {
                if (i === index && !dragging.current) {
                  goTo(index + 1);
                  resetTimer();
                }
              }}
              onTimeUpdate={() => {
                // S'assurer que les autres vidéos sont bien en pause
                if (i !== index && !videoRefs.current[i]?.paused) {
                  videoRefs.current[i]?.pause();
                }
              }}
            />
          ) : (
            <div className="motion-slide absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1015] via-[#1c1015]/55 to-[#1c1015]/10" />
          <div className="relative z-10 px-6 pb-16 sm:px-12">
            <span className="text-xs uppercase tracking-[0.35em] text-[#f5ead9]/60">
              0{i + 1} — Namasté
            </span>
            <h2 className="mt-3 max-w-lg font-serif text-3xl text-[#f5ead9] sm:text-4xl">
              {slide.label}
            </h2>
            <p className="mt-2 text-[#f5ead9]/70">{slide.sousLabel}</p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              goTo(i);
              resetTimer();
            }}
            aria-label={`Aller à la diapositive ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-8 bg-primary" : "w-1.5 bg-[#f5ead9]/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
