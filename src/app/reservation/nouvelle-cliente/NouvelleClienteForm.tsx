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
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null);
  const [creneauxParJour, setCreneauxParJour] = useState<Record<string, string[]>>({});
  const [chargementCreneaux, setChargementCreneaux] = useState(false);
  const [pageJours, setPageJours] = useState(0);
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

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    startTransition(async () => {
      const iso = await getCreneauxAction(date.toISOString(), lignesChoisies);
      setCreneaux(iso);
    });
  }

  // Chargement automatique des créneaux pour les jours affichés
  useEffect(() => {
    if (step === "creneau" && jours.length > 0) {
      let annule = false;
      setChargementCreneaux(true);
      const joursACharger = jours.slice(pageJours * 6, (pageJours + 1) * 6);
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
  }, [step, jours, pageJours]);

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
    const joursAffiches = jours.slice(pageJours * 6, (pageJours + 1) * 6);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            Choisissez votre créneau horaire
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sélectionnez directement votre horaire ci-dessous sous le jour de votre choix :
          </p>
        </div>

        {chargementCreneaux && Object.keys(creneauxParJour).length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground glass rounded-2xl">
            Chargement des créneaux disponibles…
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joursAffiches.map((jour) => {
              const key = jour.toISOString();
              const creneauxJour = creneauxParJour[key];
              const estEnChargement = creneauxJour === undefined && chargementCreneaux;

              return (
                <div
                  key={key}
                  className="glass rounded-2xl border border-white/60 p-4 flex flex-col items-center shadow-sm hover:border-primary/40 transition-all"
                >
                  <div className="text-center border-b border-border/40 pb-2.5 mb-3 w-full">
                    <p className="font-serif font-bold text-base text-foreground capitalize">
                      {jour.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    {estEnChargement ? (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        Recherche…
                      </div>
                    ) : !creneauxJour || creneauxJour.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic text-center py-4 bg-muted/20 rounded-xl">
                        Aucun créneau libre
                      </div>
                    ) : (
                      creneauxJour.map((iso) => {
                        const actif = creneauSelectionne === iso;
                        const heure = new Date(iso).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <button
                            key={iso}
                            type="button"
                            onClick={() => {
                              setDateSelectionnee(jour);
                              setCreneauSelectionne(iso);
                            }}
                            className={`w-full rounded-xl py-2.5 px-3 text-xs font-bold transition-all ${
                              actif
                                ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                                : "bg-white/50 border border-border/60 text-foreground hover:border-primary hover:bg-primary/10"
                            }`}
                          >
                            {heure}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation des jours */}
        <div className="flex items-center justify-between pt-2">
          {pageJours > 0 ? (
            <button
              type="button"
              onClick={() => setPageJours((p) => p - 1)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              ‹ Jours précédents
            </button>
          ) : <div />}

          {(pageJours + 1) * 6 < jours.length && (
            <button
              type="button"
              onClick={() => setPageJours((p) => p + 1)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Voir les jours suivants ›
            </button>
          )}
        </div>

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
