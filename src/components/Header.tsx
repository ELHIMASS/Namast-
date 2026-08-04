import Link from "next/link";

export function Header() {
  return (
    <header className="glass sticky top-0 z-20 border-b border-white/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="flex shrink-0 flex-col leading-tight interactive-hover">
          <span className="font-serif text-xl tracking-wide sm:text-2xl gradient-text animate-gradient">
            Namasté
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-primary sm:text-[0.65rem] sm:tracking-[0.25em] animate-pulse-soft">
            Coiffure &amp; bien-être
          </span>
        </Link>
        <Link
          href="/reservation"
          className="shrink-0 whitespace-nowrap rounded-full border border-primary/60 px-3 py-2 text-xs text-foreground transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 sm:px-5 sm:text-sm btn-hover interactive-hover"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </header>
  );
}
