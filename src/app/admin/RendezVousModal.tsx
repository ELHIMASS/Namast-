"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { estJourAutorisePourPrestations } from "@/lib/reglesCreneaux";
import { estJourOuvert, estMercredi } from "@/lib/horaires";
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
import type { RendezVousCalendrier } from "@/components/WeekCalendar";
import { PrestationChooser } from "../reservation/PrestationChooser";
import type { LigneChoisie } from "@/lib/reservationLignes";
import {
  chercherClientsParNomAction,
  creerRendezVousAdminAction,
  getCreneauxAdminAction,
  modifierRendezVousAction,
  supprimerRendezVousAction,
} from "./actions";

type ClientResume = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string;
};

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

export function RendezVousModal({
  prestations,
  options,
  lissageMatrice,
  rendezVous,
  onClose,
  onSaved,
}: {
  prestations: PrestationAvecVariantes[];
  options: OptionAvecVariantes[];
  lissageMatrice: LissageTarifSimple[];
  rendezVous?: RendezVousCalendrier;
  onClose: () => void;
  onSaved: () => void;
}) {
  const modeEdition = !!rendezVous;

  // La cliente se retrouve par son nom ou son prénom. Le téléphone n'est
  // demandé que pour créer une fiche : il n'identifie plus une cliente à lui
  // seul, mais reste utile pour la joindre et pour son espace en ligne.
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<ClientResume[] | null>(
    modeEdition ? [] : null,
  );
  const [creationManuelle, setCreationManuelle] = useState(false);
  const [telephone, setTelephone] = useState(rendezVous?.client.telephone ?? "");
  const [clientTrouve, setClientTrouve] = useState<ClientResume | null>(
    rendezVous?.client ?? null,
  );
  const [nom, setNom] = useState(rendezVous?.client.nom ?? "");
  const [prenom, setPrenom] = useState(rendezVous?.client.prenom ?? "");
  const [email, setEmail] = useState(rendezVous?.client.email ?? "");

  const [lignes, setLignes] = useState<LigneReservation[]>(
    rendezVous?.prestations.map((p) => ({
      prestation: p.prestation,
      longueur: p.longueur ?? undefined,
      densite: p.densite ?? undefined,
      options: p.options.map((o) => o.option),
    })) ?? [],
  );

  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(
    rendezVous ? new Date(rendezVous.dateDebut) : null,
  );
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(
    rendezVous ? new Date(rendezVous.dateDebut).toISOString() : null,
  );

  const [isPending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmSuppression, setConfirmSuppression] = useState(false);

  // Récurrence : uniquement à la création. Modifier une occurrence existante
  // ne touche qu'elle, pas la série.
  const [recurrent, setRecurrent] = useState(false);
  const [semaines, setSemaines] = useState(4);
  const [occurrences, setOccurrences] = useState(6);
  const [bilan, setBilan] = useState<{ creees: number; ignorees: string[] } | null>(null);

  const total = useMemo(
    () => calculerTotalAvecOptions(lignes, lissageMatrice),
    [lignes, lissageMatrice],
  );
  const pretPourCreneau = lignes.length > 0 && lignes.every(ligneEstComplete);
  const lignesChoisies: LigneChoisie[] = lignes.map((l) => ({
    prestationId: l.prestation.id,
    longueur: l.longueur,
    densite: l.densite,
    optionIds: l.options.map((o) => o.id),
  }));

  const jours = useMemo(() => prochainsJours(90).filter(estJourOuvert), []);

  function chargerCreneaux(date: Date) {
    startTransition(async () => {
      const iso = await getCreneauxAdminAction(date.toISOString(), lignesChoisies, rendezVous?.id);
      setCreneaux(iso);
    });
  }

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    chargerCreneaux(date);
  }

  useEffect(() => {
    if (rendezVous) {
      chargerCreneaux(new Date(rendezVous.dateDebut));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chercherClient() {
    setErreur(null);
    setClientTrouve(null);
    setCreationManuelle(false);
    startTransition(async () => {
      const trouves = await chercherClientsParNomAction(recherche);
      setResultats(trouves);
      // Un seul résultat : on le retient d'office, c'est le cas courant.
      if (trouves.length === 1) choisirClient(trouves[0]);
    });
  }

  function choisirClient(client: ClientResume) {
    setClientTrouve(client);
    setNom(client.nom);
    setPrenom(client.prenom);
    setEmail(client.email);
    setTelephone(client.telephone ?? "");
  }

  /** Prépare la création d'une fiche à partir de ce qui a été tapé. */
  function preparerCreation() {
    const termes = recherche.trim().split(/\s+/).filter(Boolean);
    setPrenom((actuel) => actuel || termes[0] || "");
    setNom((actuel) => actuel || termes.slice(1).join(" "));
    setCreationManuelle(true);
  }

  const clientPret =
    modeEdition ||
    !!clientTrouve ||
    (creationManuelle &&
      !!nom.trim() &&
      !!prenom.trim() &&
      !!telephone.trim() &&
      !!email.trim());

  function enregistrer() {
    if (!creneauSelectionne || !pretPourCreneau || !clientPret) return;
    setErreur(null);

    startTransition(async () => {
      if (modeEdition && rendezVous) {
        const resultat = await modifierRendezVousAction({
          rendezVousId: rendezVous.id,
          lignes: lignesChoisies,
          dateDebutISO: creneauSelectionne,
        });
        if (!resultat.ok) {
          setErreur(resultat.error);
          return;
        }
      } else {
        const resultat = await creerRendezVousAdminAction({
          clientId: clientTrouve?.id,
          nouveauClient: clientTrouve
            ? undefined
            : { nom, prenom, telephone, email },
          lignes: lignesChoisies,
          dateDebutISO: creneauSelectionne,
          recurrence: recurrent ? { semaines, occurrences } : undefined,
        });
        if (!resultat.ok) {
          setErreur(resultat.error);
          return;
        }
        // Des occurrences ont pu être écartées : on le dit avant de fermer.
        if (resultat.ignorees.length > 0) {
          setBilan({ creees: resultat.creees, ignorees: resultat.ignorees });
          return;
        }
      }
      onSaved();
    });
  }

  function supprimer() {
    if (!rendezVous) return;
    startTransition(async () => {
      await supprimerRendezVousAction(rendezVous.id);
      onSaved();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            {modeEdition ? "Modifier le rendez-vous" : "Ajouter un rendez-vous"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {modeEdition && rendezVous ? (
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-sm">
                <span className="font-semibold text-foreground">Cliente:</span>{" "}
                <span className="font-medium text-foreground">
                  {rendezVous.client.prenom} {rendezVous.client.nom}
                </span>{" "}
                <span className="text-xs text-muted-foreground">({rendezVous.client.telephone})</span>
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-foreground">
                Nom ou prénom de la cliente
                <div className="mt-2 flex gap-2">
                  <input
                    value={recherche}
                    onChange={(e) => {
                      setRecherche(e.target.value);
                      setResultats(null);
                      setClientTrouve(null);
                      setCreationManuelle(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        chercherClient();
                      }
                    }}
                    placeholder="Marie Dupont"
                    className="field mt-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={chercherClient}
                    disabled={!recherche.trim() || isPending}
                    className="shrink-0 rounded-lg border border-border px-4 text-sm text-foreground transition-colors hover:border-primary disabled:opacity-40"
                  >
                    Chercher
                  </button>
                </div>
              </label>

              {clientTrouve && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">
                      {clientTrouve.prenom} {clientTrouve.nom}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      {clientTrouve.telephone}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setClientTrouve(null)}
                    className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Changer
                  </button>
                </div>
              )}

              {/* Plusieurs homonymes : le téléphone départage. */}
              {!clientTrouve && resultats && resultats.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {resultats.length} cliente{resultats.length > 1 ? "s" : ""} trouvée
                    {resultats.length > 1 ? "s" : ""} — sélectionnez la bonne fiche.
                  </p>
                  {resultats.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => choisirClient(c)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-4 py-2.5 text-left transition-colors hover:border-primary"
                    >
                      <span className="text-sm text-foreground">
                        {c.prenom} {c.nom}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.telephone}</span>
                    </button>
                  ))}
                </div>
              )}

              {!clientTrouve && resultats?.length === 0 && !creationManuelle && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/60 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Aucune cliente à ce nom.
                  </p>
                  <button
                    type="button"
                    onClick={preparerCreation}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Créer sa fiche
                  </button>
                </div>
              )}

              {!clientTrouve && creationManuelle && (
                <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">
                    Nouvelle cliente — le téléphone et l&apos;email lui permettront de
                    retrouver son rendez-vous et de recevoir les confirmations.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder="Prénom"
                      className="field mt-0"
                    />
                    <input
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Nom"
                      className="field mt-0"
                    />
                  </div>
                  <input
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="field mt-0"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="field mt-0"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Prestations</p>
            <PrestationChooser
              prestations={prestations}
              options={options}
              lissageMatrice={lissageMatrice}
              lignes={lignes}
              onChange={setLignes}
            />
            {lignes.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">Durée</span>
                <span className="font-medium text-foreground">{formatDuree(total.dureePrestations)}</span>
                <span className="text-xs text-muted-foreground ml-4">Total</span>
                <span className="font-bold text-primary">{formatPrix(total.prixTotalCentimes)}</span>
              </div>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Date</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {jours.map((jour) => {
                const actif = dateSelectionnee?.toDateString() === jour.toDateString();
                return (
                  <button
                    key={jour.toISOString()}
                    type="button"
                    disabled={!pretPourCreneau}
                    onClick={() => choisirDate(jour)}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-40 ${
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
          </div>

          {dateSelectionnee && (
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Horaire</p>
              <div className="flex flex-wrap gap-2">
                {creneaux.map((iso) => {
                  const actif = creneauSelectionne === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setCreneauSelectionne(iso)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                        actif
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface text-foreground hover:border-primary/40"
                      }`}
                    >
                      {new Date(iso).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  );
                })}
                {creneaux.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aucun créneau disponible ce jour-là.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Récurrence (création uniquement) ── */}
          {!modeEdition && creneauSelectionne && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recurrent}
                  onChange={(e) => setRecurrent(e.target.checked)}
                  className="accent-primary h-4 w-4 rounded"
                />
                <span className="text-sm font-semibold text-foreground">
                  Rendez-vous récurrent
                </span>
              </label>

              {recurrent && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-xs text-muted-foreground">
                      Toutes les
                      <select
                        value={semaines}
                        onChange={(e) => setSemaines(Number(e.target.value))}
                        className="field mt-1"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} semaine{n > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs text-muted-foreground">
                      Nombre de séances
                      <select
                        value={occurrences}
                        onChange={(e) => setOccurrences(Number(e.target.value))}
                        className="field mt-1"
                      >
                        {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                          <option key={n} value={n}>
                            {n} séances
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {occurrences} rendez-vous seront créés, le premier le jour choisi puis
                    un tous les {semaines > 1 ? `${semaines} ` : ""}
                    {semaines === 1 ? "semaine" : "semaines"}.
                    Les créneaux occupés ou jours fermés seront ignorés.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Bilan récurrence ── */}
          {bilan && (
            <div className="rounded-xl border border-primary/30 bg-surface p-5 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                ✓ {bilan.creees} rendez-vous créé{bilan.creees > 1 ? "s" : ""}
              </p>
              {bilan.ignorees.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {bilan.ignorees.length} occurrence{bilan.ignorees.length > 1 ? "s" : ""} non posée{bilan.ignorees.length > 1 ? "s" : ""} :
                  </p>
                  <ul className="space-y-1">
                    {bilan.ignorees.map((msg, i) => (
                      <li key={i} className="text-xs text-rose-600">• {msg}</li>
                    ))}
                  </ul>
                </>
              )}
              <button
                type="button"
                onClick={() => { setBilan(null); onSaved(); }}
                className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                Fermer
              </button>
            </div>
          )}

          {erreur && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3">
              <p className="text-sm text-rose-700 font-medium">{erreur}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-5">
            {modeEdition ? (
              confirmSuppression ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confirmer ?</span>
                  <button
                    type="button"
                    onClick={supprimer}
                    disabled={isPending}
                    className="rounded-full bg-rose-600 px-4 py-2 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Oui, supprimer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmSuppression(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmSuppression(true)}
                  className="rounded-full border border-border px-4 py-2 text-sm text-rose-700 transition-colors hover:border-rose-400"
                >
                  Supprimer
                </button>
              )
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={enregistrer}
              disabled={isPending || !creneauSelectionne || !pretPourCreneau || !clientPret}
              className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40"
            >
              {isPending ? "Enregistrement…" : modeEdition ? "Enregistrer" : "Créer le rendez-vous"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
