import Link from "next/link";
import { Ciseau } from "@/components/Ciseau";
import { horairesLisibles } from "@/lib/horaires";

// Les heures ne sont plus recopiées ici : elles viennent de HORAIRES_SALON,
// la source unique. Cette liste ne décrit plus que l'ordre d'affichage et le
// type de prestations proposé chaque jour.
const JOURS_AFFICHES = [
  { index: 1, jour: "Lundi", prestations: "Coiffure Privilège & Bien-être" },
  { index: 2, jour: "Mardi" },
  { index: 3, jour: "Mercredi", prestations: "Femmes (9h – 12h) · Enfants & Homme (11h – 18h)" },
  { index: 4, jour: "Jeudi", prestations: "Coiffure Privilège & Bien-être" },
  { index: 5, jour: "Vendredi", prestations: "Coiffure Bien-être" },
  { index: 6, jour: "Samedi", prestations: "Coiffure Privilège & Bien-être" },
];

const HORAIRES = JOURS_AFFICHES.map((j) => ({
  ...j,
  heures: horairesLisibles(j.index),
}));

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Contenu principal en grille */}
        <div className="grid gap-12 md:grid-cols-3">
          {/* Section Branding & Description */}
          <div className="footer-section">
            <div className="flex items-center gap-3">
              <p className="handwriting text-3xl leading-tight text-foreground">Namasté</p>
              <Ciseau className="h-7 w-7 -rotate-12 text-primary/45" />
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-primary">
              Coiffure &amp; bien-être
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Salon privé fonctionnant uniquement sur rendez-vous pour garantir une qualité de service optimale.
            </p>
          </div>

          {/* Section Localisation */}
          <div className="footer-section">
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-4">
              Localisation
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground text-xs uppercase tracking-[0.15em] mb-1">Adresse</p>
                <p>6 impasse des Prunelliers</p>
                <p>69720 Saint-Laurent-de-Mure</p>
                <p className="text-xs text-muted-foreground/70 mt-2">06 51 41 28 33</p>
              </div>
            </div>
          </div>

          {/* Section Horaires */}
          <div className="footer-section">
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-4">
              Horaires d'ouverture
            </p>
            <ul className="space-y-3 text-sm">
              {HORAIRES.map((h) => (
                <li key={h.jour}>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground font-medium">{h.jour}</span>
                    <span className={`text-right ${h.heures === "Fermé" ? "italic text-muted-foreground/60" : "text-foreground font-medium"}`}>
                      {h.heures}
                    </span>
                  </div>
                  {h.prestations && h.heures !== "Fermé" && (
                    <p className="mt-1 text-xs text-muted-foreground/70">{h.prestations}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="my-8 h-px bg-border" />

        {/* Liens légaux & Avis Google */}
        <div className="mb-8 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs">
          <a
            href="https://www.google.com/maps/place/?q=place_id:ChIJX-qK54DP9EcRHVjcWd-PkNA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#7D522A] bg-[#7D522A]/10 hover:bg-[#7D522A]/20 rounded-full transition-all border border-[#7D522A]/20"
          >
            <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Donner votre avis Google
          </a>
          <span className="text-border">•</span>
          <Link
            href="/mon-rendez-vous"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Mon rendez-vous
          </Link>
          <span className="text-border">•</span>
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Politique de Confidentialité
          </Link>
          <span className="text-border">•</span>
          <Link
            href="/legal"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Mentions Légales
          </Link>
          <span className="text-border">•</span>
          <Link
            href="/cookies"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Gestion des Cookies
          </Link>
        </div>

        {/* Pied de page */}
        <div className="flex flex-col items-center gap-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Namasté. Tous droits réservés.</p>
          <p>Salon de coiffure privé sur rendez-vous</p>
          <p className="text-[0.7rem] text-muted-foreground/50">
            Réalisé par Ismail EL HIMASS
          </p>
        </div>
      </div>
    </footer>
  );
}
