import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VideoCarousel } from "@/components/VideoCarousel";
import { BandeAmbiance } from "@/components/BandeAmbiance";
import { Galerie } from "@/components/Galerie";
import { SeparateurCiseau } from "@/components/Ciseau";
import { Repliable } from "@/components/Repliable";
import { Reveal } from "@/components/Reveal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProfilIcon } from "@/components/ProfilIcon";
import { HaircutIcons } from "@/components/HaircutIcons";
import { getCatalogue } from "@/lib/data";
import { formatDuree, formatPrix, prixAPartirDe } from "@/lib/prestations";
import {
  DESCRIPTION_CATEGORIE,
  DESCRIPTION_FORMULE,
  IMAGE_CATEGORIE,
  IMAGE_FORMULE,
  INCLUS_FORMULE,
  LABEL_CATEGORIE,
  LABEL_FORMULE,
  LABEL_PROFIL,
  ORDRE_CATEGORIES,
  ORDRE_FORMULES,
} from "@/lib/categories";

// La carte des prestations est lue en base à chaque affichage. Sans cela, Next
// prégénérerait cette page pendant la compilation, ce qui exigerait une base
// joignable au moment du build — impossible dans un conteneur — et figerait les
// tarifs jusqu'au prochain déploiement.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { prestations, lissageMatrice } = await getCatalogue();

  // Une même catégorie revient chez Femmes, Hommes et Enfants : la photo ne
  // s'affiche qu'à sa première occurrence, pour éviter de la répéter.
  const dejaIllustrees = new Set<string>();

  // Les prestations rattachées à une formule sont présentées à part, en deux
  // blocs « Essentielle » / « Bien-être », comme sur les plaquettes du salon.
  const formules = ORDRE_FORMULES.map((formule) => ({
    formule,
    items: prestations.filter((p) => p.formule === formule),
  })).filter((f) => f.items.length > 0);

  const profils = ["FEMME", "HOMME", "ENFANT"]
    .map((profil) => ({
      profil,
      categories: ORDRE_CATEGORIES.map((categorie) => ({
        categorie,
        items: prestations.filter(
          (p) => p.profil === profil && p.categorie === categorie && !p.formule,
        ),
      })).filter((c) => c.items.length > 0),
    }))
    .filter((p) => p.categories.length > 0)
    .map((p) => ({
      ...p,
      categories: p.categories.map((c) => {
        const illustree = !dejaIllustrees.has(c.categorie);
        dejaIllustrees.add(c.categorie);
        return { ...c, illustree };
      }),
    }));

  const IMAGE_PROFIL: Record<
    string,
    { src: string; alt: string; largeur: number; hauteur: number }
  > = {
    HOMME: {
      src: "/images/i15.png",
      alt: "Photo d'un homme en salon de coiffure",
      largeur: 800,
      hauteur: 1322,
    },
    ENFANT: {
      src: "/images/i16.png",
      alt: "Photo d'un enfant en salon de coiffure",
      largeur: 800,
      hauteur: 1322,
    },
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col pb-24 md:pb-0">
      <HaircutIcons />
      <Header />

      <main className="flex-1">
        <VideoCarousel />

        <Reveal className="glass border-b border-white/40">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
            <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Salon privé
            </span>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl gradient-text animate-gradient">
              Coiffure, couleur &amp; bien-être, sur mesure
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Un salon confidentiel, un nombre limité de clientes, une approche
              personnalisée. Coiffure, colorations, Head Spa, massages et soins
              capillaires, uniquement sur rendez-vous.
            </p>
            <Link
              href="/reservation"
              className="mt-2 rounded-full bg-primary px-8 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 btn-hover animate-bounce-subtle"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </Reveal>

        <BandeAmbiance />

        <section className="relative mx-auto max-w-5xl px-6 py-24">
          <Reveal className="mb-16 flex flex-col items-center text-center">
            <span className="font-serif text-4xl italic text-primary/70 animate-text-glow">Le menu</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl gradient-text animate-gradient">
              Nos prestations
            </h2>
            <SeparateurCiseau className="mt-5" />
            <p className="mt-5 max-w-md text-muted-foreground">
              Composez votre rendez-vous à la carte : durée et tarif se calculent
              automatiquement selon vos choix.
            </p>
          </Reveal>

          {/* Les deux formules de coiffure femme */}
          <div className="mb-16 space-y-8">
            {formules.map(({ formule, items }) => (
              <Reveal key={formule}>
                <div className="glass rounded-3xl border border-white/50 p-6 sm:p-8 md:p-10 card-hover">
                  {IMAGE_FORMULE[formule] && (
                    <div className="mb-6 flex justify-center">
                      <Image
                        src={IMAGE_FORMULE[formule].src}
                        alt={IMAGE_FORMULE[formule].alt}
                        width={IMAGE_FORMULE[formule].largeur}
                        height={IMAGE_FORMULE[formule].hauteur}
                        sizes="(min-width: 768px) 45vw, 100vw"
                        className="photo-libre max-h-80 w-auto max-w-full"
                      />
                    </div>
                  )}
                  <h3 className="font-serif text-2xl text-foreground sm:text-3xl">
                    {LABEL_FORMULE[formule]}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {DESCRIPTION_FORMULE[formule]}
                  </p>

                  <Repliable
                    apercu={`Voir les ${items.length} tarifs · dès ${formatPrix(
                      Math.min(...items.map((p) => prixAPartirDe(p, lissageMatrice))),
                    )}`}
                  >
                  <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                      Toutes les prestations comprennent
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {INCLUS_FORMULE[formule]?.map((ligne) => (
                        <li
                          key={ligne}
                          className="flex gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-primary">•</span>
                          {ligne}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 space-y-4">
                    {items.map((p) => {
                      const varie = p.estLissage || p.variantesLongueur.length > 0;
                      const prix = prixAPartirDe(p, lissageMatrice);
                      return (
                        <div
                          key={p.id}
                          className="flex flex-col gap-2 border-b border-border/30 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="service-item flex items-baseline justify-between gap-3">
                            <span className="font-serif text-base font-medium text-foreground">
                              {p.nom}
                            </span>
                            <span className="price-highlight animate-float whitespace-nowrap text-sm font-semibold text-primary">
                              {varie && "dès "}
                              {formatPrix(prix)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Durée: {formatDuree(p.dureeMinutes)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  </Repliable>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="space-y-16">
            {profils.map(({ profil, categories }) => (
              <div key={profil} className="space-y-8 max-w-6xl mx-auto">
                <div>
                  <Reveal className="mb-6 flex items-center gap-3">
                    <ProfilIcon profil={profil} className="h-6 w-6 text-primary" />
                    <h3 className="font-serif text-2xl text-foreground sm:text-3xl">
                      {LABEL_PROFIL[profil]}
                    </h3>
                  </Reveal>

                  {IMAGE_PROFIL[profil] ? (
                    <div className="mb-8 flex justify-center photo-card">
                      <img
                        src={IMAGE_PROFIL[profil].src}
                        alt={IMAGE_PROFIL[profil].alt}
                        width={IMAGE_PROFIL[profil].largeur}
                        height={IMAGE_PROFIL[profil].hauteur}
                        className="photo-libre h-auto max-h-[32rem] w-full max-w-5xl rounded-[28px] object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                  {categories.map(({ categorie, items, illustree }, catIndex) => (
                    <Reveal
                      key={categorie}
                      delay={catIndex * 60}
                      className={categories.length === 1 || items.length > 4 ? "md:col-span-2" : ""}
                    >
                      <div className="glass h-full rounded-3xl border border-white/50 p-6 sm:p-8 md:p-10 card-hover">
                        {illustree && IMAGE_CATEGORIE[categorie] && (
                          <div className="mb-6 flex justify-center">
                            <Image
                              src={IMAGE_CATEGORIE[categorie].src}
                              alt={IMAGE_CATEGORIE[categorie].alt}
                              width={IMAGE_CATEGORIE[categorie].largeur}
                              height={IMAGE_CATEGORIE[categorie].hauteur}
                              sizes="(min-width: 768px) 45vw, 100vw"
                              className="photo-libre max-h-72 w-auto max-w-full sm:max-h-80"
                            />
                          </div>
                        )}

                        <div className="flex items-start gap-4 pb-6 border-b border-border/40">
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CategoryIcon categorie={categorie} className="h-7 w-7" />
                          </span>
                          <div className="flex-1">
                            <h4 className="font-serif text-2xl text-foreground sm:text-3xl">
                              {LABEL_CATEGORIE[categorie] ?? categorie}
                            </h4>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                              {DESCRIPTION_CATEGORIE[categorie]}
                            </p>
                          </div>
                        </div>

                        <Repliable
                          apercu={`Voir les ${items.length} tarifs · dès ${formatPrix(
                            Math.min(...items.map((p) => prixAPartirDe(p, lissageMatrice))),
                          )}`}
                        >
                          <div className="mt-6 space-y-4">
                            {items.map((p) => {
                              const varie = p.estLissage || p.variantesLongueur.length > 0;
                              const prix = prixAPartirDe(p, lissageMatrice);
                              return (
                                <div
                                  key={p.id}
                                  className="flex flex-col gap-2 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                                >
                                  <div className="flex items-baseline justify-between gap-3 service-item">
                                    <span className="font-serif font-medium text-base text-foreground">
                                      {p.nom}
                                    </span>
                                    <span className="whitespace-nowrap text-sm font-semibold text-primary animate-float price-highlight">
                                      {varie && "dès "}
                                      {formatPrix(prix)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Durée: {formatDuree(p.dureeMinutes)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </Repliable>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Reveal>
          <Galerie />
        </Reveal>

        <Reveal className="glass border-t border-white/40">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="font-serif text-3xl gradient-text animate-gradient">
              Déjà cliente ou nouvelle venue ?
            </h2>
            <SeparateurCiseau className="mt-5" />
            <p className="mt-3 text-muted-foreground">
              Le salon fonctionne uniquement sur rendez-vous afin de garantir une
              qualité de service optimale.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/reservation/ancienne-cliente"
                className="rounded-full bg-primary px-8 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 btn-hover"
              >
                Je suis déjà cliente
              </Link>
              <Link
                href="/reservation/nouvelle-cliente"
                className="rounded-full border border-primary px-8 py-3 text-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95 btn-hover"
              >
                Je suis une nouvelle cliente
              </Link>
            </div>
          </div>
        </Reveal>
      </main>

      <Footer />

      {/* Mobile : la prise de rendez-vous reste à portée de pouce, quelle que
          soit la position dans la page (le menu fait plusieurs écrans). */}
      <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-white/50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
        <Link
          href="/reservation"
          className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-primary-foreground transition-opacity active:scale-[0.99]"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </div>
  );
}
