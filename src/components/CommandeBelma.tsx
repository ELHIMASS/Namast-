"use client";

import { useState } from "react";

/**
 * Renvoi vers la boutique Belmakosmetik, avec le code d'affiliation du salon.
 *
 * Le code ne peut pas être pré-rempli à distance : un site ne peut pas écrire
 * dans le formulaire d'un autre domaine, les navigateurs l'interdisent. Il est
 * donc affiché et copiable en un clic, pour que la cliente n'ait qu'à le
 * coller dans le champ « Code d'affiliation salon » à l'inscription.
 *
 * Le jour où Belmakosmetik fournit un lien de parrainage portant le code,
 * il suffira de le poser dans LIEN_BOUTIQUE : le report deviendra automatique.
 */

const CODE_SALON = "3665";
const LIEN_BOUTIQUE = "https://www.belmakosmetik.fr/";
const LIEN_INSCRIPTION = "https://www.belmakosmetik.fr/connexion?create_account=1";

export function CommandeBelma() {
  const [copie, setCopie] = useState(false);

  async function copierLeCode() {
    try {
      await navigator.clipboard.writeText(CODE_SALON);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      // Presse-papiers refusé (navigateur ancien, page non sécurisée) : le
      // code reste lisible et sélectionnable à l'écran.
      setCopie(false);
    }
  }

  return (
    <div className="glass rounded-3xl border border-white/50 p-6 text-center sm:p-10">
      <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        À la maison
      </span>
      <h3 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
        Commander mes produits Belmakosmetik
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Prolongez vos soins entre deux rendez-vous avec les produits utilisés au
        salon, commandés directement chez Belmakosmetik.
      </p>

      <a
        href={LIEN_BOUTIQUE}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 btn-hover"
      >
        Commander mes produits Belmakosmetik
      </a>

      <div className="mx-auto mt-8 max-w-md rounded-2xl bg-muted/50 p-5">
        <p className="text-sm text-foreground">
          À la création de votre compte, indiquez notre{" "}
          <strong>code d&apos;affiliation salon</strong> :
        </p>

        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="rounded-xl border border-primary/40 bg-surface px-5 py-2 font-serif text-2xl tracking-[0.2em] text-foreground">
            {CODE_SALON}
          </span>
          <button
            type="button"
            onClick={copierLeCode}
            className="rounded-full border border-border px-4 py-2 text-xs text-foreground transition-colors hover:border-primary"
          >
            {copie ? "Copié" : "Copier"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          C&apos;est ce code qui rattache votre commande au salon.{" "}
          <a
            href={LIEN_INSCRIPTION}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
