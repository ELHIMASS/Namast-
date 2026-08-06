import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SeparateurCiseau } from "@/components/Ciseau";
import { Reveal } from "@/components/Reveal";

export default function ReservationPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <Reveal className="w-full max-w-2xl text-center">
          <h1 className="font-serif text-4xl text-foreground">Prendre rendez-vous</h1>
          <SeparateurCiseau className="mt-4" />
          <p className="mt-4 text-muted-foreground">
            Merci de préciser votre situation pour continuer.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              href="/reservation/ancienne-cliente"
              className="glass rounded-2xl border border-white/50 p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <h2 className="font-serif text-xl text-foreground">Je suis déjà cliente</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Retrouvez votre espace et réservez directement un créneau.
              </p>
            </Link>

            <Link
              href="/reservation/nouvelle-cliente"
              className="glass rounded-2xl border border-white/50 p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <h2 className="font-serif text-xl text-foreground">
                Je suis une nouvelle cliente
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Envoyez une demande de rendez-vous. Réponse sous 48h maximum.
              </p>
            </Link>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
