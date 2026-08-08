"use client";

import { useMemo, useState } from "react";
import { HORAIRES_SALON } from "@/lib/horaires";
import type {
  Densite,
  Longueur,
  OptionAvecVariantes,
  PrestationAvecVariantes,
} from "@/lib/prestations";

const JOUR_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const HEURE_DEBUT = 9;
const HEURE_FIN = 19;
const HEURES = Array.from({ length: HEURE_FIN - HEURE_DEBUT }, (_, i) => HEURE_DEBUT + i);
const HAUTEUR_HEURE = 56;
const HAUTEUR_GRILLE = HEURES.length * HAUTEUR_HEURE;

export type RendezVousCalendrier = {
  id: string;
  dateDebut: Date;
  dateFin: Date;
  /** Posé par le salon depuis l'espace pro, et non pris en ligne par la cliente. */
  creeParAdmin?: boolean;
  client: { id: string; prenom: string; nom: string; telephone: string | null; email: string };
  prestations: {
    prestation: PrestationAvecVariantes;
    longueur?: Longueur | null;
    densite?: Densite | null;
    options: { option: OptionAvecVariantes }[];
  }[];
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const jour = d.getDay();
  const diff = jour === 0 ? -6 : 1 - jour;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function minutesDepuisDebut(date: Date): number {
  return (date.getHours() - HEURE_DEBUT) * 60 + date.getMinutes();
}

function pourcentage(minutes: number): number {
  return (minutes / ((HEURE_FIN - HEURE_DEBUT) * 60)) * 100;
}

function heureLabel(h: number): string {
  return `${h}h`;
}

function heureCourte(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export type StyleCouleurRDV = {
  bg: string;
  text: string;
  subtext: string;
  badgeBg: string;
};

export function getCouleurRendezVous(rdv: RendezVousCalendrier): StyleCouleurRDV {
  const prestations = rdv.prestations.map((p) => p.prestation);

  // 1. Profils spécifiques : Homme et Enfants
  const estHomme = prestations.some((p) => p.profil === "HOMME");
  const estEnfant = prestations.some((p) => p.profil === "ENFANT");

  if (estHomme) {
    // Bleu pour Homme
    return {
      bg: "bg-blue-600 hover:bg-blue-700",
      text: "text-white font-medium",
      subtext: "text-blue-100",
      badgeBg: "bg-blue-600",
    };
  }

  if (estEnfant) {
    const noms = prestations.map((p) => p.nom.toLowerCase()).join(" ");
    const estGarcon = noms.includes("garçon") || noms.includes("garcon") || noms.includes("ado");

    if (estGarcon) {
      // Bleu ciel pour Garçon
      return {
        bg: "bg-sky-400 hover:bg-sky-500",
        text: "text-sky-950 font-semibold",
        subtext: "text-sky-900/80",
        badgeBg: "bg-sky-400",
      };
    } else {
      // Rose clair pour Fille
      return {
        bg: "bg-pink-300 hover:bg-pink-400",
        text: "text-pink-950 font-semibold",
        subtext: "text-pink-900/80",
        badgeBg: "bg-pink-300",
      };
    }
  }

  // 2. Formules Femmes : Privilège vs Bien-être
  const aPrivilege = prestations.some((p) => p.formule === "PRIVILEGE");
  const aBienEtre = prestations.some(
    (p) => p.formule === "BIEN_ETRE" || p.categorie === "HEAD_SPA" || p.categorie === "MASSAGE"
  );

  if (aPrivilege) {
    // Rose foncé pour Privilège
    return {
      bg: "bg-rose-700 hover:bg-rose-800",
      text: "text-white font-medium",
      subtext: "text-rose-100",
      badgeBg: "bg-rose-700",
    };
  }

  if (aBienEtre) {
    // Rose pastel pour Bien-être
    return {
      bg: "bg-rose-200 hover:bg-rose-300",
      text: "text-rose-950 font-semibold",
      subtext: "text-rose-900/80",
      badgeBg: "bg-rose-200",
    };
  }

  // Défaut : Rose doux
  return {
    bg: "bg-rose-300 hover:bg-rose-400",
    text: "text-rose-950 font-semibold",
    subtext: "text-rose-900/80",
    badgeBg: "bg-rose-300",
  };
}

export function WeekCalendar({
  rendezVous,
  onSelect,
}: {
  rendezVous: RendezVousCalendrier[];
  onSelect?: (rdv: RendezVousCalendrier) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const semaineCourante = startOfWeek(new Date()).getTime();

  const jours = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const rdvParJour = useMemo(() => {
    const map = new Map<string, RendezVousCalendrier[]>();
    for (const jour of jours) {
      const key = jour.toDateString();
      map.set(
        key,
        rendezVous.filter((r) => new Date(r.dateDebut).toDateString() === key),
      );
    }
    return map;
  }, [jours, rendezVous]);

  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/50 space-y-4">
      {/* En-tête calendrier & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-4">
        <button
          type="button"
          onClick={() => setWeekStart((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() - 7))}
          disabled={weekStart.getTime() <= semaineCourante}
          className="rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Semaine précédente"
        >
          ‹
        </button>
        <p className="font-serif text-lg text-foreground">
          {jours[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} –{" "}
          {jours[5].toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setWeekStart((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7))}
          className="rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-primary"
          aria-label="Semaine suivante"
        >
          ›
        </button>
      </div>

      {/* Légende des couleurs */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-700 border border-rose-800" />
          <span>Privilège (Rose foncé)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-200 border border-rose-300" />
          <span>Bien-être (Rose pastel)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-600 border border-blue-700" />
          <span>Homme (Bleu)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-400 border border-sky-500" />
          <span>Garçon (Bleu ciel)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-300 border border-pink-400" />
          <span>Fille (Rose clair)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-[48px_repeat(6,1fr)]">
          <div />
          {jours.map((jour, i) => {
            const estAujourdhui = jour.toDateString() === new Date().toDateString();
            return (
              <div key={i} className="border-b border-border/60 px-2 py-3 text-center">
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                  {JOUR_LABELS[i]}
                </p>
                <p
                  className={`font-serif text-lg ${
                    estAujourdhui
                      ? "mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {jour.getDate()}
                </p>
              </div>
            );
          })}

          <div className="relative" style={{ height: HAUTEUR_GRILLE }}>
            {HEURES.map((h) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-2 text-right text-[0.65rem] text-muted-foreground"
                style={{ top: (h - HEURE_DEBUT) * HAUTEUR_HEURE }}
              >
                {heureLabel(h)}
              </div>
            ))}
          </div>

          {jours.map((jour, i) => {
            const plages = HORAIRES_SALON[jour.getDay()] ?? [];
            const ouvert = plages.length > 0;
            const rdvs = rdvParJour.get(jour.toDateString()) ?? [];

            return (
              <div
                key={i}
                className="relative border-l border-border/60"
                style={{
                  height: HAUTEUR_GRILLE,
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, var(--border) 0, var(--border) 1px, transparent 1px, transparent " +
                    HAUTEUR_HEURE +
                    "px)",
                  backgroundColor: !ouvert
                    ? "color-mix(in srgb, var(--muted-foreground) 8%, transparent)"
                    : undefined,
                }}
              >
                {!ouvert && (
                  <p className="absolute inset-x-0 top-2 text-center text-[0.65rem] italic text-muted-foreground">
                    Fermé
                  </p>
                )}

                {ouvert &&
                  (() => {
                    const zones: { top: number; height: number }[] = [];
                    let curseur = 0;
                    for (const plage of plages) {
                      const [hd, md] = plage.debut.split(":").map(Number);
                      const [hf, mf] = plage.fin.split(":").map(Number);
                      const debutMin = (hd - HEURE_DEBUT) * 60 + md;
                      const finMin = (hf - HEURE_DEBUT) * 60 + mf;
                      if (debutMin > curseur) {
                        zones.push({ top: curseur, height: debutMin - curseur });
                      }
                      curseur = finMin;
                    }
                    zones.push({ top: curseur, height: HAUTEUR_GRILLE - curseur });
                    return zones.map((z, zi) => (
                      <div
                        key={zi}
                        className="absolute inset-x-0"
                        style={{
                          top: (z.top / 60) * HAUTEUR_HEURE,
                          height: (z.height / 60) * HAUTEUR_HEURE,
                          backgroundColor:
                            "color-mix(in srgb, var(--muted-foreground) 6%, transparent)",
                        }}
                      />
                    ));
                  })()}

                {rdvs.map((rdv) => {
                  const debutMin = minutesDepuisDebut(new Date(rdv.dateDebut));
                  const finMin = minutesDepuisDebut(new Date(rdv.dateFin));
                  const top = pourcentage(debutMin);
                  const height = Math.max(pourcentage(finMin - debutMin), 4);
                  const styleCouleur = getCouleurRendezVous(rdv);

                  return (
                    <button
                      key={rdv.id}
                      type="button"
                      onClick={() => onSelect?.(rdv)}
                      className={`absolute inset-x-1 overflow-hidden rounded-md ${styleCouleur.bg} px-1.5 py-1 text-left shadow-sm transition-transform hover:z-10 hover:scale-[1.02] hover:shadow-md`}
                      style={{ top: `${top}%`, height: `${height}%` }}
                      title={`${rdv.client.prenom} ${rdv.client.nom} — ${rdv.prestations
                        .map((p) => p.prestation.nom)
                        .join(", ")}${rdv.creeParAdmin ? " — ajouté par le salon" : ""}`}
                    >
                      <p
                        className={`flex items-center gap-1 truncate text-[0.7rem] leading-tight ${styleCouleur.text}`}
                      >
                        {rdv.creeParAdmin && (
                          <span
                            className="shrink-0 rounded-sm bg-current/20 px-1 text-[0.55rem] font-semibold uppercase tracking-wide"
                            title="Rendez-vous ajouté par le salon"
                          >
                            Admin
                          </span>
                        )}
                        <span className="truncate">
                          {heureCourte(new Date(rdv.dateDebut))} {rdv.client.prenom}
                        </span>
                      </p>
                      <p className={`truncate text-[0.65rem] leading-tight ${styleCouleur.subtext}`}>
                        {rdv.prestations.map((p) => p.prestation.nom).join(", ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
