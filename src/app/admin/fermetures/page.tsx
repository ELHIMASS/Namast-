import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GestionFermetures } from "./GestionFermetures";
import { listerFermeturesAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FermeturesPage() {
  const fermetures = await listerFermeturesAction();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="mb-10">
            <Link
              href="/admin"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Tableau de bord
            </Link>
            <span className="mt-4 block text-xs uppercase tracking-[0.3em] text-primary">
              Espace pro
            </span>
            <h1 className="mt-1 font-serif text-3xl text-foreground">
              Congés &amp; fermetures
            </h1>
            <p className="mt-3 text-muted-foreground">
              Les jours fermés n&apos;apparaissent plus à la réservation, ni pour
              les clientes ni dans le formulaire admin.
            </p>
          </div>

          <GestionFermetures initiales={fermetures} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
