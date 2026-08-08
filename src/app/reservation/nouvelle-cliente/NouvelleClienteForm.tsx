"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { estJourOuvert } from "@/lib/horaires";
import { estJourAutorisePourPrestations } from "@/lib/reglesCreneaux";
import {
  calculerTotalAvecOptions,
  formatDuree,
  formatPrix,
  ligneEstComplete,
  type LigneReservation,
  type LissageTarifSimple,
  type OptionAvecVariantes,
  type PrestationAvecVariantes,
} from "@/lib/prestations";
import { BarreFixeMobile } from "@/components/BarreFixeMobile";
import { PrestationChooser } from "../PrestationChooser";
import type { LigneChoisie } from "@/lib/reservationLignes";
import { creerDemandeNouvelleClienteAction, getCreneauxAction } from "../actions";

type Step = "infos" | "prestations" | "creneau" | "envoyee";

function prochainsJours(nombre: number): Date[] {
  const jours: Date[] = [];
  const aujourdhui = new Date();
  aujourdhui.setHours(12, 0, 0, 0);
  for (let i = 0; i < nombre; i++) {
    const d = new Date(aujourdhui);
    d.setDate(d.getDate() + i);
    jours.push(d);
  }
  return jours;
}

export function NouvelleClienteForm({
  prestations,
  options,
  lissageMatrice,
}: {
  prestations: PrestationAvecVariantes[];
  options: OptionAvecVariantes[];
  lissageMatrice: LissageTarifSimple[];
}) {
  const [step, setStep] = useState<Step>("infos");
  const [isPending, startTransition] = useTransition();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [commentConnue, setCommentConnue] = useState("");
  const [message, setMessage] = useState("");

  const [lignes, setLignes] = useState<LigneReservation[]>([]);

  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(null);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [codeRendezVous, setCodeRendezVous] = useState<string | null>(null);

  const total = useMemo(
    () => calculerTotalAvecOptions(lignes, lissageMatrice),
    [lignes, lissageMatrice],
  );
  const pretPourCreneau = lignes.length > 0 && lignes.every(ligneEstComplete);
  const prestationsFiltre = useMemo(
    () =>
      lignes.map((l) => ({
        profil: l.prestation.profil,
        categorie: l.prestation.categorie,
        estLissage: l.prestation.estLissage,
        formule: l.prestation.formule,
      })),
    [lignes],
  );

  const lignesChoisies: LigneChoisie[] = lignes.map((l) => ({
    prestationId: l.prestation.id,
    longueur: l.longueur,
    densite: l.densite,
    optionIds: l.options.map((o) => o.id),
  }));

  const jours = useMemo(() => {
    const base = prochainsJours(90).filter(estJourOuvert);
    if (prestationsFiltre.length === 0) return base;
    return base.filter((date) => estJourAutorisePourPrestations(date, prestationsFiltre));
  }, [prestationsFiltre]);

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    startTransition(async () => {
      const iso = await getCreneauxAction(date.toISOString(), lignesChoisies);
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
        lignes: lignesChoisies,
        dateDebutISO: creneauSelectionne,
      });
      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }
      setCodeRendezVous(resultat.code ?? null);
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
        <PrestationChooser
          prestations={prestations}
          options={options}
          lissageMatrice={lissageMatrice}
          lignes={lignes}
          onChange={setLignes}
        />

        {/* Desktop : récapitulatif et bouton dans le flux de la page. */}
        <div className="hidden md:block md:space-y-6">
          {lignes.length > 0 && (
            <div className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
              Durée totale {formatDuree(total.dureePrestations)} · Total{" "}
              {formatPrix(total.prixTotalCentimes)}
            </div>
          )}

          <button
            type="button"
            disabled={!pretPourCreneau}
            onClick={() => setStep("creneau")}
            className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            Choisir un créneau souhaité
          </button>
        </div>

        {/* Mobile : la carte fait plusieurs écrans, le total et la suite
            restent donc visibles en permanence en bas de l'écran. */}
        <div className="pb-28 md:hidden" />
        <BarreFixeMobile>
          {lignes.length > 0 && (
            <p className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatDuree(total.dureePrestations)}
              </span>
              <span className="font-semibold text-primary">
                {formatPrix(total.prixTotalCentimes)}
              </span>
            </p>
          )}
          <button
            type="button"
            disabled={!pretPourCreneau}
            onClick={() => setStep("creneau")}
            className="w-full rounded-full bg-primary px-6 py-3.5 text-primary-foreground transition-opacity active:scale-[0.99] disabled:opacity-40"
          >
            Choisir un créneau souhaité
          </button>
        </BarreFixeMobile>
      </div>
    );
  }

  if (step === "creneau") {
    return (
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Date souhaitée
          </p>
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
        {codeRendezVous && (
          <div className="mt-6 rounded-xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Votre code de rendez-vous
            </p>
            <p className="mt-2 font-serif text-3xl tracking-widest text-foreground">
              {codeRendezVous}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Notez-le : avec votre numéro de téléphone, il vous permet de
              suivre, déplacer ou annuler cette demande depuis{" "}
              <Link href="/mon-rendez-vous" className="text-primary underline">
                votre espace
              </Link>
              , jusqu&apos;à 24 h avant.
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          Vous recevrez une notification dès qu&apos;une décision sera prise.
        </p>
      </div>
    );
  }

  return null;
}
