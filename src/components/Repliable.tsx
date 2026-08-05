"use client";

import { useState } from "react";

/**
 * Bloc replié sur mobile, toujours déplié à partir de md.
 *
 * Le dépliage desktop se fait en CSS (`md:block`) et non par une mesure de
 * largeur en JavaScript : le rendu serveur est ainsi identique au rendu
 * client, quelle que soit la taille d'écran.
 */
export function Repliable({
  apercu,
  children,
}: {
  apercu: string;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className="mt-5 flex w-full items-center justify-between gap-3 rounded-full border border-primary/40 px-5 py-3.5 text-sm text-foreground transition-colors hover:border-primary active:scale-[0.99] md:hidden"
      >
        <span>{ouvert ? "Masquer les tarifs" : apercu}</span>
        <span
          aria-hidden
          className={`text-primary transition-transform duration-300 ${
            ouvert ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      <div className={`${ouvert ? "" : "hidden"} md:block`}>{children}</div>
    </>
  );
}
