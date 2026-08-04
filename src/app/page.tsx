import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VideoCarousel } from "@/components/VideoCarousel";
import { Reveal } from "@/components/Reveal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProfilIcon } from "@/components/ProfilIcon";
import { getCatalogue } from "@/lib/data";
import { formatDuree, formatPrix, prixAPartirDe } from "@/lib/prestations";
import {
  DESCRIPTION_CATEGORIE,
  LABEL_CATEGORIE,
  LABEL_PROFIL,
  ORDRE_CATEGORIES,
} from "@/lib/categories";

export default async function Home() {
  const { prestations, lissageMatrice } = await getCatalogue();

  const profils = ["FEMME", "HOMME", "ENFANT"]
    .map((profil) => ({
      profil,
      categories: ORDRE_CATEGORIES.map((categorie) => ({
        categorie,
        items: prestations.filter((p) => p.profil === profil && p.categorie === categorie),
      })).filter((c) => c.items.length > 0),
    }))
    .filter((p) => p.categories.length > 0);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />

      <main className="flex-1">
        <VideoCarousel />

        <Reveal className="glass border-b border-white/40">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
            <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Salon privé
            </span>
            <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
              Coiffure, couleur &amp; bien-être, sur mesure
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Un salon confidentiel, un nombre limité de clientes, une approche
              personnalisée. Coiffure, colorations, Head Spa, massages et soins
              capillaires, uniquement sur rendez-vous.
            </p>
            <Link
              href="/reservation"
              className="mt-2 rounded-full bg-primary px-8 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </Reveal>

        <section className="relative mx-auto max-w-5xl px-6 py-24">
          <Reveal className="mb-16 flex flex-col items-center text-center">
            <span className="font-serif text-4xl italic text-primary/70">Le menu</span>
            <h2 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
              Nos prestations
            </h2>
            <div className="mt-5 flex items-center gap-3 text-primary/50">
              <span className="h-px w-10 bg-current" />
              <span className="h-1.5 w-1.5 rotate-45 bg-current" />
              <span className="h-px w-10 bg-current" />
            </div>
            <p className="mt-5 max-w-md text-muted-foreground">
              Composez votre rendez-vous à la carte : durée et tarif se calculent
              automatiquement selon vos choix.
            </p>
          </Reveal>

          <div className="space-y-16">
            {profils.map(({ profil, categories }) => (
              <div key={profil}>
                <Reveal className="mb-6 flex items-center gap-3">
                  <ProfilIcon profil={profil} className="h-6 w-6 text-primary" />
                  <h3 className="font-serif text-2xl text-foreground sm:text-3xl">
                    {LABEL_PROFIL[profil]}
                  </h3>
                </Reveal>

                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                  {categories.map(({ categorie, items }, catIndex) => (
                    <Reveal
                      key={categorie}
                      delay={catIndex * 60}
                      className={items.length > 4 ? "md:col-span-2" : ""}
                    >
                      <div className="glass h-full rounded-3xl border border-white/50 p-6 sm:p-8 md:p-10">
                        <div className="flex items-start gap-4">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CategoryIcon categorie={categorie} className="h-6 w-6" />
                          </span>
                          <div>
                            <h4 className="font-serif text-xl text-foreground sm:text-2xl">
                              {LABEL_CATEGORIE[categorie] ?? categorie}
                            </h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {DESCRIPTION_CATEGORIE[categorie]}
                            </p>
                          </div>
                        </div>

                        <ul className="mt-7 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                          {items.map((p) => {
                            const varie = p.estLissage || p.variantesLongueur.length > 0;
                            const prix = prixAPartirDe(p, lissageMatrice);
                            return (
                              <li
                                key={p.id}
                                className="flex items-baseline gap-2 border-b border-border/60 py-3.5 last:border-0 sm:[&:nth-last-child(-n+2)]:border-0"
                              >
                                <span className="font-serif text-base text-foreground">
                                  {p.nom}
                                </span>
                                <span
                                  aria-hidden
                                  className="mb-1 flex-1 border-b border-dotted border-muted-foreground/40"
                                />
                                <span className="whitespace-nowrap text-xs text-muted-foreground">
                                  {formatDuree(p.dureeMinutes)}
                                </span>
                                <span className="whitespace-nowrap font-medium text-primary">
                                  {varie && "dès "}
                                  {formatPrix(prix)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Reveal className="glass border-t border-white/40">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="font-serif text-3xl text-foreground">
              Déjà cliente ou nouvelle venue ?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Le salon fonctionne uniquement sur rendez-vous afin de garantir une
              qualité de service optimale.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/reservation/ancienne-cliente"
                className="rounded-full bg-primary px-8 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95"
              >
                Je suis déjà cliente
              </Link>
              <Link
                href="/reservation/nouvelle-cliente"
                className="rounded-full border border-primary px-8 py-3 text-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                Je suis une nouvelle cliente
              </Link>
            </div>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
