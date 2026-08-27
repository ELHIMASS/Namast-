"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SeparateurCiseau } from "@/components/Ciseau";

export interface GoogleReview {
  id: string;
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time?: number;
}

// Vrais avis Google de Cécile Bernillon Namasté
const DEFAULT_REVIEWS: GoogleReview[] = [
  {
    id: "1",
    author_name: "Marie Stragier",
    rating: 5,
    relative_time_description: "il y a un an",
    text: "Une expérience exceptionnelle ! Cécile est douce, à l’écoute et d’une grande patience, ce qui rend le moment particulièrement agréable. Le résultat est impeccable. Je n’ai jamais vu un tel rapport qualité/prix à ce niveau de prestation.",
  },
  {
    id: "2",
    author_name: "Milie Pdlm",
    rating: 5,
    relative_time_description: "il y a un an",
    text: "J'y suis allée l'esprit lourd mais confiant et effectivement j'ai vraiment lâcher prise. Cécile est exceptionnelle, je ressors beaucoup plus légère et détendue. Je me suis même endormie... Merci pour ton professionnalisme !",
  },
  {
    id: "3",
    author_name: "Solenne Ranouil",
    rating: 5,
    relative_time_description: "il y a 4 ans",
    text: "On est accueilli dans un écrin de bien être. J'ai adoré cette expérience car elle est personnalisée. Cécile est disponible pour nous, nos besoins et elle prend le temps ! Je suis sortie ravie de ma coupe et de mon soin.",
  },
  {
    id: "4",
    author_name: "Lydie L",
    rating: 5,
    relative_time_description: "il y a 3 ans",
    text: "Cécile m'a orientée vers un traitement extraordinaire afin d'hydrater mes cheveux. Maintenant, je ne galère plus à les lisser ni à les coiffer... Et à chaque fois, c’est un agréable moment passé aux côtés de Cécile.",
  },
  {
    id: "5",
    author_name: "Bruno KARKOWSKI",
    rating: 5,
    relative_time_description: "il y a 6 ans",
    text: "Très professionnelle ! Nous avons fait confiance à Cécile et nous ne regrettons pas du tout notre choix. Encore merci !",
  },
];

const SEUIL_CARACTERES = 120;

export function GoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [rating, setRating] = useState<number>(5.0);
  const [userRatingsTotal, setUserRatingsTotal] = useState<number>(29);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>(
    "https://www.google.com/maps/place/?q=place_id:ChIJX-qK54DP9EcRHVjcWd-PkNA"
  );
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const selectionnerAvisAleatoires = (liste: GoogleReview[]) => {
    const melange = [...liste].sort(() => 0.5 - Math.random());
    return melange.slice(0, 4);
  };

  useEffect(() => {
    // Initialisation au hasard des 4 avis réels
    setReviews(selectionnerAvisAleatoires(DEFAULT_REVIEWS));

    async function fetchReviews() {
      try {
        const res = await fetch("/api/google-reviews");
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            setReviews(selectionnerAvisAleatoires(data.reviews));
          }
          if (data.rating) setRating(data.rating);
          if (data.user_ratings_total) setUserRatingsTotal(data.user_ratings_total);
          if (data.url) setGoogleMapsUrl(data.url);
        }
      } catch (err) {
        console.error("Impossible de charger les avis Google en direct:", err);
      }
    }
    fetchReviews();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <Reveal className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7D522A]/10 text-[#7D522A] text-xs uppercase tracking-[0.25em] font-semibold mb-4">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Avis Vérifiés Google
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl gradient-text animate-gradient mb-3">
          Ce que nos clientes disent de nous
        </h2>
        <SeparateurCiseau className="mt-2 mb-6" />

        <div className="flex flex-wrap items-center justify-center gap-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-serif text-3xl font-bold text-[#3A2411]">{rating.toFixed(1)}</span>
            <div className="flex text-amber-500 text-lg">
              {"★".repeat(Math.round(rating))}
            </div>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <span className="text-sm font-medium text-muted-foreground">
            Basé sur <strong className="text-foreground font-semibold">{userRatingsTotal} avis Google</strong>
          </span>
        </div>
      </Reveal>

      {/* Cartes des 4 avis sélectionnées au hasard */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reviews.map((review, idx) => {
          const estLong = review.text.length > SEUIL_CARACTERES;
          const estDeplie = expandedReviews[review.id || idx];
          const texteAffiche = estLong && !estDeplie
            ? `${review.text.slice(0, SEUIL_CARACTERES)}...`
            : review.text;
          const initiale = review.author_name ? review.author_name.charAt(0).toUpperCase() : "C";

          return (
            <Reveal key={review.id || idx} delay={idx * 80}>
              <div className="glass rounded-3xl border border-white/50 p-6 flex flex-col justify-between h-full card-hover hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#989077] to-[#7D522A] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm shrink-0">
                      {initiale}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#3A2411] truncate">
                        {review.author_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="text-amber-500 font-medium">
                          {"★".repeat(review.rating)}
                        </span>
                        <span>•</span>
                        <span>{review.relative_time_description}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{texteAffiche}"
                  </p>

                  {estLong && (
                    <button
                      onClick={() => toggleExpand(review.id || String(idx))}
                      className="mt-2 text-xs font-semibold text-[#7D522A] hover:underline focus:outline-none transition-colors"
                    >
                      {estDeplie ? "Voir moins" : "Voir plus"}
                    </button>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground/80">
                  <span className="flex items-center gap-1 text-[0.75rem] text-[#7D522A] font-medium">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Avis Google vérifié
                  </span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-white/40 backdrop-blur-md px-8 py-3.5 text-sm font-semibold text-[#3A2411] transition-all hover:bg-white/70 hover:border-primary active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Voir tous les avis sur Google Maps
        </a>
      </Reveal>
    </section>
  );
}
