import Link from "next/link";

export function Header() {
  return (
    <header className="glass sticky top-0 z-20 border-b border-white/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-serif text-2xl tracking-wide text-foreground">Namasté</span>
          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-primary">
            Coiffure &amp; bien-être
          </span>
        </Link>
        <Link
          href="/reservation"
          className="rounded-full border border-primary/60 px-5 py-2 text-sm text-foreground transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </header>
  );
}
