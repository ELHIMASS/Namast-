import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EspaceCliente } from "./EspaceCliente";

export const metadata = {
  title: "Mon rendez-vous — Namasté",
};

export default function MonRendezVousPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Espace cliente
            </span>
            <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              Mon rendez-vous
            </h1>
            <p className="mt-4 text-muted-foreground">
              Retrouvez votre rendez-vous avec votre numéro de téléphone et le
              code reçu lors de la réservation.
            </p>
          </div>

          <EspaceCliente />
        </section>
      </main>

      <Footer />
    </div>
  );
}
