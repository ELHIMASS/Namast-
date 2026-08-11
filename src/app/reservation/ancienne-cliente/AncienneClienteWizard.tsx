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
import { PrestationChooser } from "../PrestationChooser";
import type { LigneChoisie } from "@/lib/reservationLignes";
import {
  creerRendezVousDirectAction,
  findClientByName,
  getCreneauxAction,
} from "../actions";

type ClientTrouve = { id: string; nom: string; prenom: string; telephone: string | null };

type Step = "identification" | "prestations" | "creneau" | "confirme";

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

export function AncienneClienteWizard({
  prestations,
  options,
  lissageMatrice,
}: {
  prestations: PrestationAvecVariantes[];
  options: OptionAvecVariantes[];
  lissageMatrice: LissageTarifSimple[];
}) {
  const [step, setStep] = useState<Step>("identification");
  const [isPending, startTransition] = useTransition();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [client, setClient] = useState<ClientTrouve | null>(null);
  const [erreurIdentification, setErreurIdentification] = useState<string | null>(null);

  const [lignes, setLignes] = useState<LigneReservation[]>([]);

  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(null);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null);
  const [erreurConfirmation, setErreurConfirmation] = useState<string | null>(null);
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

  function soumettreIdentification(e: React.FormEvent) {
    e.preventDefault();
    setErreurIdentification(null);
    startTransition(async () => {
      const resultat = await findClientByName(prenom, nom, telephone);

      if (resultat.statut === "homonymes") {
        setErreurIdentification(
          "Plusieurs clientes portent ce nom. Merci d'appeler le salon pour réserver, afin de ne pas nous tromper de fiche.",
        );
        return;
      }

      if (resultat.statut === "introuvable") {
        setErreurIdentification(
          "Aucun compte à ce nom. Si vous êtes déjà cliente du salon, vérifiez l'orthographe de votre prénom et de votre nom, sinon faites une demande en tant que nouvelle cliente.",
        );
        return;
      }

      setClient(resultat.client);
      setStep("prestations");
    });
  }

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    startTransition(async () => {
      const iso = await getCreneauxAction(date.toISOString(), lignesChoisies);
      setCreneaux(iso);
    });
  }

  function confirmerRendezVous() {
    if (!client || !creneauSelectionne) return;
    setErreurConfirmation(null);
    startTransition(async () => {
      const resultat = await creerRendezVousDirectAction({
        clientId: client.id,
        lignes: lignesChoisies,
        dateDebutISO: creneauSelectionne,
      });
      if (!resultat.ok) {
        setErreurConfirmation(resultat.error);
        return;
      }
      setCodeRendezVous(resultat.code ?? null);
      setStep("confirme");
    });
  }

  if (step === "identification") {
    return (
      <form onSubmit={soumettreIdentification} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-foreground">
            Prénom
            <input
              required
              autoComplete="given-name"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Marie"
              className="field"
            />
          </label>
          <label className="block text-sm text-foreground">
            Nom
            <input
              required
              autoComplete="family-name"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Dupont"
              className="field"
            />
          </label>
        </div>
        <label className="block text-sm text-foreground">
          Téléphone
          <input
            type="tel"
            autoComplete="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="06 12 34 56 78"
            className="field mt-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Le téléphone aide à retrouver votre fiche lorsque plusieurs clientes portent le même nom.
          </p>
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

        <PrestationChooser
          prestations={prestations}
          options={options}
          lissageMatrice={lissageMatrice}
          lignes={lignes}
          onChange={setLignes}
        />

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
          Choisir un créneau
        </button>
      </div>
    );
  }

  if (step === "creneau") {
    return (
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Choisissez une date
          </p>
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
              consulter, déplacer ou annuler ce rendez-vous depuis{" "}
              <Link href="/mon-rendez-vous" className="text-primary underline">
                votre espace
              </Link>
              , jusqu&apos;à 24 h avant.
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          Un e-mail de confirmation vous sera envoyé.
        </p>
      </div>
    );
  }

  return null;
}
