"use client";

import { useMemo, useState } from "react";
import type {
  Densite,
  LigneReservation,
  LissageTarifSimple,
  Longueur,
  OptionAvecVariantes,
  PrestationAvecVariantes,
} from "@/lib/prestations";
import {
  formatDuree,
  formatPrix,
  getGroupesOptionsPourPrestation,
  resoudreOption,
  resoudrePrestation,
} from "@/lib/prestations";
import {
  LABEL_CATEGORIE,
  LABEL_DENSITE,
  LABEL_GROUPE_OPTION,
  LABEL_LONGUEUR,
  LABEL_PROFIL,
  ORDRE_CATEGORIES,
  ORDRE_DENSITES,
  ORDRE_LONGUEURS,
} from "@/lib/categories";
import { ProfilIcon } from "@/components/ProfilIcon";

type LigneEtat = {
  prestation: PrestationAvecVariantes;
  longueur?: Longueur;
  densite?: Densite;
  optionIds: string[];
};

const LONGUEURS_LISSAGE = ["COURT", "MI_LONG", "LONG", "TRES_LONG"] as const;

export function PrestationChooser({
  prestations,
  options,
  lissageMatrice,
  lignes,
  onChange,
}: {
  prestations: PrestationAvecVariantes[];
  options: OptionAvecVariantes[];
  lissageMatrice: LissageTarifSimple[];
  lignes: LigneReservation[];
  onChange: (lignes: LigneReservation[]) => void;
}) {
  const [profil, setProfil] = useState<string | null>(() => lignes[0]?.prestation.profil ?? null);

  const lignesEtat: LigneEtat[] = lignes.map((l) => ({
    prestation: l.prestation,
    longueur: l.longueur,
    densite: l.densite,
    optionIds: l.options.map((o) => o.id),
  }));

  function commit(nouvelles: LigneEtat[]) {
    onChange(
      nouvelles.map((l) => ({
        prestation: l.prestation,
        longueur: l.longueur,
        densite: l.densite,
        options: l.optionIds
          .map((id) => options.find((o) => o.id === id))
          .filter((o): o is OptionAvecVariantes => !!o),
      })),
    );
  }

  function togglePrestation(prestation: PrestationAvecVariantes) {
    const existe = lignesEtat.find((l) => l.prestation.id === prestation.id);
    if (existe) {
      commit(lignesEtat.filter((l) => l.prestation.id !== prestation.id));
    } else {
      commit([...lignesEtat, { prestation, optionIds: [] }]);
    }
  }

  function setLongueur(prestationId: string, longueur: Longueur) {
    commit(
      lignesEtat.map((l) => (l.prestation.id === prestationId ? { ...l, longueur } : l)),
    );
  }

  function setDensite(prestationId: string, densite: Densite) {
    commit(
      lignesEtat.map((l) => (l.prestation.id === prestationId ? { ...l, densite } : l)),
    );
  }

  function toggleOption(prestationId: string, optionId: string) {
    commit(
      lignesEtat.map((l) =>
        l.prestation.id === prestationId
          ? {
              ...l,
              optionIds: l.optionIds.includes(optionId)
                ? l.optionIds.filter((id) => id !== optionId)
                : [...l.optionIds, optionId],
            }
          : l,
      ),
    );
  }

  const prestationsDuProfil = useMemo(
    () => prestations.filter((p) => p.profil === profil),
    [prestations, profil],
  );

  const categoriesPresentes = useMemo(
    () =>
      ORDRE_CATEGORIES.filter((cat) => prestationsDuProfil.some((p) => p.categorie === cat)),
    [prestationsDuProfil],
  );

  if (!profil) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {["FEMME", "HOMME", "ENFANT"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProfil(p)}
            className="glass flex flex-col items-center gap-2 rounded-2xl border border-white/50 px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
          >
            <ProfilIcon profil={p} className="h-8 w-8 text-primary" />
            <span className="font-serif text-lg text-foreground">{LABEL_PROFIL[p]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => {
          setProfil(null);
          commit([]);
        }}
        className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        ‹ Changer de profil ({LABEL_PROFIL[profil]})
      </button>

      {profil === "ENFANT" && (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Réservation enfant disponible uniquement le mercredi.
        </p>
      )}

      {categoriesPresentes.map((categorie) => (
        <div key={categorie}>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary/80">
            {LABEL_CATEGORIE[categorie] ?? categorie}
          </p>
          <div className="space-y-3">
            {prestationsDuProfil
              .filter((p) => p.categorie === categorie)
              .map((prestation) => {
                const ligne = lignesEtat.find((l) => l.prestation.id === prestation.id);
                const selectionnee = !!ligne;
                const besoinLongueur =
                  prestation.estLissage || prestation.variantesLongueur.length > 0;
                const longueursDisponibles = prestation.estLissage
                  ? LONGUEURS_LISSAGE
                  : ORDRE_LONGUEURS.filter((l) =>
                      prestation.variantesLongueur.some((v) => v.longueur === l),
                    );
                const groupesOptions = getGroupesOptionsPourPrestation(prestation);
                const optionsDisponibles = options.filter((o) =>
                  groupesOptions.includes(o.groupe),
                );

                const { prixCentimes, dureeMinutes } = ligne
                  ? resoudrePrestation(prestation, ligne.longueur, ligne.densite, lissageMatrice)
                  : { prixCentimes: prestation.prixCentimes, dureeMinutes: prestation.dureeMinutes };

                return (
                  <div
                    key={prestation.id}
                    className={`glass rounded-xl border p-4 transition-colors ${
                      selectionnee ? "border-primary/50" : "border-white/50"
                    }`}
                  >
                    <label className="flex cursor-pointer items-start justify-between gap-3">
                      <span className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectionnee}
                          onChange={() => togglePrestation(prestation)}
                          className="mt-1 h-4 w-4 shrink-0"
                        />
                        <span className="font-serif text-base text-foreground">
                          {prestation.nom}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-xs text-muted-foreground">
                        {besoinLongueur && !selectionnee ? (
                          "selon longueur"
                        ) : (
                          <>
                            {formatDuree(dureeMinutes)}
                            <br />
                            <span className="font-medium text-primary">
                              {formatPrix(prixCentimes)}
                            </span>
                          </>
                        )}
                      </span>
                    </label>

                    {selectionnee && besoinLongueur && (
                      <div className="mt-3 flex flex-wrap gap-2 pl-7">
                        {longueursDisponibles.map((longueur) => (
                          <button
                            key={longueur}
                            type="button"
                            onClick={() => setLongueur(prestation.id, longueur)}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                              ligne?.longueur === longueur
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-surface text-foreground hover:border-primary/40"
                            }`}
                          >
                            {LABEL_LONGUEUR[longueur]}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectionnee && prestation.estLissage && (
                      <div className="mt-2 flex flex-wrap gap-2 pl-7">
                        {ORDRE_DENSITES.map((densite) => (
                          <button
                            key={densite}
                            type="button"
                            onClick={() => setDensite(prestation.id, densite)}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                              ligne?.densite === densite
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-surface text-foreground hover:border-primary/40"
                            }`}
                          >
                            {LABEL_DENSITE[densite]}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectionnee &&
                      optionsDisponibles.length > 0 &&
                      (!besoinLongueur || ligne?.longueur) && (
                        <div className="mt-3 space-y-2 border-t border-border/60 pt-3 pl-7">
                          {Object.entries(
                            optionsDisponibles.reduce<Record<string, OptionAvecVariantes[]>>(
                              (acc, o) => {
                                acc[o.groupe] = acc[o.groupe] ? [...acc[o.groupe], o] : [o];
                                return acc;
                              },
                              {},
                            ),
                          ).map(([groupe, opts]) => (
                            <div key={groupe}>
                              <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                                {LABEL_GROUPE_OPTION[groupe] ?? groupe}
                              </p>
                              {opts.map((option) => {
                                const coche = ligne?.optionIds.includes(option.id) ?? false;
                                const { prixCentimes: prixOption } = resoudreOption(
                                  option,
                                  ligne?.longueur,
                                );
                                return (
                                  <label
                                    key={option.id}
                                    className="flex cursor-pointer items-center justify-between gap-2 py-1 text-sm"
                                  >
                                    <span className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={coche}
                                        onChange={() => toggleOption(prestation.id, option.id)}
                                        className="h-3.5 w-3.5"
                                      />
                                      {option.nom}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      +{formatPrix(prixOption)}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
