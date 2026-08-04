import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { getCatalogue } from "@/lib/data";
import { AncienneClienteWizard } from "./AncienneClienteWizard";

export default async function AncienneClientePage() {
  const { prestations, options, lissageMatrice } = await getCatalogue();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Reveal className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-serif text-4xl text-foreground">Je suis déjà cliente</h1>
          <p className="mt-3 text-muted-foreground">
            Identifiez-vous avec votre numéro de téléphone pour réserver directement.
          </p>

          <div className="mt-10">
            <AncienneClienteWizard
              prestations={prestations}
              options={options}
              lissageMatrice={lissageMatrice}
            />
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
