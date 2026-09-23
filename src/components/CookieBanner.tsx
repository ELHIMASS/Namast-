"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const choix = localStorage.getItem("namaste_cookies");
      if (!choix) setVisible(true);
    } catch {
      // localStorage indisponible (mode privé strict) → pas de bannière
    }
  }, []);

  function accepter() {
    try { localStorage.setItem("namaste_cookies", "accepte"); } catch { /* */ }
    setVisible(false);
  }

  function refuser() {
    try { localStorage.setItem("namaste_cookies", "refuse"); } catch { /* */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-4xl">
        <div
          className="glass rounded-2xl border border-primary/20 bg-background/95 backdrop-blur-md shadow-2xl p-5 sm:p-6"
          style={{
            boxShadow: "0 -4px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(212,165,116,0.15)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">
                🍪 Ce site utilise des cookies
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nous utilisons uniquement des cookies essentiels au fonctionnement du site
                (session, sécurité). Aucun cookie publicitaire ou de tracking tiers.{" "}
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 hover:text-primary transition-colors"
                >
                  En savoir plus
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                id="cookie-refuser"
                onClick={refuser}
                className="rounded-full border border-border px-5 py-2 text-sm text-foreground transition-all duration-200 hover:border-primary/50 hover:text-primary active:scale-95"
              >
                Refuser
              </button>
              <button
                type="button"
                id="cookie-accepter"
                onClick={accepter}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
