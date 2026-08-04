"use client";

import { useMemo, useState } from "react";
import { HORAIRES_SALON } from "@/lib/horaires";

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
  client: { id: string; prenom: string; nom: string; telephone: string; email: string };
  prestations: { prestation: { id: string; nom: string } }[];
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
    <div className="glass overflow-hidden rounded-2xl border border-white/50">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
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
                  return (
                    <button
                      key={rdv.id}
                      type="button"
                      onClick={() => onSelect?.(rdv)}
                      className="absolute inset-x-1 overflow-hidden rounded-md bg-primary px-1.5 py-1 text-left text-primary-foreground shadow-sm transition-transform hover:z-10 hover:scale-[1.02] hover:shadow-md"
                      style={{ top: `${top}%`, height: `${height}%` }}
                      title={`${rdv.client.prenom} ${rdv.client.nom} — ${rdv.prestations
                        .map((p) => p.prestation.nom)
                        .join(", ")}`}
                    >
                      <p className="truncate text-[0.7rem] font-medium leading-tight">
                        {heureCourte(new Date(rdv.dateDebut))} {rdv.client.prenom}
                      </p>
                      <p className="truncate text-[0.65rem] leading-tight text-primary-foreground/80">
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
