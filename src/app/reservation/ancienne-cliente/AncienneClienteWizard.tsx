"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  calculerDureeLignesAction,
  creerReservationGroupeeAction,
  findClientByName,
  getCreneauxAction,
} from "../actions";

type ClientTrouve = { id: string; nom: string; prenom: string; telephone: string | null };

type Step =
  | "identification"
  | "nombre"
  | "prenoms"
  | "prestations"
  | "creneau"
  | "panier"
  | "confirme";

const ORDRE_ETAPES: Step[] = [
  "identification",
  "nombre",
  "prenoms",
  "prestations",
  "creneau",
  "panier",
  "confirme",
];

/** Au-delà, il ne s'agit plus d'une famille mais d'un groupe à organiser au téléphone. */
const MAX_PERSONNES = 6;

/**
 * Une personne du panier, avec ses prestations et son créneau.
 *
 * Chaque personne choisit son propre horaire : le papa à 14h, un enfant à
 * 15h30. Chacune donnera donc un rendez-vous distinct, tous liés entre eux à
 * la validation.
 */
type Personne = {
  id: string;
  prenom: string;
  lignes: LigneReservation[];
  /** Null tant que cette personne n'a pas encore choisi son horaire. */
  creneauISO: string | null;
  dureeMinutes: number;
  prixCentimes: number;
};

function personneVide(prenom = ""): Personne {
  return {
    id: crypto.randomUUID(),
    prenom,
    lignes: [],
    creneauISO: null,
    dureeMinutes: 0,
    prixCentimes: 0,
  };
}

// Clé du tunnel dans sessionStorage : effacé à la fermeture de l'onglet, jamais
// écrit sur le disque. L'identification et les prestations déjà choisies y
// survivent à un retour en arrière ou à un rechargement.
const CLE_ETAT = "namaste-reservation-ancienne-cliente";

