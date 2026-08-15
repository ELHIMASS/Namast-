import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VideoCarousel } from "@/components/VideoCarousel";
import { BandeAmbiance } from "@/components/BandeAmbiance";
import { Galerie } from "@/components/Galerie";
import { CommandeBelma } from "@/components/CommandeBelma";
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
import { demandeFinition } from "@/lib/prestations";

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

        {/* HERO SECTION PREMIUM */}
        <Reveal className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="mx-auto max-w-4xl flex flex-col items-center gap-8 px-6 py-32 text-center relative z-10">
            <div className="space-y-2">
              <span className="inline-block text-xs uppercase tracking-[0.4em] text-primary font-semibold px-4 py-2 rounded-full bg-primary/10">
                ✨ Salon privé & confidentiel
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-tight gradient-text animate-gradient font-bold">
                Coiffure &amp; Bien-être<br />Sur Mesure
              </h1>
            </div>
            <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Bienvenue à Namasté, votre refuge personnel pour la beauté et la détente.
              Une expérience exclusive conçue pour vous, dans une atmosphère sereine et bienveillante.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/reservation"
                className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-8 sm:px-10 py-4 text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 active:scale-95 btn-hover"
              >
                Prendre rendez-vous
              </Link>
              <Link
                href="#prestations"
                className="rounded-full border-2 border-primary px-8 sm:px-10 py-4 text-foreground font-semibold transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                Découvrir nos services
              </Link>
            </div>
          </div>
        </Reveal>

        {/* SECTION AVANTAGES */}
        <Reveal>
          <section className="mx-auto max-w-5xl px-6 py-24">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass rounded-2xl border border-white/30 p-8 text-center hover:border-primary/50 transition-all">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-serif text-xl text-foreground mb-3">Sur Mesure</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Chaque prestation est adaptée à votre type de cheveux, votre style et vos envies.
                </p>
              </div>
              <div className="glass rounded-2xl border border-white/30 p-8 text-center hover:border-primary/50 transition-all">
                <div className="text-4xl mb-4">🌿</div>
                <h3 className="font-serif text-xl text-foreground mb-3">Naturel & Biologique</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Produits professionnels, formules douces et soins capillaires nourrissants.
                </p>
              </div>
              <div className="glass rounded-2xl border border-white/30 p-8 text-center hover:border-primary/50 transition-all">
                <div className="text-4xl mb-4">☮️</div>
                <h3 className="font-serif text-xl text-foreground mb-3">Atmosphère Zen</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Un nombre limité de clientes pour garantir sérénité et qualité optimale.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        <BandeAmbiance />

        <section id="prestations" className="relative mx-auto max-w-6xl px-6 py-32">
          <Reveal className="mb-20 flex flex-col items-center text-center">
            <span className="inline-block text-xs uppercase tracking-[0.4em] text-primary font-semibold px-4 py-2 rounded-full bg-primary/10 mb-4">
              ✨ Notre Menu Complet
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl gradient-text animate-gradient mb-4">
              Explorez Nos Prestations
            </h2>
            <SeparateurCiseau className="mt-4" />
            <p className="mt-6 max-w-2xl text-muted-foreground text-lg">
              Composez votre rendez-vous à la carte. Tarifs et durées calculés automatiquement
              selon vos choix, votre type de cheveux et vos préférences.
            </p>
          </Reveal>

          {/* Les deux formules de coiffure femme */}
          <div className="mb-20 space-y-8">
            {formules.map(({ formule, items }, idx) => (
              <Reveal key={formule} delay={idx * 100}>
                <div className="glass rounded-3xl border border-white/40 overflow-hidden card-hover hover:border-primary/40 transition-all duration-300">
                  {IMAGE_FORMULE[formule] && (
                    <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                      <Image
                        src={IMAGE_FORMULE[formule].src}
                        alt={IMAGE_FORMULE[formule].alt}
                        width={IMAGE_FORMULE[formule].largeur}
                        height={IMAGE_FORMULE[formule].hauteur}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="p-8 sm:p-10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">
                          {LABEL_FORMULE[formule]}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-12 h-1 bg-gradient-to-r from-primary to-transparent rounded-full" />
                        </div>
                      </div>
                      <span className="text-2xl font-semibold text-primary whitespace-nowrap">
                        dès {formatPrix(
                          Math.min(...items.map((p) => prixAPartirDe(p, lissageMatrice))),
                        )}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {DESCRIPTION_FORMULE[formule]}
                    </p>

                    <div className="mb-8 rounded-2xl bg-primary/5 border border-primary/20 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
                        ✓ Toutes les prestations comprennent
                      </p>
                      <ul className="space-y-2">
                        {INCLUS_FORMULE[formule]?.map((ligne) => (
                          <li
                            key={ligne}
                            className="flex gap-3 text-sm text-muted-foreground"
                          >
                            <span className="text-primary font-bold">→</span>
                            <span>{ligne}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Repliable
                      apercu={`Voir les ${items.length} prestations · Plus de détails`}
                    >
                      <div className="space-y-4">
                        {items.map((p, pidx) => {
                          const varie = p.estLissage || p.variantesLongueur.length > 0;
                          const prix = prixAPartirDe(p, lissageMatrice);
                          return (
                            <div
                              key={p.id}
                              className="flex flex-col gap-2 pb-4 border-b border-border/20 last:border-0 last:pb-0"
                            >
                              <div className="service-item flex items-start justify-between gap-4">
                                <div>
                                  <span className="font-serif text-base font-semibold text-foreground block mb-1">
                                    {p.nom}
                                  </span>
                                  <div className="text-xs text-muted-foreground">Durée: {formatDuree(p.dureeMinutes)}</div>
                                  {demandeFinition(p) && (
                                    <div className="text-xs text-muted-foreground">Finition: Brushing ou Sechage</div>
                                  )}
                                </div>
                                <span className="price-highlight whitespace-nowrap text-base font-bold text-primary">
                                  {varie && "dès "}
                                  {formatPrix(prix)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Repliable>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="space-y-24">
            {profils.map(({ profil, categories }, profIdx) => (
              <Reveal key={profil} delay={profIdx * 100}>
                <div className="space-y-8">
                  <div className="text-center pb-4 border-b border-border/30">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <ProfilIcon profil={profil} className="h-8 w-8 text-primary" />
                      <h3 className="font-serif text-4xl sm:text-5xl text-foreground">
                        {LABEL_PROFIL[profil]}
                      </h3>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-block w-16 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full" />
                    </div>
                  </div>

                  {IMAGE_PROFIL[profil] ? (
                    <div className="mb-0 flex justify-center photo-card">
                      <div className="relative h-56 sm:h-64 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl">
                        <img
                          src={IMAGE_PROFIL[profil].src}
                          alt={IMAGE_PROFIL[profil].alt}
                          width={IMAGE_PROFIL[profil].largeur}
                          height={IMAGE_PROFIL[profil].hauteur}
                          className="photo-libre h-full w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  {categories.map(({ categorie, items, illustree }, catIndex) => (
                    <Reveal
                      key={categorie}
                      delay={catIndex * 80}
                      className={categories.length === 1 || items.length > 4 ? "lg:col-span-2" : ""}
                    >
                      <div className="glass h-full rounded-3xl border border-white/40 overflow-hidden card-hover hover:border-primary/40 transition-all duration-300 flex flex-col">
                        {illustree && IMAGE_CATEGORIE[categorie] && (
                          <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                            <Image
                              src={IMAGE_CATEGORIE[categorie].src}
                              alt={IMAGE_CATEGORIE[categorie].alt}
                              width={IMAGE_CATEGORIE[categorie].largeur}
                              height={IMAGE_CATEGORIE[categorie].hauteur}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          </div>
                        )}

                        <div className="flex-1 flex flex-col p-8 sm:p-10">
                          <div className="flex items-start gap-4 mb-6">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                              <CategoryIcon categorie={categorie} className="h-8 w-8" />
                            </span>
                            <div className="flex-1">
                              <h4 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
                                {LABEL_CATEGORIE[categorie] ?? categorie}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {DESCRIPTION_CATEGORIE[categorie]}
                              </p>
                            </div>
                          </div>

                          <div className="flex-1" />

                          <Repliable
                            apercu={`${items.length} prestation${items.length > 1 ? 's' : ''} · À partir de ${formatPrix(
                              Math.min(...items.map((p) => prixAPartirDe(p, lissageMatrice))),
                            )}`}
                          >
                            <div className="space-y-3 pt-4 border-t border-border/30">
                              {items.map((p) => {
                                const varie = p.estLissage || p.variantesLongueur.length > 0;
                                const prix = prixAPartirDe(p, lissageMatrice);
                                return (
                                  <div
                                    key={p.id}
                                    className="flex flex-col gap-1 pb-3 border-b border-border/20 last:border-0 last:pb-0"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <span className="font-serif font-semibold text-base text-foreground">
                                        {p.nom}
                                      </span>
                                      <span className="whitespace-nowrap text-base font-bold text-primary">
                                        {varie && "dès "}
                                        {formatPrix(prix)}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div>⏱ {formatDuree(p.dureeMinutes)}</div>
                                      {demandeFinition(p) && (
                                        <div>✨ Finition: Brushing ou Sechage</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </Repliable>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <Galerie />
        </Reveal>

        <Reveal className="mx-auto max-w-5xl px-6 pb-24">
          <CommandeBelma />
        </Reveal>

        <Reveal className="glass border-t border-white/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-4xl px-6 py-28 text-center relative z-10">
            <span className="inline-block text-xs uppercase tracking-[0.4em] text-primary font-semibold px-4 py-2 rounded-full bg-primary/10 mb-6">
              🎯 Prêt à vous offrir ce moment de détente ?
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl gradient-text animate-gradient mb-4">
              Réservez Votre Rendez-vous
            </h2>
            <SeparateurCiseau className="mt-4 mb-6" />
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed mb-10">
              Notre salon fonctionne uniquement sur rendez-vous pour garantir une
              expérience exclusive et une qualité de service incomparable.
              Que vous soyez nouvelle cliente ou fidèle, nous vous accueillons
              dans une atmosphère sereine et bienveillante.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservation/ancienne-cliente"
                className="rounded-full bg-primary px-10 py-4 text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 active:scale-95 btn-hover"
              >
                Je suis déjà cliente
              </Link>
              <Link
                href="/reservation/nouvelle-cliente"
                className="rounded-full border-2 border-primary px-10 py-4 text-foreground font-semibold transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                Je suis une nouvelle cliente
              </Link>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              ⏰ Disponibilités : Lundi, Mercredi à Samedi · Sur rendez-vous uniquement
            </p>
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
