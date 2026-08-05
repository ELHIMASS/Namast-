"use client";

import { useState, useTransition } from "react";
import {
  ajouterFermetureAction,
  listerFermeturesAction,
  supprimerFermetureAction,
} from "./actions";

export type FermetureVue = {
  id: string;
  dateDebut: string;
  dateFin: string;
  motif: string | null;
};

function formaterJour(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function GestionFermetures({ initiales }: { initiales: FermetureVue[] }) {
  const [fermetures, setFermetures] = useState(initiales);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function rafraichir() {
    startTransition(async () => setFermetures(await listerFermeturesAction()));
  }

  function ajouter() {
    setErreur(null);
    setInfo(null);
    startTransition(async () => {
      const resultat = await ajouterFermetureAction({ dateDebut, dateFin, motif });
      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }
      setInfo(
        resultat.conflits > 0
          ? `Fermeture enregistrée. Attention : ${resultat.conflits} rendez-vous déjà pris tombe(nt) dans cette période, à traiter manuellement.`
          : "Fermeture enregistrée.",
      );
      setDateDebut("");
      setDateFin("");
      setMotif("");
      setFermetures(await listerFermeturesAction());
    });
  }

  function supprimer(id: string) {
    startTransition(async () => {
      await supprimerFermetureAction(id);
      setFermetures(await listerFermeturesAction());
      setInfo("Fermeture supprimée.");
    });
  }

  return (
    <div className="space-y-8">
      {/* Ajout */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-serif text-xl text-foreground">Poser une fermeture</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Les deux dates sont incluses. Pour un seul jour, laissez la date de fin
          vide.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold text-foreground">
            Du
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm font-semibold text-foreground">
            Au (facultatif)
            <input
              type="date"
              value={dateFin}
              min={dateDebut || undefined}
              onChange={(e) => setDateFin(e.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm font-semibold text-foreground">
            Motif (facultatif)
            <input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Congés d'été"
              className="field"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={ajouter}
          disabled={isPending || !dateDebut}
          className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          {isPending ? "Enregistrement…" : "Fermer ces dates"}
        </button>

        {erreur && (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
            <p className="text-sm font-medium text-rose-700">{erreur}</p>
          </div>
        )}
        {info && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-sm font-medium text-amber-800">{info}</p>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">
            Fermetures enregistrées
          </h2>
          <button
            type="button"
            onClick={rafraichir}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Rafraîchir
          </button>
        </div>

        {fermetures.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucune fermeture pour le moment. Le salon suit ses horaires habituels.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-border/60">
            {fermetures.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground first-letter:uppercase">
                    {f.dateDebut === f.dateFin
                      ? formaterJour(f.dateDebut)
                      : `${formaterJour(f.dateDebut)} → ${formaterJour(f.dateFin)}`}
                  </p>
                  {f.motif && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.motif}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => supprimer(f.id)}
                  disabled={isPending}
                  className="shrink-0 rounded-full border border-border px-4 py-1.5 text-xs text-rose-700 transition-colors hover:border-rose-400 disabled:opacity-40"
                >
                  Rouvrir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
