"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Prestation } from "@/generated/prisma";
import { estJourOuvert } from "@/lib/horaires";
import { calculerTotal, formatDuree, formatPrix } from "@/lib/prestations";
import type { RendezVousCalendrier } from "@/components/WeekCalendar";
import {
  chercherClientParTelephoneAction,
  creerRendezVousAdminAction,
  getCreneauxAdminAction,
  modifierRendezVousAction,
  supprimerRendezVousAction,
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
  return jours.filter(estJourOuvert);
}

export function RendezVousModal({
  prestations,
  rendezVous,
  onClose,
  onSaved,
}: {
  prestations: Prestation[];
  rendezVous?: RendezVousCalendrier;
  onClose: () => void;
  onSaved: () => void;
}) {
  const modeEdition = !!rendezVous;

  const [telephone, setTelephone] = useState(rendezVous?.client.telephone ?? "");
  const [rechercheEffectuee, setRechercheEffectuee] = useState(modeEdition);
  const [clientTrouve, setClientTrouve] = useState<{
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  } | null>(rendezVous?.client ?? null);
  const [nom, setNom] = useState(rendezVous?.client.nom ?? "");
  const [prenom, setPrenom] = useState(rendezVous?.client.prenom ?? "");
  const [email, setEmail] = useState(rendezVous?.client.email ?? "");

  const [prestationIds, setPrestationIds] = useState<string[]>(
    rendezVous?.prestations.map((p) => p.prestation.id) ?? [],
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

  const jours = useMemo(() => prochainsJours(21), []);
  const prestationsSelectionnees = useMemo(
    () => prestations.filter((p) => prestationIds.includes(p.id)),
    [prestations, prestationIds],
  );
  const total = useMemo(
    () => calculerTotal(prestationsSelectionnees),
    [prestationsSelectionnees],
  );

  function toggle(id: string) {
    setPrestationIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  function chargerCreneaux(date: Date) {
    startTransition(async () => {
      const iso = await getCreneauxAdminAction(date.toISOString(), prestationIds, rendezVous?.id);
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
    startTransition(async () => {
      const c = await chercherClientParTelephoneAction(telephone);
      setRechercheEffectuee(true);
      setClientTrouve(c);
      if (c) {
        setNom(c.nom);
        setPrenom(c.prenom);
        setEmail(c.email);
      }
    });
  }

  const clientPret =
    modeEdition ||
    (rechercheEffectuee && (!!clientTrouve || (nom.trim() && prenom.trim() && email.trim())));

  function enregistrer() {
    if (!creneauSelectionne || prestationIds.length === 0 || !clientPret) return;
    setErreur(null);

    startTransition(async () => {
      if (modeEdition && rendezVous) {
        const resultat = await modifierRendezVousAction({
          rendezVousId: rendezVous.id,
          prestationIds,
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
          prestationIds,
          dateDebutISO: creneauSelectionne,
        });
        if (!resultat.ok) {
          setErreur(resultat.error);
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
        className="glass max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-white/60 bg-surface/95 p-6 sm:p-8"
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
            <p className="text-sm text-foreground">
              Cliente :{" "}
              <span className="font-medium">
                {rendezVous.client.prenom} {rendezVous.client.nom}
              </span>{" "}
              <span className="text-muted-foreground">({rendezVous.client.telephone})</span>
            </p>
          ) : (
            <div>
              <label className="block text-sm text-foreground">
                Téléphone de la cliente
                <div className="mt-1 flex gap-2">
                  <input
                    value={telephone}
                    onChange={(e) => {
                      setTelephone(e.target.value);
                      setRechercheEffectuee(false);
                      setClientTrouve(null);
                    }}
                    placeholder="06 12 34 56 78"
                    className="field mt-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={chercherClient}
                    disabled={!telephone.trim() || isPending}
                    className="shrink-0 rounded-lg border border-border px-4 text-sm text-foreground transition-colors hover:border-primary disabled:opacity-40"
                  >
                    Chercher
                  </button>
                </div>
              </label>

              {rechercheEffectuee && clientTrouve && (
                <p className="mt-2 text-sm text-primary">
                  Cliente trouvée : {clientTrouve.prenom} {clientTrouve.nom}
                </p>
              )}

              {rechercheEffectuee && !clientTrouve && (
                <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">
                    Nouvelle cliente — merci de compléter ses informations.
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
            <p className="mb-2 text-sm text-muted-foreground">Prestations</p>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {prestations.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prestationIds.includes(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                    {p.nom}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDuree(p.dureeMinutes)} · {formatPrix(p.prixCentimes)}
                  </span>
                </label>
              ))}
            </div>
            {prestationIds.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Durée {formatDuree(total.dureePrestations)} · Total{" "}
                {formatPrix(total.prixTotalCentimes)}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm text-muted-foreground">Date</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {jours.map((jour) => {
                const actif = dateSelectionnee?.toDateString() === jour.toDateString();
                return (
                  <button
                    key={jour.toISOString()}
                    type="button"
                    disabled={prestationIds.length === 0}
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
              <p className="mb-2 text-sm text-muted-foreground">Horaire</p>
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

          {erreur && <p className="text-sm text-rose-700">{erreur}</p>}

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
              disabled={isPending || !creneauSelectionne || prestationIds.length === 0 || !clientPret}
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
