"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Barre d'action collée en bas de l'écran, sur mobile uniquement.
 *
 * Le contenu est déplacé dans <body> par un portail : un `position: fixed`
 * placé sous un ancêtre qui porte un `transform` (nos blocs Reveal) se
 * positionnerait par rapport à cet ancêtre et non par rapport à l'écran.
 */
export function BarreFixeMobile({ children }: { children: React.ReactNode }) {
  const [monte, setMonte] = useState(false);

  useEffect(() => setMonte(true), []);
  if (!monte) return null;

  return createPortal(
    <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
      {children}
    </div>,
    document.body,
  );
}
