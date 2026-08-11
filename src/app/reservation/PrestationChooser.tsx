"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type {
  Densite,
  Finition,
  LigneReservation,
  LissageTarifSimple,
  Longueur,
  OptionAvecVariantes,
  PrestationAvecVariantes,
} from "@/lib/prestations";
import {
  formatDuree,
  formatPrix,
  demandeFinition,
  REMISE_SECHAGE_CENTIMES,
  remiseFinition,
  getGroupesOptionsPourPrestation,
  prixAPartirDe,
  resoudreOption,
  resoudrePrestation,
} from "@/lib/prestations";
import {
  DESCRIPTION_FORMULE,
  INCLUS_FORMULE,
  LABEL_CATEGORIE,
  LABEL_DENSITE,
  LABEL_FORMULE,
  LABEL_GROUPE_OPTION,
  LABEL_LONGUEUR,
  LABEL_PROFIL,
  ORDRE_CATEGORIES,
  ORDRE_FORMULES,
  ORDRE_DENSITES,
  ORDRE_LONGUEURS,
} from "@/lib/categories";
import { ProfilIcon } from "@/components/ProfilIcon";

const IMAGE_PROFIL: Record<
  string,
  { src: string; alt: string; largeur: number; hauteur: number }
> = {
  HOMME: {
    src: "/images/i15.png",
    alt: "Client homme dans le salon de coiffure",
    largeur: 800,
    hauteur: 1322,
  },
  ENFANT: {
    src: "/images/i16.png",
    alt: "Enfant dans le salon de coiffure",
    largeur: 800,
    hauteur: 1322,
  },
};

