"use client";

import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#D5B695]/30 bg-[#F0DFCE]/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 sm:py-4">
        {/* LOGO SALON */}
        <Link href="/" className="flex shrink-0 flex-col leading-none transition-opacity hover:opacity-90">
          <span className="font-handwriting font-serif italic text-2xl font-normal text-[#3A2411] sm:text-3xl">
            Namasté
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.25em] text-[#7D522A] font-medium sm:text-[10px]">
            COIFFURE &amp; BIEN-ÊTRE
          </span>
        </Link>

        {/* NAVIGATION DESKTOP (ORDINATEUR) */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/mon-rendez-vous"
            className="text-sm font-medium text-[#3A2411]/80 transition-colors hover:text-[#3A2411]"
          >
            Mon rendez-vous
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-[#3A2411]/80 transition-colors hover:text-[#3A2411]"
          >
            Espace pro
          </Link>
          <Link
            href="/reservation"
            className="shrink-0 rounded-full border border-[#7D522A]/40 bg-[#F0DFCE]/50 px-5 py-2 text-sm font-medium text-[#3A2411] transition-all hover:bg-[#E6CEB3] hover:border-[#7D522A]/60"
          >
            Prendre rendez-vous
          </Link>
        </nav>

        {/* BOUTONS NAVIGATION MOBILE */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/reservation"
            className="shrink-0 rounded-full border border-[#7D522A]/40 bg-[#F0DFCE]/50 px-3.5 py-1.5 text-xs font-medium text-[#3A2411] transition-all hover:bg-[#E6CEB3]"
          >
            Prendre RDV
          </Link>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#3A2411] transition-colors hover:bg-[#E6CEB3]/50"
          >
            {menuOuvert ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MENU DÉROULANT MOBILE */}
      {menuOuvert && (
        <div className="border-t border-[#D5B695]/30 bg-[#FAF3EB] px-6 py-4 shadow-lg md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMenuOuvert(false)}
              className="py-2 text-base font-medium text-[#3A2411] hover:text-[#7D522A]"
            >
              Accueil
            </Link>
            <Link
              href="/mon-rendez-vous"
              onClick={() => setMenuOuvert(false)}
              className="py-2 text-base font-medium text-[#3A2411] hover:text-[#7D522A]"
            >
              Mon rendez-vous (Espace cliente)
            </Link>
            <Link
              href="/admin"
              onClick={() => setMenuOuvert(false)}
              className="py-2 text-base font-medium text-[#3A2411] hover:text-[#7D522A]"
            >
              Espace pro (Admin)
            </Link>
            <Link
              href="/reservation"
              onClick={() => setMenuOuvert(false)}
              className="mt-2 text-center rounded-full bg-[#d4a574] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c9934d]"
            >
              Prendre rendez-vous
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
