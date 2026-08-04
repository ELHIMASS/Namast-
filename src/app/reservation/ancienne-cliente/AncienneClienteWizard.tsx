"use client";

import { useMemo, useState, useTransition } from "react";
import type { Prestation } from "@/generated/prisma";
import { estJourOuvert } from "@/lib/horaires";
import { calculerTotal, formatDuree, formatPrix } from "@/lib/prestations";
import { LABEL_CATEGORIE } from "@/lib/categories";
import {
  creerRendezVousDirectAction,
  findClientByPhone,
  getCreneauxAction,
} from "../actions";

type ClientTrouve = { id: string; nom: string; prenom: string; telephone: string };

type Step = "identification" | "prestations" | "creneau" | "confirme";

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

export function AncienneClienteWizard({ prestations }: { prestations: Prestation[] }) {
  const [step, setStep] = useState<Step>("identification");
  const [isPending, startTransition] = useTransition();

  const [telephone, setTelephone] = useState("");
  const [client, setClient] = useState<ClientTrouve | null>(null);
  const [erreurIdentification, setErreurIdentification] = useState<string | null>(null);

  const [prestationIds, setPrestationIds] = useState<string[]>([]);

  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(null);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null);
  const [erreurConfirmation, setErreurConfirmation] = useState<string | null>(null);

  const prestationsSelectionnees = useMemo(
    () => prestations.filter((p) => prestationIds.includes(p.id)),
    [prestations, prestationIds],
  );
  const total = useMemo(
    () => calculerTotal(prestationsSelectionnees),
    [prestationsSelectionnees],
  );

  const jours = useMemo(() => prochainsJours(21).filter(estJourOuvert), []);

  function togglePrestation(id: string) {
    setPrestationIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  function soumettreIdentification(e: React.FormEvent) {
    e.preventDefault();
    setErreurIdentification(null);
    startTransition(async () => {
      const trouve = await findClientByPhone(telephone);
      if (!trouve) {
        setErreurIdentification(
          "Aucun compte trouvé avec ce numéro. Si vous êtes déjà cliente du salon, vérifiez le numéro saisi, sinon faites une demande en tant que nouvelle cliente.",
        );
        return;
      }
      setClient(trouve);
      setStep("prestations");
    });
  }

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    startTransition(async () => {
      const iso = await getCreneauxAction(date.toISOString(), prestationIds);
      setCreneaux(iso);
    });
  }

  function confirmerRendezVous() {
    if (!client || !creneauSelectionne) return;
    setErreurConfirmation(null);
    startTransition(async () => {
      const resultat = await creerRendezVousDirectAction({
        clientId: client.id,
        prestationIds,
        dateDebutISO: creneauSelectionne,
      });
      if (!resultat.ok) {
        setErreurConfirmation(resultat.error);
        return;
      }
      setStep("confirme");
    });
  }

  if (step === "identification") {
    return (
      <form onSubmit={soumettreIdentification} className="space-y-4">
        <label className="block text-sm text-foreground">
          Numéro de téléphone
          <input
            type="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="06 12 34 56 78"
            className="field"
          />
        </label>
        {erreurIdentification && (
          <p className="text-sm text-rose-700">{erreurIdentification}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Recherche…" : "Continuer"}
        </button>
      </form>
    );
  }

  if (step === "prestations" && client) {
    return (
      <div className="space-y-6">
        <p className="text-foreground">
          Bonjour {client.prenom}, composez votre rendez-vous.
        </p>

        <div className="space-y-2">
          {prestations.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center justify-between glass rounded-xl border border-white/50 px-4 py-3 transition-colors hover:border-primary/40"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={prestationIds.includes(p.id)}
                  onChange={() => togglePrestation(p.id)}
                  className="h-4 w-4"
                />
                <span>
                  <span className="block text-foreground">{p.nom}</span>
                  <span className="block text-xs text-muted-foreground">
                    {LABEL_CATEGORIE[p.categorie] ?? p.categorie}
                  </span>
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDuree(p.dureeMinutes)} · {formatPrix(p.prixCentimes)}
              </span>
            </label>
          ))}
        </div>

        {prestationIds.length > 0 && (
          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
            Durée totale {formatDuree(total.dureePrestations)} · Total{" "}
            {formatPrix(total.prixTotalCentimes)}
          </div>
        )}

        <button
          type="button"
          disabled={prestationIds.length === 0}
          onClick={() => setStep("creneau")}
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          Choisir un créneau
        </button>
      </div>
    );
  }

  if (step === "creneau") {
    return (
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Choisissez une date</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {jours.map((jour) => {
              const actif =
                dateSelectionnee?.toDateString() === jour.toDateString();
              return (
                <button
                  key={jour.toISOString()}
                  type="button"
                  onClick={() => choisirDate(jour)}
                  className={`shrink-0 rounded-xl border px-4 py-2 text-sm transition-colors ${
                    actif
                      ? "border-primary bg-primary text-primary-foreground"
                      : "glass border-white/50 text-foreground hover:border-primary/40"
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
        </div>

        {dateSelectionnee && (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">Choisissez un horaire</p>
            {isPending && <p className="text-sm text-muted-foreground">Chargement…</p>}
            {!isPending && creneaux.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucun créneau disponible ce jour-là pour cette prestation.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {creneaux.map((iso) => {
                const actif = creneauSelectionne === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setCreneauSelectionne(iso)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                      actif
                        ? "border-primary bg-primary text-primary-foreground"
                        : "glass border-white/50 text-foreground hover:border-primary/40"
                    }`}
                  >
                    {new Date(iso).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {erreurConfirmation && <p className="text-sm text-rose-700">{erreurConfirmation}</p>}

        <button
          type="button"
          disabled={!creneauSelectionne || isPending}
          onClick={confirmerRendezVous}
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          {isPending ? "Confirmation…" : "Confirmer le rendez-vous"}
        </button>
      </div>
    );
  }

  if (step === "confirme") {
    return (
      <div className="glass rounded-2xl border border-white/50 p-8 text-center">
        <h2 className="font-serif text-2xl text-foreground">Rendez-vous confirmé</h2>
        <p className="mt-3 text-muted-foreground">
          {creneauSelectionne &&
            new Date(creneauSelectionne).toLocaleString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Un SMS de confirmation vous sera envoyé.
        </p>
      </div>
    );
  }

  return null;
}
