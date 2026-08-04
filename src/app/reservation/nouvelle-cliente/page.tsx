import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { getPrestationsActives } from "@/lib/data";
import { NouvelleClienteForm } from "./NouvelleClienteForm";

export default async function NouvelleClientePage() {
  const prestations = await getPrestationsActives();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Reveal className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-serif text-4xl text-foreground">
            Je suis une nouvelle cliente
          </h1>
          <p className="mt-3 text-muted-foreground">
            Envoyez une demande de rendez-vous. La professionnelle vous répondra sous
            48 heures maximum pour accepter, refuser ou proposer un autre créneau.
          </p>

          <div className="mt-10">
            <NouvelleClienteForm prestations={prestations} />
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
