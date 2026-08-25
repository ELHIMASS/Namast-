import Link from "next/link";

export function Header() {
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

        {/* ACTIONS NAVIGATION */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/reservation"
            className="shrink-0 rounded-full border border-[#7D522A]/40 bg-[#F0DFCE]/50 px-4 py-1.5 text-xs font-medium text-[#3A2411] transition-all hover:bg-[#E6CEB3] hover:border-[#7D522A]/60 sm:px-5 sm:py-2 sm:text-sm"
          >
            Prendre rendez-vous
          </Link>
          
          {/* BOUTON MENU HAMBURGER */}
          <button
            type="button"
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#3A2411] transition-colors hover:bg-[#E6CEB3]/50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