type LigneEtat = {
  prestation: PrestationAvecVariantes;
  longueur?: Longueur;
  densite?: Densite;
  finition?: Finition;
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
  // Formule retenue par la cliente, et formule dont le détail est déplié.
  const [formuleChoisie, setFormuleChoisie] = useState<string | null>(
    () => lignes[0]?.prestation.formule ?? null,
  );
  const [detailOuvert, setDetailOuvert] = useState<string | null>(null);

  const lignesEtat: LigneEtat[] = lignes.map((l) => ({
    prestation: l.prestation,
    longueur: l.longueur,
    densite: l.densite,
    finition: l.finition,
    optionIds: l.options.map((o) => o.id),
  }));

  function commit(nouvelles: LigneEtat[]) {
    onChange(
      nouvelles.map((l) => ({
        prestation: l.prestation,
        longueur: l.longueur,
        densite: l.densite,
        finition: l.finition,
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
      return;
    }

    // Les prestations d'une formule sont des variantes d'un même forfait
    // (brushing, coupe + brushing, couleur + coupe + brushing…) : on n'en
    // retient qu'une, sinon le tarif tout compris serait facturé plusieurs fois.
    const base = prestation.formule
      ? lignesEtat.filter((l) => l.prestation.formule !== prestation.formule)
      : lignesEtat;

    commit([...base, { prestation, optionIds: [] }]);
  }

  function setLongueur(prestationId: string, longueur: Longueur) {
    commit(
      lignesEtat.map((l) => (l.prestation.id === prestationId ? { ...l, longueur } : l)),
    );
  }

  function setFinition(prestationId: string, finition: Finition) {
    commit(
      lignesEtat.map((l) => (l.prestation.id === prestationId ? { ...l, finition } : l)),
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

  /** Formules proposées pour ce profil, avec leurs prestations. */
  const formulesDisponibles = useMemo(
    () =>
      ORDRE_FORMULES.map((formule) => ({
        formule,
        items: prestationsDuProfil.filter((p) => p.formule === formule),
      })).filter((f) => f.items.length > 0),
    [prestationsDuProfil],
  );

  /**
   * Formule et prestations hors formule ne se cumulent pas : c'est l'une ou
   * les autres. Sans formule choisie, seul le catalogue hors formule est
   * listé (les deux packs restent présentés comme un choix possible) ; dès
   * qu'une formule est retenue, seules ses prestations sont proposées.
   */
  const groupes = useMemo(() => {
    const horsFormule = ORDRE_CATEGORIES.map((categorie) => ({
      cle: categorie,
      titre: LABEL_CATEGORIE[categorie] ?? categorie,
      items: prestationsDuProfil.filter((p) => p.categorie === categorie && !p.formule),
    })).filter((g) => g.items.length > 0);

    if (!formuleChoisie) return horsFormule;

    // Les soins capillaires restent proposés avec une formule : ils s'ajoutent
    // à la prestation de coiffure au lieu de s'y substituer.
    return [
      {
        cle: formuleChoisie,
        titre: LABEL_FORMULE[formuleChoisie] ?? formuleChoisie,
        items: prestationsDuProfil.filter((p) => p.formule === formuleChoisie),
      },
      ...horsFormule.filter((g) => g.cle === "SOIN"),
    ];
  }, [prestationsDuProfil, formuleChoisie]);

  /** Prestations hors formule déjà cochées : elles sauteront si on prend une formule. */
  const horsFormuleSelectionnees = lignesEtat.filter((l) => !l.prestation.formule);

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
          setFormuleChoisie(null);
          setDetailOuvert(null);
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

      {/* Choix de la formule : le contenu du pack ne se déplie qu'à la demande. */}
      {formulesDisponibles.length > 0 && !formuleChoisie && (
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-primary/80">
            Choisissez votre expérience
          </p>
          <p className="mb-3 text-sm text-muted-foreground">
            {horsFormuleSelectionnees.length > 0
              ? "Une formule ne se cumule pas avec le reste de la carte : vos prestations déjà sélectionnées seront retirées."
              : "Prenez une formule, ou composez librement votre rendez-vous dans la carte ci-dessous."}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {formulesDisponibles.map(({ formule, items }) => (
              <div
                key={formule}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5"
              >
                <h4 className="font-serif text-lg text-foreground">
                  {LABEL_FORMULE[formule] ?? formule}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {DESCRIPTION_FORMULE[formule]}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {items.length} prestations · à partir de{" "}
                  <span className="font-medium text-primary">
                    {formatPrix(
                      Math.min(...items.map((i) => prixAPartirDe(i, lissageMatrice))),
                    )}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setDetailOuvert((actuel) => (actuel === formule ? null : formule))
                  }
                  className="mt-3 self-start text-sm text-primary underline-offset-2 hover:underline"
                >
                  {detailOuvert === formule
                    ? "Masquer le détail"
                    : "Voir le détail du pack"}
                </button>

                {detailOuvert === formule && (
                  <div className="mt-3 rounded-xl bg-muted/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                      Comprend
                    </p>
                    <ul className="mt-2 space-y-1">
                      {INCLUS_FORMULE[formule]?.map((ligne) => (
                        <li key={ligne} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">•</span>
                          {ligne}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFormuleChoisie(formule);
                    setDetailOuvert(null);
                    // Une formule ne se cumule pas avec le reste de la carte :
                    // les prestations hors formule déjà cochées sont retirées.
                    commit(lignesEtat.filter((l) => l.prestation.formule === formule));
                  }}
                  className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
                >
                  Choisir cette formule
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formule retenue : son contenu reste consultable, mais en lecture seule.
          Rien n'y est modifiable, tout est déjà compris dans le tarif. */}
      {formuleChoisie && (
        <div className="rounded-2xl border border-primary/30 bg-surface/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-serif text-lg text-foreground">
                {LABEL_FORMULE[formuleChoisie] ?? formuleChoisie}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {DESCRIPTION_FORMULE[formuleChoisie]}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setDetailOuvert((actuel) =>
                  actuel === formuleChoisie ? null : formuleChoisie,
                )
              }
              className="shrink-0 text-sm text-primary underline-offset-2 hover:underline"
            >
              {detailOuvert === formuleChoisie
                ? "Masquer ce qui est compris"
                : "Voir ce qui est compris"}
            </button>
          </div>

          {detailOuvert === formuleChoisie && (
            <div className="mt-4 rounded-xl bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                Compris dans la formule
              </p>
              <ul className="mt-2 space-y-1">
                {INCLUS_FORMULE[formuleChoisie]?.map((ligne) => (
                  <li key={ligne} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    {ligne}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setFormuleChoisie(null);
              setDetailOuvert(null);
              commit(lignesEtat.filter((l) => !l.prestation.formule));
            }}
            className="mt-4 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            ‹ Quitter la formule et voir toute la carte
          </button>
        </div>
      )}

      {groupes.map((groupe) => (
        <div key={groupe.cle}>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary/80">
            {groupe.titre}
          </p>
          {groupe.cle === formuleChoisie && (
            <p className="mb-3 text-sm text-muted-foreground">
              Choisissez la prestation de votre formule — une seule, tout est
              compris dans son tarif.
            </p>
          )}
          <div className="space-y-3">
            {groupe.items
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

                const base = ligne
                  ? resoudrePrestation(prestation, ligne.longueur, ligne.densite, lissageMatrice)
                  : { prixCentimes: prestation.prixCentimes, dureeMinutes: prestation.dureeMinutes };
                // Le séchage vaut 5 € de moins que le brushing : le tarif
                // affiché sur la carte suit le choix, pour rester cohérent
                // avec le total.
                const prixCentimes =
                  base.prixCentimes - (ligne ? remiseFinition(ligne) : 0);
                const dureeMinutes = base.dureeMinutes;

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
                          type={prestation.formule ? "radio" : "checkbox"}
                          name={
                            prestation.formule ? `formule-${prestation.formule}` : undefined
                          }
                          checked={selectionnee}
                          onChange={() => togglePrestation(prestation)}
                          className="mt-0.5 h-5 w-5 shrink-0"
                        />
                        <span className="font-serif text-base text-foreground">
                          {prestation.nom}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-xs text-muted-foreground">
                        {besoinLongueur && !ligne?.longueur ? (
                          <>
                            à partir de
                            <br />
                            <span className="font-medium text-primary">
                              {formatPrix(prixAPartirDe(prestation, lissageMatrice))}
                            </span>
                          </>
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
                            className={`rounded-full border px-4 py-2 text-xs transition-colors ${
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

                    {/* Finition : séchage et brushing sont tous deux compris,
                        seul le rendu diffère. Le choix est obligatoire. */}
                    {selectionnee && demandeFinition(prestation) && (
                      <div className="mt-3 pl-7">
                        <p className="mb-2 text-xs text-muted-foreground">
                          Finition souhaitée
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(["BRUSHING", "SECHAGE"] as const).map((finition) => (
                            <button
                              key={finition}
                              type="button"
                              onClick={() => setFinition(prestation.id, finition)}
                              className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                                ligne?.finition === finition
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-surface text-foreground hover:border-primary/40"
                              }`}
                            >
                              {finition === "BRUSHING"
                                ? "Brushing"
                                : `Séchage − ${REMISE_SECHAGE_CENTIMES / 100} €`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectionnee && prestation.estLissage && (
                      <div className="mt-2 flex flex-wrap gap-2 pl-7">
                        {ORDRE_DENSITES.map((densite) => (
                          <button
                            key={densite}
                            type="button"
                            onClick={() => setDensite(prestation.id, densite)}
                            className={`rounded-full border px-4 py-2 text-xs transition-colors ${
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

                    {/* Prestation de formule : ce qui est compris s'affiche,
                        sans case à cocher — rien n'est modifiable ici. */}
                    {selectionnee && prestation.formule && (
                      <div className="mt-3 border-t border-border/60 pt-3 pl-7">
                        <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                          Compris dans la formule
                        </p>
                        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          {INCLUS_FORMULE[prestation.formule]?.map((inclus) => (
                            <li
                              key={inclus}
                              className="flex items-center gap-1.5 text-sm text-muted-foreground"
                            >
                              <span className="text-primary">✓</span>
                              {inclus}
                            </li>
                          ))}
                        </ul>
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
                                        className="h-5 w-5"
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
