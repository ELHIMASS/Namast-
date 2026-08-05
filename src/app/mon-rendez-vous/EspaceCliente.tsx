"use client";

import { useMemo, useState, useTransition } from "react";
import { estJourOuvert } from "@/lib/horaires";
import { DELAI_MODIFICATION_HEURES } from "@/lib/delaiModification";
import {
  annulerRendezVousClienteAction,
  chercherRendezVousAction,
  deplacerRendezVousClienteAction,
  getCreneauxPourDeplacementAction,
  type RendezVousCliente,
} from "./actions";

function prochainsJours(nombre: number): Date[] {
  const jours: Date[] = [];
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  for (let i = 0; i < nombre; i++) {
    const d = new Date(aujourdhui);
    d.setDate(d.getDate() + i);
    jours.push(d);
  }
  return jours;
}

function formaterDateHeure(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EspaceCliente() {
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [rendezVous, setRendezVous] = useState<RendezVousCliente | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [modeDeplacement, setModeDeplacement] = useState(false);
  const [dateChoisie, setDateChoisie] = useState<Date | null>(null);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [confirmAnnulation, setConfirmAnnulation] = useState(false);

  const jours = useMemo(() => prochainsJours(28).filter(estJourOuvert), []);

  function chercher() {
    setErreur(null);
    setInfo(null);
    startTransition(async () => {
      const resultat = await chercherRendezVousAction(telephone, code);
      if (!resultat.ok) {
        setErreur(resultat.error);
        setRendezVous(null);
        return;
      }
      setRendezVous(resultat.rendezVous);
    });
  }

  function choisirDate(jour: Date) {
    setDateChoisie(jour);
    setCreneaux([]);
    startTransition(async () => {
      const dispo = await getCreneauxPourDeplacementAction(
        telephone,
        code,
        jour.toISOString(),
      );
      setCreneaux(dispo);
    });
  }

  function deplacer(creneauISO: string) {
    setErreur(null);
    startTransition(async () => {
      const resultat = await deplacerRendezVousClienteAction(telephone, code, creneauISO);
      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }
      setRendezVous(resultat.rendezVous);
      setModeDeplacement(false);
      setDateChoisie(null);
      setCreneaux([]);
      setInfo("Votre rendez-vous a bien été déplacé.");
    });
  }

  function annuler() {
    setErreur(null);
    startTransition(async () => {
      const resultat = await annulerRendezVousClienteAction(telephone, code);
      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }
      setConfirmAnnulation(false);
      setInfo("Votre rendez-vous a bien été annulé.");
      const rechargé = await chercherRendezVousAction(telephone, code);
      if (rechargé.ok) setRendezVous(rechargé.rendezVous);
    });
  }

  return (
    <div className="glass rounded-3xl border border-white/50 p-6 sm:p-10">
      {/* Recherche */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-foreground">
          Téléphone
          <input
            value={telephone}
            onChange={(e) => {
              setTelephone(e.target.value);
              setRendezVous(null);
            }}
            placeholder="06 12 34 56 78"
            className="field"
          />
        </label>
        <label className="block text-sm font-semibold text-foreground">
          Code du rendez-vous
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setRendezVous(null);
            }}
            placeholder="NAM-7K2P"
            className="field uppercase"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={chercher}
        disabled={isPending || !telephone.trim() || !code.trim()}
        className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40 btn-hover"
      >
        {isPending ? "Recherche…" : "Retrouver mon rendez-vous"}
      </button>

      {erreur && (
        <div className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
          <p className="text-sm font-medium text-rose-700">{erreur}</p>
        </div>
      )}

      {info && (
        <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-sm font-medium text-emerald-700">{info}</p>
        </div>
      )}

      {/* Détail du rendez-vous */}
      {rendezVous && (
        <div className="mt-8 border-t border-border/60 pt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {rendezVous.client.prenom} {rendezVous.client.nom} — {rendezVous.code}
          </p>

          <p className="mt-3 font-serif text-2xl text-foreground first-letter:uppercase">
            {formaterDateHeure(rendezVous.dateDebutISO)}
          </p>

          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {rendezVous.prestations.map((p, i) => (
              <li key={`${p.nom}-${i}`}>• {p.nom}</li>
            ))}
          </ul>

          {rendezVous.statut === "ANNULE" ? (
            <p className="mt-6 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              Ce rendez-vous est annulé.
            </p>
          ) : rendezVous.modifiable ? (
            <>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setModeDeplacement((v) => !v);
                    setConfirmAnnulation(false);
                  }}
                  className="rounded-full border border-primary px-6 py-2.5 text-sm text-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95"
                >
                  {modeDeplacement ? "Annuler le déplacement" : "Déplacer"}
                </button>

                {confirmAnnulation ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={annuler}
                      disabled={isPending}
                      className="rounded-full bg-rose-600 px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Oui, annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAnnulation(false)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Retour
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmAnnulation(true);
                      setModeDeplacement(false);
                    }}
                    className="rounded-full border border-border px-6 py-2.5 text-sm text-rose-700 transition-colors hover:border-rose-400"
                  >
                    Annuler le rendez-vous
                  </button>
                )}
              </div>

              {modeDeplacement && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    Choisissez un nouveau jour
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {jours.map((jour) => {
                      const actif = dateChoisie?.toDateString() === jour.toDateString();
                      return (
                        <button
                          key={jour.toISOString()}
                          type="button"
                          onClick={() => choisirDate(jour)}
                          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                            actif
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-surface text-foreground hover:border-primary/40"
                          }`}
                        >
                          {jour.toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </button>
                      );
                    })}
                  </div>

                  {dateChoisie && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {creneaux.map((iso) => (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => deplacer(iso)}
                          disabled={isPending}
                          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 disabled:opacity-40"
                        >
                          {new Date(iso).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </button>
                      ))}
                      {creneaux.length === 0 && !isPending && (
                        <p className="text-xs text-muted-foreground">
                          Aucun créneau disponible ce jour-là.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-foreground">
                Ce rendez-vous a lieu dans moins de {DELAI_MODIFICATION_HEURES} h.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Il n&apos;est plus modifiable en ligne — merci d&apos;appeler
                directement le salon pour toute modification ou annulation.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
