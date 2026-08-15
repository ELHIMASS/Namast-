import Link from "next/link";
import { Ciseau } from "@/components/Ciseau";

const HORAIRES = [
  { jour: "Lundi", heures: "13h30 – 17h30", prestations: "Coiffure Privilège & Bien-être" },
  { jour: "Mardi", heures: "Fermé" },
  { jour: "Mercredi", heures: "9h00 – 12h30 / 14h00 – 18h30", prestations: "Coiffure Enfants & Homme" },
  { jour: "Jeudi", heures: "9h00 – 13h00 / 14h00 – 18h00", prestations: "Coiffure Bien-être" },
  { jour: "Vendredi", heures: "9h00 – 13h00 / 14h00 – 18h30", prestations: "Coiffure Bien-être" },
  { jour: "Samedi", heures: "9h00 – 14h00", prestations: "Coiffure Privilège & Bien-être" },
];

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

        {/* Liens légaux */}
        <div className="mb-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs">
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
