"use client";

import { useState, useTransition } from "react";
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
import { accepterDemandeAction, refuserDemandeAction } from "./actions";

type RendezVous = {
  id: string;
  dateDebut: Date;
  dateFin: Date;
  message: string | null;
  createdAt: Date;
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
  prestations,
  options,
  lissageMatrice,
}: {
  demandesInitiales: RendezVous[];
  confirmesInitiaux: RendezVous[];
  prestations: PrestationAvecVariantes[];
  options: OptionAvecVariantes[];
  lissageMatrice: LissageTarifSimple[];
}) {
  const router = useRouter();
  const [traitees, setTraitees] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [traitementId, setTraitementId] = useState<string | null>(null);
  const [modal, setModal] = useState<"creer" | RendezVousCalendrier | null>(null);

  const demandes = demandesInitiales.filter((r) => !traitees.has(r.id));
  const confirmes = confirmesInitiaux;

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

  return (
    <div className="space-y-16">
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
  );
}
