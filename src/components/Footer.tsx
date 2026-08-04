const HORAIRES = [
  { jour: "Lundi", heures: "13h30 – 18h00" },
  { jour: "Mardi", heures: "Fermé" },
  { jour: "Mercredi", heures: "9h00 – 13h00 / 14h00 – 18h00" },
  { jour: "Jeudi", heures: "9h00 – 13h00 / 14h00 – 18h30" },
  { jour: "Vendredi", heures: "9h00 – 13h00 / 14h00 – 18h30" },
  { jour: "Samedi", heures: "9h00 – 14h00" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">
        <p className="font-serif text-lg text-foreground">Namasté</p>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">
          Coiffure &amp; bien-être
        </p>
        <p className="mt-3">Salon privé — fonctionne uniquement sur rendez-vous.</p>

        <div className="mt-6 max-w-xs">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary/80">
            Horaires
          </p>
          <ul>
            {HORAIRES.map((h) => (
              <li
                key={h.jour}
                className="flex items-baseline justify-between gap-4 border-b border-border/60 py-1.5 last:border-0"
              >
                <span className="text-foreground">{h.jour}</span>
                <span className={h.heures === "Fermé" ? "italic text-muted-foreground" : ""}>
                  {h.heures}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
