"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  calculerTotalAvecOptions,
  formatPrix,
  type LigneReservation,
  type LissageTarifSimple,
  type OptionAvecVariantes,
  type PrestationAvecVariantes,
} from "@/lib/prestations";
import { LABEL_LONGUEUR } from "@/lib/categories";
import { WeekCalendar, type RendezVousCalendrier } from "@/components/WeekCalendar";
import { RendezVousModal } from "./RendezVousModal";
import {
  accepterDemandeAction,
  envoyerRappelsDemainAction,
  refuserDemandeAction,
} from "./actions";

type RendezVous = {
  id: string;
  dateDebut: Date;
  dateFin: Date;
  message: string | null;
  createdAt: Date;
  /** Posé par le salon depuis l'espace pro, et non pris en ligne par la cliente. */
  creeParAdmin: boolean;
  client: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    email: string;
    commentConnue: string | null;
  };
  prestations: RendezVousCalendrier["prestations"];
};

function formatDateHeure(date: Date) {
  return new Date(date).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function versLignes(prestations: RendezVous["prestations"]): LigneReservation[] {
  return prestations.map((p) => ({
    prestation: p.prestation,
    longueur: p.longueur ?? undefined,
    densite: p.densite ?? undefined,
    options: p.options.map((o) => o.option),
  }));
}

function listePrestations(prestations: RendezVous["prestations"]): string {
  return prestations
    .map((p) => {
      const label = p.longueur ? ` (${LABEL_LONGUEUR[p.longueur]})` : "";
      return `${p.prestation.nom}${label}`;
    })
    .join(", ");
}

export function AdminDashboard({
  demandesInitiales,
  confirmesInitiaux,
  tousRdvStats = [],
  prestations,
  options,
  lissageMatrice,
}: {
  demandesInitiales: RendezVous[];
  confirmesInitiaux: RendezVous[];
  tousRdvStats?: RendezVous[];
  prestations: PrestationAvecVariantes[];
  options: OptionAvecVariantes[];
  lissageMatrice: LissageTarifSimple[];
}) {
  const router = useRouter();
  const [traitees, setTraitees] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [traitementId, setTraitementId] = useState<string | null>(null);
  const [modal, setModal] = useState<"creer" | RendezVousCalendrier | null>(null);

  const [isPendingRappels, startTransitionRappels] = useTransition();
  const [rappelMsg, setRappelMsg] = useState<string | null>(null);

  const demandes = demandesInitiales.filter((r) => !traitees.has(r.id));
  const confirmes = confirmesInitiaux;

  // Calcul du Chiffre d'Affaires et des RDV par mois
  const statsMensuelles = useMemo(() => {
    const map = new Map<string, { label: string; count: number; totalCentimes: number }>();

    for (const rdv of tousRdvStats) {
      const d = new Date(rdv.dateDebut);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      const labelCapitalise = label.charAt(0).toUpperCase() + label.slice(1);

      const { prixTotalCentimes } = calculerTotalAvecOptions(versLignes(rdv.prestations), lissageMatrice);

      const existing = map.get(yearMonth) ?? { label: labelCapitalise, count: 0, totalCentimes: 0 };
      existing.count += 1;
      existing.totalCentimes += prixTotalCentimes;
      map.set(yearMonth, existing);
    }

    return Array.from(map.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [tousRdvStats, lissageMatrice]);

  const maintenant = new Date();
  const moisEnCoursKey = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;
  const statsMoisEnCours = statsMensuelles.find((s: { key: string }) => s.key === moisEnCoursKey) ?? {
    label: maintenant.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    count: 0,
    totalCentimes: 0,
  };

  const totalAnnuelCentimes = statsMensuelles.reduce((acc: number, item: { totalCentimes: number }) => acc + item.totalCentimes, 0);
  const totalAnnuelRdv = statsMensuelles.reduce((acc: number, item: { count: number }) => acc + item.count, 0);

  function fermerEtRafraichir() {
    setModal(null);
    router.refresh();
  }

  function accepter(id: string) {
    setTraitementId(id);
    startTransition(async () => {
      await accepterDemandeAction(id);
      setTraitees((s) => new Set(s).add(id));
      setTraitementId(null);
      router.refresh();
    });
  }

  function refuser(id: string) {
    setTraitementId(id);
    startTransition(async () => {
      await refuserDemandeAction(id);
      setTraitees((s) => new Set(s).add(id));
      setTraitementId(null);
      router.refresh();
    });
  }

  function envoyerRappels() {
    setRappelMsg(null);
    startTransitionRappels(async () => {
      const res = await envoyerRappelsDemainAction();
      setRappelMsg(`${res.envoyes} rappel(s) envoyé(s) pour demain`);
    });
  }

  return (
    <div className="space-y-0">
      <nav className="mb-0 grid grid-cols-1 gap-0 border-b border-border">
        <div className="flex flex-wrap gap-0 border-b border-border pb-0">
          <a
            href="/admin"
            className="flex-1 px-6 py-4 text-sm font-medium text-primary hover:text-primary/80 border-b-2 border-primary"
          >
            Accueil
          </a>
          <a
            href="/admin/clients"
            className="flex-1 px-6 py-4 text-sm font-medium text-foreground hover:text-primary border-b border-border"
          >
            Clients
          </a>
          <a
            href="/admin/tarifs"
            className="flex-1 px-6 py-4 text-sm font-medium text-foreground hover:text-primary border-b border-border"
          >
            Tarifs
          </a>
          <a
            href="/admin/prestations"
            className="flex-1 px-6 py-4 text-sm font-medium text-foreground hover:text-primary border-b border-border"
          >
            Prestations
          </a>
          <a
            href="/admin/fermetures"
            className="flex-1 px-6 py-4 text-sm font-medium text-foreground hover:text-primary border-b border-border"
          >
            Fermetures
          </a>
        </div>
      </nav>

      <div className="space-y-12 pt-6">
      {/* SYNTHÈSE MOIS EN COURS & ACTIVITÉ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Ce mois-ci ({statsMoisEnCours.label})
            </span>
            <p className="text-3xl font-bold font-serif text-foreground mt-2">
              {formatPrix(statsMoisEnCours.totalCentimes)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Chiffre d'affaires estimé</p>
        </div>

        <div className="glass rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Rendez-vous
            </span>
            <p className="text-3xl font-bold font-serif text-foreground mt-2">
              {statsMoisEnCours.count} <span className="text-sm font-normal text-muted-foreground">RDV</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Confirmés / Honorés ce mois-ci</p>
        </div>

        <div className="glass rounded-2xl border border-white/50 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Total Annuel ({maintenant.getFullYear()})
            </span>
            <p className="text-2xl font-bold font-serif text-foreground mt-2">
              {formatPrix(totalAnnuelCentimes)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{totalAnnuelRdv} rendez-vous au total cette année</p>
        </div>
      </div>

      {/* BOUTONS ACCÈS RAPIDE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <a
          href="/admin/clients"
          className="glass rounded-2xl border border-white/50 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:scale-105"
        >
          <p className="text-3xl font-bold text-primary mb-2">👥</p>
          <p className="font-serif text-lg text-foreground">Gérer les clients</p>
          <p className="text-sm text-muted-foreground mt-2">Ajouter, modifier, supprimer</p>
        </a>
        <a
          href="/admin/tarifs"
          className="glass rounded-2xl border border-white/50 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:scale-105"
        >
          <p className="text-3xl font-bold text-primary mb-2">💰</p>
          <p className="font-serif text-lg text-foreground">Gérer les tarifs</p>
          <p className="text-sm text-muted-foreground mt-2">Prestations, options, lissage</p>
        </a>
        <a
          href="/admin/prestations"
          className="glass rounded-2xl border border-white/50 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:scale-105"
        >
          <p className="text-3xl font-bold text-primary mb-2">✂️</p>
          <p className="font-serif text-lg text-foreground">Prestations</p>
          <p className="text-sm text-muted-foreground mt-2">Ajouter nouvelles prestations</p>
        </a>
        <a
          href="/admin/fermetures"
          className="glass rounded-2xl border border-white/50 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:scale-105"
        >
          <p className="text-3xl font-bold text-primary mb-2">📅</p>
          <p className="font-serif text-lg text-foreground">Congés &amp; fermetures</p>
          <p className="text-sm text-muted-foreground mt-2">Gérer les jours fermés</p>
        </a>
        <button
          type="button"
          disabled={isPendingRappels}
          onClick={envoyerRappels}
          className="glass rounded-2xl border border-white/50 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:scale-105 disabled:opacity-60"
        >
          <p className="text-3xl font-bold text-primary mb-2">📩</p>
          <p className="font-serif text-lg text-foreground">Rappels J-1</p>
          <p className="text-sm text-muted-foreground mt-2">
            {isPendingRappels ? "Envoi..." : "Rappels pour demain"}
          </p>
          {rappelMsg && (
            <p className="text-xs font-semibold text-emerald-800 mt-2 bg-emerald-50 py-1 px-2 rounded">
              {rappelMsg}
            </p>
          )}
        </button>
      </div>

      {/* TABLEAU RÉCAPITULATIF MENSUEL (CHIFFRE D'AFFAIRES & RDV) */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            Bilan Financier &amp; Rendez-vous Mensuel ({maintenant.getFullYear()})
          </h2>
        </div>

        {statsMensuelles.length === 0 ? (
          <p className="glass rounded-2xl border border-white/50 p-6 text-sm text-muted-foreground">
            Aucune donnée de rendez-vous enregistrée pour le moment.
          </p>
        ) : (
          <div className="glass rounded-2xl border border-white/50 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary/10 text-xs font-semibold uppercase text-foreground">
                <tr>
                  <th className="px-6 py-4">Mois</th>
                  <th className="px-6 py-4 text-center">Nombre de Rendez-vous</th>
                  <th className="px-6 py-4 text-right">Chiffre d'Affaires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {statsMensuelles.map((stat) => (
                  <tr key={stat.key} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{stat.label}</td>
                    <td className="px-6 py-4 text-center font-semibold text-primary">{stat.count} RDV</td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      {formatPrix(stat.totalCentimes)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-primary/10 font-bold text-foreground">
                <tr>
                  <td className="px-6 py-4">Total Annuel</td>
                  <td className="px-6 py-4 text-center text-primary">{totalAnnuelRdv} RDV</td>
                  <td className="px-6 py-4 text-right text-lg text-primary">
                    {formatPrix(totalAnnuelCentimes)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">
            Demandes en attente {demandes.length > 0 && `(${demandes.length})`}
          </h2>
        </div>

        {demandes.length === 0 ? (
          <p className="glass rounded-2xl border border-white/50 p-6 text-sm text-muted-foreground">
            Aucune demande en attente pour le moment.
          </p>
        ) : (
          <div className="space-y-4">
            {demandes.map((rdv) => {
              const { prixTotalCentimes } = calculerTotalAvecOptions(
                versLignes(rdv.prestations),
                lissageMatrice,
              );
              return (
                <div
                  key={rdv.id}
                  className="glass rounded-2xl border border-white/50 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-lg text-foreground">
                        {rdv.client.prenom} {rdv.client.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rdv.client.telephone}
                        {rdv.client.email ? ` · ${rdv.client.email}` : ""}
                      </p>
                      {rdv.client.commentConnue && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Connu via : {rdv.client.commentConnue}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatDateHeure(rdv.dateDebut)}
                      </p>
                      <p className="text-sm text-primary">{formatPrix(prixTotalCentimes)}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-foreground">
                    {listePrestations(rdv.prestations)}
                  </p>
                  {rdv.message && (
                    <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                      « {rdv.message} »
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      disabled={isPending && traitementId === rdv.id}
                      onClick={() => accepter(rdv.id)}
                      className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      disabled={isPending && traitementId === rdv.id}
                      onClick={() => refuser(rdv.id)}
                      className="rounded-full border border-border px-5 py-2 text-sm text-foreground transition-all duration-300 hover:border-rose-400 hover:text-rose-700 active:scale-95 disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-foreground">Planning</h2>
          <button
            type="button"
            onClick={() => setModal("creer")}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
          >
            + Ajouter un rendez-vous
          </button>
        </div>
        <WeekCalendar rendezVous={confirmes} onSelect={(rdv) => setModal(rdv)} />
      </section>

      {modal && (
        <RendezVousModal
          prestations={prestations}
          options={options}
          lissageMatrice={lissageMatrice}
          rendezVous={modal === "creer" ? undefined : modal}
          onClose={() => setModal(null)}
          onSaved={fermerEtRafraichir}
        />
      )}
      </div>
    </div>
  );
}
