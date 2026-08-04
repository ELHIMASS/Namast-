"use client";

import { useMemo, useState, useTransition } from "react";
import type { Prestation } from "@/generated/prisma";
import { estJourOuvert } from "@/lib/horaires";
import { calculerTotal, formatDuree, formatPrix } from "@/lib/prestations";
import { LABEL_CATEGORIE } from "@/lib/categories";
import { creerDemandeNouvelleClienteAction, getCreneauxAction } from "../actions";

type Step = "infos" | "prestations" | "creneau" | "envoyee";

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

export function NouvelleClienteForm({ prestations }: { prestations: Prestation[] }) {
  const [step, setStep] = useState<Step>("infos");
  const [isPending, startTransition] = useTransition();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [commentConnue, setCommentConnue] = useState("");
  const [message, setMessage] = useState("");

  const [prestationIds, setPrestationIds] = useState<string[]>([]);

  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(null);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

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

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    startTransition(async () => {
      const iso = await getCreneauxAction(date.toISOString(), prestationIds);
      setCreneaux(iso);
    });
  }

  function envoyerDemande() {
    if (!creneauSelectionne) return;
    setErreur(null);
    startTransition(async () => {
      const resultat = await creerDemandeNouvelleClienteAction({
        nom,
        prenom,
        telephone,
        email,
        commentConnue: commentConnue || undefined,
        message: message || undefined,
        prestationIds,
        dateDebutISO: creneauSelectionne,
      });
      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }
      setStep("envoyee");
    });
  }

  if (step === "infos") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStep("prestations");
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-foreground">
            Prénom
            <input
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm text-foreground">
            Nom
            <input
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="field"
            />
          </label>
        </div>

        <label className="block text-sm text-foreground">
          Téléphone
          <input
            type="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="06 12 34 56 78"
            className="field"
          />
        </label>

        <label className="block text-sm text-foreground">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="field"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Utilisé pour vous informer de toute confirmation ou modification de vos
            rendez-vous.
          </span>
        </label>

        <label className="block text-sm text-foreground">
          Comment nous avez-vous connus ?
          <input
            value={commentConnue}
            onChange={(e) => setCommentConnue(e.target.value)}
            placeholder="Bouche à oreille, Instagram, recommandation…"
            className="field"
          />
        </label>

        <label className="block text-sm text-foreground">
          Que souhaitez-vous faire ?
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Décrivez votre besoin (facultatif)"
            className="field"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
        >
          Continuer
        </button>
      </form>
    );
  }

  if (step === "prestations") {
    return (
      <div className="space-y-6">
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
          Choisir un créneau souhaité
        </button>
      </div>
    );
  }

  if (step === "creneau") {
    return (
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Date souhaitée</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {jours.map((jour) => {
              const actif = dateSelectionnee?.toDateString() === jour.toDateString();
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
            <p className="mb-3 text-sm text-muted-foreground">Horaire souhaité</p>
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

        {erreur && <p className="text-sm text-rose-700">{erreur}</p>}

        <button
          type="button"
          disabled={!creneauSelectionne || isPending}
          onClick={envoyerDemande}
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          {isPending ? "Envoi…" : "Envoyer ma demande"}
        </button>
      </div>
    );
  }

  if (step === "envoyee") {
    return (
      <div className="glass rounded-2xl border border-white/50 p-8 text-center">
        <h2 className="font-serif text-2xl text-foreground">Demande envoyée</h2>
        <p className="mt-3 text-muted-foreground">
          Votre demande a bien été transmise. La professionnelle vous répondra sous 48
          heures maximum pour confirmer, refuser ou proposer un autre créneau.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Vous recevrez une notification dès qu&apos;une décision sera prise.
        </p>
      </div>
    );
  }

  return null;
}
