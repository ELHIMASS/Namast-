import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCatalogue } from "@/lib/data";
import { AdminDashboard } from "./AdminDashboard";
import { getDemandesEnAttente, getRendezVousConfirmes, logoutAdminAction } from "./actions";

// Toujours régénérée au moment de la requête : sans ça, Netlify servirait
// une page figée avec les données du dernier build (les nouvelles demandes
// n'apparaîtraient jamais sans redéployer).
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [demandes, confirmes, { prestations, options, lissageMatrice }] = await Promise.all([
    getDemandesEnAttente(),
    getRendezVousConfirmes(),
    getCatalogue(),
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-primary">
                Espace pro
              </span>
              <h1 className="mt-1 font-serif text-3xl text-foreground">
                Tableau de bord
              </h1>
            </div>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-all duration-300 hover:border-primary hover:text-foreground active:scale-95"
              >
                Se déconnecter
              </button>
            </form>
          </div>

          <AdminDashboard
            demandesInitiales={demandes}
            confirmesInitiaux={confirmes}
            prestations={prestations}
            options={options}
            lissageMatrice={lissageMatrice}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
