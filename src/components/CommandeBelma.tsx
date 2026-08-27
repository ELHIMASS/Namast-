"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Renvoi vers la boutique Belmakosmetik, avec le code d'affiliation du salon.
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
      setCopie(false);
    }
  }

  return (
    <div className="glass rounded-3xl border border-white/50 p-6 text-center sm:p-10 overflow-hidden relative">
      <div className="grid md:grid-cols-12 gap-8 items-center">
        {/* Photo des produits Belmakosmetik */}
        <div className="md:col-span-5 relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-md border border-white/60">
          <Image
            src="/images/belma.jpeg"
            alt="Produits Belmakosmetik"
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Détails et Code d'affiliation */}
        <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            À la maison
          </span>
          <h3 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
            Commander mes produits Belmakosmetik
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Prolongez vos soins entre deux rendez-vous avec les produits utilisés au
            salon, commandés directement chez Belmakosmetik.
          </p>

          <a
            href={LIEN_BOUTIQUE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 btn-hover shadow-sm"
          >
            Commander mes produits Belmakosmetik
          </a>

          <div className="mt-6 w-full max-w-md rounded-2xl bg-white/40 border border-white/60 p-4 sm:p-5 text-center md:text-left">
            <p className="text-sm text-foreground">
              À la création de votre compte, indiquez notre{" "}
              <strong>code d&apos;affiliation salon</strong> :
            </p>

            <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
              <span className="rounded-xl border border-primary/40 bg-surface px-5 py-2 font-serif text-2xl tracking-[0.2em] text-foreground font-bold">
                {CODE_SALON}
              </span>
              <button
                type="button"
                onClick={copierLeCode}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                {copie ? "✓ Copié !" : "Copier"}
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              C&apos;est ce code qui rattache votre commande au salon.{" "}
              <a
                href={LIEN_INSCRIPTION}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                Créer un compte Belmakosmetik
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
