"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
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
import {
  creerDemandeNouvelleClienteAction,
  getCreneauxAction,
  getCreneauxMultiplesJoursAction,
} from "../actions";

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

  // Défilement automatique vers le haut de la page à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [commentConnue, setCommentConnue] = useState("");
  const [message, setMessage] = useState("");

  const [lignes, setLignes] = useState<LigneReservation[]>([]);

  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(null);
  const [moisSelectionne, setMoisSelectionne] = useState<string | null>(null);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null);
  const [creneauxParJour, setCreneauxParJour] = useState<Record<string, string[]>>({});
  const [chargementCreneaux, setChargementCreneaux] = useState(false);
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
    finition: l.finition,
    optionIds: l.options.map((o) => o.id),
  }));

  const jours = useMemo(() => {
    const base = prochainsJours(365).filter(estJourOuvert);
    if (prestationsFiltre.length === 0) return base;
    return base.filter((date) => estJourAutorisePourPrestations(date, prestationsFiltre));
  }, [prestationsFiltre]);

  const joursParMois = useMemo(() => {
    const map = new Map<string, Date[]>();
    for (const j of jours) {
      const mois = j.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      if (!map.has(mois)) map.set(mois, []);
      map.get(mois)!.push(j);
    }
    return map;
  }, [jours]);

  const listeMois = Array.from(joursParMois.keys());

  useEffect(() => {
    if (step === "creneau" && listeMois.length > 0 && !moisSelectionne) {
      setMoisSelectionne(listeMois[0]);
    }
  }, [step, listeMois, moisSelectionne]);

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    startTransition(async () => {
      const iso = await getCreneauxAction(date.toISOString(), lignesChoisies);
      setCreneaux(iso);
    });
  }

  // Chargement automatique des créneaux pour le mois sélectionné
  useEffect(() => {
    if (step === "creneau" && moisSelectionne) {
      let annule = false;
      setChargementCreneaux(true);
      const joursACharger = joursParMois.get(moisSelectionne) || [];
      startTransition(async () => {
        const res = await getCreneauxMultiplesJoursAction(
          joursACharger.map((j) => j.toISOString()),
          lignesChoisies,
        );
        if (!annule) {
          setCreneauxParJour((prev) => ({ ...prev, ...res }));
          setChargementCreneaux(false);
        }
      });
      return () => {
        annule = true;
      };
    }
  }, [step, moisSelectionne, joursParMois]);

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
    const joursDuMois = moisSelectionne ? (joursParMois.get(moisSelectionne) || []) : [];
    const keyJourSelectionne = dateSelectionnee ? dateSelectionnee.toISOString() : null;
    const creneauxJourSelectionne = keyJourSelectionne ? creneauxParJour[keyJourSelectionne] : null;
    const estEnChargement = keyJourSelectionne && creneauxJourSelectionne === undefined && chargementCreneaux;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            Choisissez votre créneau horaire
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sélectionnez un mois, puis un jour, et enfin un horaire disponible.
          </p>
        </div>

        {/* 1. Sélection du Mois */}
        <div>
          <h3 className="font-serif text-lg text-foreground mb-3">1. Mois</h3>
          <div className="flex flex-wrap gap-2">
            {listeMois.map((mois) => (
              <button
                key={mois}
                type="button"
                onClick={() => {
                  setMoisSelectionne(mois);
                  setDateSelectionnee(null);
                  setCreneauSelectionne(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all ${
                  moisSelectionne === mois
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "glass border border-white/60 text-foreground hover:border-primary/50"
                }`}
              >
                {mois}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Sélection du Jour */}
        {moisSelectionne && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="font-serif text-lg text-foreground mb-3">2. Jour</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {joursDuMois.map((jour) => {
                const estSelectionne = dateSelectionnee?.toISOString() === jour.toISOString();
                const numJour = jour.getDate();
                const nomJour = jour.toLocaleDateString("fr-FR", { weekday: "short" });
                return (
                  <button
                    key={jour.toISOString()}
                    type="button"
                    onClick={() => {
                      setDateSelectionnee(jour);
                      setCreneauSelectionne(null);
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all ${
                      estSelectionne
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "glass border border-white/60 text-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs uppercase font-medium opacity-80">{nomJour}</span>
                    <span className="text-xl font-bold mt-1">{numJour}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Sélection de l'Heure */}
        {dateSelectionnee && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="font-serif text-lg text-foreground mb-3">
              3. Heure pour le {dateSelectionnee.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            
            <div className="glass rounded-2xl border border-white/60 p-4">
              {estEnChargement ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Recherche des horaires disponibles…
                </div>
              ) : !creneauxJourSelectionne || creneauxJourSelectionne.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground italic">
                  Aucun créneau libre pour ce jour
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {creneauxJourSelectionne.map((iso) => {
                    const actif = creneauSelectionne === iso;
                    const heure = new Date(iso).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setCreneauSelectionne(iso)}
                        className={`w-full rounded-xl py-3 px-2 text-sm font-bold transition-all ${
                          actif
                            ? "bg-primary text-primary-foreground shadow-md scale-105"
                            : "bg-white/50 border border-border/60 text-foreground hover:border-primary hover:bg-primary/10"
                        }`}
                      >
                        {heure}
                      </button>
                    );
                  })}
                </div>
              )}
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