type EtatSauvegarde = {
  step: Step;
  prenom: string;
  nom: string;
  client: ClientTrouve | null;
  lignes: LigneReservation[];
  dateSelectionneeISO: string | null;
  creneauSelectionne: string | null;
  personnes: Personne[];
  indexCourant: number;
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
  const [client, setClient] = useState<ClientTrouve | null>(null);
  const [erreurIdentification, setErreurIdentification] = useState<string | null>(null);
  // Réclamé seulement quand plusieurs fiches portent le même nom : le numéro
  // les départage sans jamais rien divulguer de l'une ou de l'autre.
  const [telephone, setTelephone] = useState("");
  const [telephoneRequis, setTelephoneRequis] = useState(false);

  const [lignes, setLignes] = useState<LigneReservation[]>([]);

  // Les personnes de la réservation, déclarées d'emblée puis complétées
  // l'une après l'autre. `indexCourant` désigne celle en cours de
  // composition ; `lignes` ci-dessus en est la copie de travail.
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [indexCourant, setIndexCourant] = useState(0);
  const [erreurPanier, setErreurPanier] = useState<string | null>(null);

  const personneCourante = personnes[indexCourant];

  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(null);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null);
  const [rendezVousConfirmes, setRendezVousConfirmes] = useState<
    { code: string | null; personne: string | null; debutISO: string; finISO: string }[]
  >([]);

  // ── Persistance du tunnel ────────────────────────────────────────────────
  // Tout l'état vivait en mémoire React : le bouton « retour » du navigateur
  // sortait du tunnel et la cliente devait se ré-identifier en repartant de
  // zéro. On restaure donc l'état au montage, on le sauvegarde à chaque
  // changement, et on pousse une entrée d'historique par étape pour que
  // « retour » revienne à l'étape précédente au lieu de quitter la page.
  const restaure = useRef(false);

  useEffect(() => {
    try {
      const brut = sessionStorage.getItem(CLE_ETAT);
      if (brut) {
        const e = JSON.parse(brut) as Partial<EtatSauvegarde>;

        // Un état incohérent avec l'étape reprise afficherait une page vide :
        // c'est le cas d'un tunnel entamé avant une mise à jour du site, dont
        // le format sauvegardé ne correspond plus. On repart de zéro plutôt
        // que de laisser la cliente devant un écran blanc.
        const etapesExigeantDesPersonnes: Step[] = ["prenoms", "prestations", "creneau", "panier"];
        const coherent =
          !!e.step &&
          ORDRE_ETAPES.includes(e.step) &&
          (!etapesExigeantDesPersonnes.includes(e.step) ||
            (Array.isArray(e.personnes) && e.personnes.length > 0)) &&
          (e.step === "identification" || !!e.client);

        // Un rendez-vous déjà confirmé ne doit pas être rejoué : on repart à zéro.
        if (e.step && e.step !== "confirme" && coherent) {
          setStep(e.step);
          setPrenom(e.prenom ?? "");
          setNom(e.nom ?? "");
          setClient(e.client ?? null);
          setLignes(e.lignes ?? []);
          setPersonnes(e.personnes ?? []);
          setIndexCourant(e.indexCourant ?? 0);
          setCreneauSelectionne(e.creneauSelectionne ?? null);
          if (e.dateSelectionneeISO) {
            setDateSelectionnee(new Date(e.dateSelectionneeISO));
          }
          window.history.replaceState({ etape: e.step }, "");
          restaure.current = true;
          return;
        }
        sessionStorage.removeItem(CLE_ETAT);
      }
    } catch {
      // sessionStorage indisponible (navigation privée stricte) : le tunnel
      // fonctionne toujours, simplement sans reprise après un retour.
    }
    window.history.replaceState({ etape: "identification" }, "");
    restaure.current = true;
  }, []);

  useEffect(() => {
    if (!restaure.current) return;
    try {
      const etat: EtatSauvegarde = {
        step,
        prenom,
        nom,
        client,
        lignes,
        dateSelectionneeISO: dateSelectionnee?.toISOString() ?? null,
        creneauSelectionne,
        personnes,
        indexCourant,
      };
      sessionStorage.setItem(CLE_ETAT, JSON.stringify(etat));
    } catch {
      // Stockage plein ou refusé : sans effet sur le déroulé de la réservation.
    }
  }, [
    step,
    prenom,
    nom,
    client,
    lignes,
    dateSelectionnee,
    creneauSelectionne,
    personnes,
    indexCourant,
  ]);

  useEffect(() => {
    function surRetourNavigateur(e: PopStateEvent) {
      const etape = (e.state as { etape?: Step } | null)?.etape;
      if (etape && ORDRE_ETAPES.includes(etape)) setStep(etape);
    }
    window.addEventListener("popstate", surRetourNavigateur);
    return () => window.removeEventListener("popstate", surRetourNavigateur);
  }, []);

  // Défilement automatique vers le haut de la page à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, indexCourant]);

  /** Change d'étape en laissant une trace dans l'historique du navigateur. */
  function allerA(prochaine: Step) {
    setStep(prochaine);
    window.history.pushState({ etape: prochaine }, "");
  }

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
    personne: l.personne?.trim() || undefined,
  }));

  const jours = useMemo(() => {
    const base = prochainsJours(365).filter(estJourOuvert);
    if (prestationsFiltre.length === 0) return base;
    return base.filter((date) => estJourAutorisePourPrestations(date, prestationsFiltre));
  }, [prestationsFiltre]);

  function soumettreIdentification(e: React.FormEvent) {
    e.preventDefault();
    setErreurIdentification(null);
    startTransition(async () => {
      const resultat = await findClientByName(prenom, nom, telephone);

      if (resultat.statut === "telephone_requis") {
        setTelephoneRequis(true);
        setErreurIdentification(
          "Plusieurs clientes portent ce nom. Indiquez votre numéro de téléphone pour que nous retrouvions votre fiche.",
        );
        return;
      }

      if (resultat.statut === "telephone_inconnu") {
        setTelephoneRequis(true);
        setErreurIdentification(
          "Ce numéro ne correspond à aucune fiche à ce nom. Vérifiez votre saisie, ou appelez le salon.",
        );
        return;
      }

      if (resultat.statut === "homonymes") {
        setErreurIdentification(
          "Plusieurs clientes portent ce nom et ce numéro. Merci d'appeler le salon pour réserver, afin de ne pas nous tromper de fiche.",
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
      allerA("nombre");
    });
  }

  /** Déclare le nombre de personnes et pré-remplit la première avec la cliente. */
  function choisirNombre(n: number) {
    setPersonnes((actuelles) =>
      Array.from({ length: n }, (_, i) =>
        actuelles[i] ?? personneVide(i === 0 ? (client?.prenom ?? "") : ""),
      ),
    );
    setIndexCourant(0);
    allerA("prenoms");
  }

  function modifierPrenom(i: number, valeur: string) {
    setPersonnes((p) => p.map((x, n) => (n === i ? { ...x, prenom: valeur } : x)));
  }

  /** Ouvre la composition d'une personne, en restaurant ses choix précédents. */
  function composerPersonne(i: number) {
    setIndexCourant(i);
    setLignes(personnes[i]?.lignes ?? []);
    setDateSelectionnee(null);
    setCreneaux([]);
    setCreneauSelectionne(personnes[i]?.creneauISO ?? null);
    allerA("prestations");
  }

  // Créneaux déjà retenus par les *autres* personnes. Ils sont transmis au
  // serveur pour être retirés des disponibilités : sans cela, la deuxième
  // personne se verrait proposer l'horaire que la première vient de prendre.
  const creneauxDesAutres = personnes
    .filter((p, i) => i !== indexCourant && p.creneauISO)
    .map((p) => ({
      debutISO: p.creneauISO as string,
      finISO: new Date(
        new Date(p.creneauISO as string).getTime() + p.dureeMinutes * 60000,
      ).toISOString(),
    }));

  function choisirDate(date: Date) {
    setDateSelectionnee(date);
    setCreneauSelectionne(null);
    startTransition(async () => {
      const iso = await getCreneauxAction(
        date.toISOString(),
        lignesChoisies,
        creneauxDesAutres,
      );
      setCreneaux(iso);
    });
  }

  /** Enregistre les prestations de la personne courante, puis passe au créneau. */
  function versCreneau() {
    setPersonnes((p) =>
      p.map((x, n) => (n === indexCourant ? { ...x, lignes } : x)),
    );
    allerA("creneau");
  }

  /**
   * Fige le créneau de la personne courante, puis enchaîne sur la suivante
   * ou, s'il n'en reste aucune, sur le récapitulatif.
   */
  function validerCreneau() {
    if (!creneauSelectionne || lignes.length === 0) return;
    const creneau = creneauSelectionne;
    setErreurPanier(null);
    startTransition(async () => {
      const { dureeMinutes, prixCentimes } =
        await calculerDureeLignesAction(lignesChoisies);
      setPersonnes((p) =>
        p.map((x, n) =>
          n === indexCourant
            ? { ...x, lignes, creneauISO: creneau, dureeMinutes, prixCentimes }
            : x,
        ),
      );

      const suivante = indexCourant + 1;
      if (suivante < personnes.length) {
        setIndexCourant(suivante);
        setLignes(personnes[suivante].lignes);
        setDateSelectionnee(null);
        setCreneaux([]);
        setCreneauSelectionne(personnes[suivante].creneauISO);
        allerA("prestations");
        return;
      }
      allerA("panier");
    });
  }

  function validerPanier() {
    const completes = personnes.filter((p) => p.creneauISO && p.lignes.length > 0);
    if (!client || completes.length === 0) return;
    setErreurPanier(null);
    startTransition(async () => {
      const resultat = await creerReservationGroupeeAction({
        clientId: client.id,
        elements: completes.map((e) => ({
          personne: e.prenom.trim() || undefined,
          lignes: e.lignes.map((l) => ({
            prestationId: l.prestation.id,
            longueur: l.longueur,
            densite: l.densite,
            optionIds: l.options.map((o) => o.id),
          })),
          dateDebutISO: e.creneauISO as string,
        })),
      });
      if (!resultat.ok) {
        setErreurPanier(resultat.error);
        return;
      }
      setRendezVousConfirmes(resultat.rendezVous);
      // Les rendez-vous sont pris : on vide le tunnel pour qu'un retour en
      // arrière ne repropose pas de les valider une seconde fois.
      try {
        sessionStorage.removeItem(CLE_ETAT);
      } catch {
        // Sans effet : l'étape « confirme » n'est de toute façon pas restaurée.
      }
      allerA("confirme");
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
        {telephoneRequis && (
          <label className="block text-sm text-foreground">
            Téléphone
            <input
              required
              type="tel"
              autoComplete="tel"
              autoFocus
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="field"
            />
          </label>
        )}

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

  if (step === "nombre" && client) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            Bonjour {client.prenom}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Combien de personnes viennent à ce rendez-vous ? Vous pourrez
            choisir une prestation et un horaire pour chacune.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: MAX_PERSONNES }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => choisirNombre(n)}
              className={`rounded-2xl border px-4 py-5 font-serif text-2xl transition-colors ${
                personnes.length === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "glass border-white/50 text-foreground hover:border-primary/40"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Au-delà de {MAX_PERSONNES} personnes, appelez le salon : nous
          organiserons le planning avec vous.
        </p>
      </div>
    );
  }

  if (step === "prenoms" && client) {
    const tousNommes = personnes.every((p) => p.prenom.trim().length > 0);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            Qui vient&nbsp;?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Indiquez le prénom de chaque personne. Il apparaîtra sur le
            rendez-vous, pour que nous sachions qui nous accueillons.
          </p>
        </div>

        <div className="space-y-3">
          {personnes.map((p, i) => (
            <label key={p.id} className="block text-sm text-foreground">
              Personne {i + 1}
              <input
                required
                autoFocus={i === 0}
                value={p.prenom}
                onChange={(e) => modifierPrenom(i, e.target.value)}
                placeholder={i === 0 ? client.prenom : "Théo"}
                className="field"
              />
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            disabled={!tousNommes}
            onClick={() => composerPersonne(0)}
            className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40 sm:flex-1"
          >
            Continuer
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full rounded-full border border-primary/40 px-6 py-3 text-foreground transition-colors hover:border-primary sm:w-auto"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (step === "prestations" && client && personneCourante) {
    return (
      <div className="space-y-6">
        <div>
          {personnes.length > 1 && (
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Personne {indexCourant + 1} sur {personnes.length}
            </p>
          )}
          <h2 className="mt-1 font-serif text-2xl text-foreground">
            Prestations de {personneCourante.prenom}
          </h2>
        </div>

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

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            disabled={!pretPourCreneau}
            onClick={versCreneau}
            className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40 sm:flex-1"
          >
            Choisir un créneau
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full rounded-full border border-primary/40 px-6 py-3 text-foreground transition-colors hover:border-primary sm:w-auto"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (step === "creneau" && personneCourante) {
    const derniere = indexCourant + 1 >= personnes.length;
    return (
      <div className="space-y-6">
        <div>
          {personnes.length > 1 && (
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Personne {indexCourant + 1} sur {personnes.length}
            </p>
          )}
          <h2 className="mt-1 font-serif text-2xl text-foreground">
            Horaire de {personneCourante.prenom}
          </h2>
        </div>

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

        {erreurPanier && <p className="text-sm text-rose-700">{erreurPanier}</p>}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            disabled={!creneauSelectionne || isPending}
            onClick={validerCreneau}
            className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40 sm:flex-1"
          >
            {isPending
              ? "Enregistrement…"
              : derniere
                ? "Voir le récapitulatif"
                : `Continuer avec ${personnes[indexCourant + 1]?.prenom || "la personne suivante"}`}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full rounded-full border border-primary/40 px-6 py-3 text-foreground transition-colors hover:border-primary sm:w-auto"
          >
            Modifier mes prestations
          </button>
        </div>
      </div>
    );
  }

  if (step === "panier") {
    const completes = personnes.filter((p) => p.creneauISO && p.lignes.length > 0);
    const totalReservation = completes.reduce((s, e) => s + e.prixCentimes, 0);
    const dureeCumulee = completes.reduce((s, e) => s + e.dureeMinutes, 0);

    return (
      <div className="space-y-6">
        <h2 className="font-serif text-2xl text-foreground">Votre réservation</h2>

        <ul className="space-y-3">
          {personnes.map((p, i) => {
            const complete = p.creneauISO && p.lignes.length > 0;
            return (
              <li key={p.id} className="glass rounded-2xl border border-white/50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg text-foreground">{p.prenom}</p>

                    {complete ? (
                      <>
                        <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                          {p.lignes.map((l, n) => (
                            <li key={`${p.id}-${n}`}>
                              {l.prestation.nom}
                              {l.options.length > 0 &&
                                ` + ${l.options.map((o) => o.nom).join(", ")}`}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-sm text-foreground">
                          {new Date(p.creneauISO as string).toLocaleString("fr-FR", {
                            timeZone: "Europe/Paris",
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {formatDuree(p.dureeMinutes)}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-rose-700">
                        Prestation ou horaire à choisir
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {complete && (
                      <p className="font-bold text-primary">
                        {formatPrix(p.prixCentimes)}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => composerPersonne(i)}
                      className="mt-2 text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {completes.length > 0 && (
          <div className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée cumulée</span>
              <span>{formatDuree(dureeCumulee)}</span>
            </div>
            <div className="mt-1 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrix(totalReservation)}</span>
            </div>
          </div>
        )}

        {erreurPanier && <p className="text-sm text-rose-700">{erreurPanier}</p>}

        <button
          type="button"
          disabled={completes.length !== personnes.length || isPending}
          onClick={validerPanier}
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-40"
        >
          {isPending ? "Validation…" : "Valider mes rendez-vous"}
        </button>
      </div>
    );
  }

  if (step === "confirme") {
    return (
      <div className="glass rounded-2xl border border-white/50 p-8 text-center">
        <h2 className="font-serif text-2xl text-foreground">
          {rendezVousConfirmes.length > 1
            ? "Rendez-vous confirmés"
            : "Rendez-vous confirmé"}
        </h2>

        <ul className="mt-6 space-y-4 text-left">
          {rendezVousConfirmes.map((r) => (
            <li
              key={r.code ?? r.debutISO}
              className="rounded-xl border border-primary/40 bg-primary/5 p-5"
            >
              <p className="font-serif text-lg text-foreground">
                {r.personne || client?.prenom || "Vous"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(r.debutISO).toLocaleString("fr-FR", {
                  timeZone: "Europe/Paris",
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {r.code && (
                <>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Code de rendez-vous
                  </p>
                  <p className="mt-1 font-serif text-2xl tracking-widest text-foreground">
                    {r.code}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-muted-foreground">
          {rendezVousConfirmes.length > 1
            ? "Notez ces codes : avec votre numéro de téléphone, chacun permet de consulter, déplacer ou annuler le rendez-vous correspondant depuis "
            : "Notez-le : avec votre numéro de téléphone, il permet de consulter, déplacer ou annuler ce rendez-vous depuis "}
          <Link href="/mon-rendez-vous" className="text-primary underline">
            votre espace
          </Link>
          , jusqu&apos;à 24 h avant.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Un e-mail de confirmation vous sera envoyé.
        </p>
      </div>
    );
  }

  // Filet de sécurité : aucune combinaison d'état ne doit produire un écran
  // vide. Si l'étape courante ne correspond à aucun rendu — état corrompu,
  // reprise après mise à jour — on ramène la cliente au début du tunnel.
  return (
    <div className="space-y-4">
      <p className="text-foreground">
        Votre réservation n&apos;a pas pu être reprise. Reprenons depuis le début.
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.removeItem(CLE_ETAT);
          } catch {
            // Sans effet : on réinitialise l'état en mémoire de toute façon.
          }
          setPersonnes([]);
          setIndexCourant(0);
          setLignes([]);
          allerA("identification");
        }}
        className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
      >
        Recommencer
      </button>
    </div>
  );
}
