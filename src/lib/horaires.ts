export type Plage = { debut: string; fin: string };

// SOURCE UNIQUE des horaires du salon.
//
// Trois définitions coexistaient auparavant — ici, dans horairesOuverture.ts
// et dans le pied de page — et elles avaient divergé : le mercredi soir était
// généré jusqu'à 18h30 puis refusé à la validation, qui s'arrêtait à 18h00.
// horairesOuverture.ts et Footer.tsx dérivent désormais de cette table :
// modifier un horaire ici le répercute partout.
//
// Index = Date.getDay() : 0 dimanche ... 6 samedi
export const HORAIRES_SALON: Record<number, Plage[]> = {
  0: [],
  1: [{ debut: "13:30", fin: "17:30" }],
  2: [],
  3: [
    { debut: "09:00", fin: "12:30" },
    { debut: "14:00", fin: "18:00" },
  ],
  4: [
    { debut: "09:00", fin: "13:00" },
    { debut: "14:00", fin: "18:00" },
  ],
  5: [
    { debut: "09:00", fin: "13:00" },
    { debut: "14:00", fin: "18:30" },
  ],
  6: [{ debut: "09:00", fin: "14:00" }],
};

export const NOMS_JOURS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

export function estJourOuvert(date: Date): boolean {
  return (HORAIRES_SALON[date.getDay()] ?? []).length > 0;
}

// Mercredi : enfants et hommes
// Vendredi : bien-être seulement
// Lundi, jeudi, samedi : privilège et bien-être
export function estMercredi(date: Date): boolean {
  return date.getDay() === 3;
}

export function estJourEnfantEtHomme(date: Date): boolean {
  return date.getDay() === 3; // Mercredi
}

export function estJourBienEtre(date: Date): boolean {
  const jour = date.getDay();
  return jour === 5; // Vendredi seulement
}

export function estJourPrivilegeEtBienEtre(date: Date): boolean {
  const jour = date.getDay();
  return jour === 1 || jour === 4 || jour === 6; // Lundi, jeudi, samedi
}

/** "09:00" → "9h00" : notation française, pour l'affichage seulement. */
export function formatHeure(heure: string): string {
  const [h, m] = heure.split(":");
  return `${Number(h)}h${m}`;
}

/**
 * Plages d'un jour en une ligne lisible, ou « Fermé ».
 * Utilisé par le pied de page, qui ne tient ainsi plus sa propre liste.
 */
export function horairesLisibles(jour: number): string {
  const plages = HORAIRES_SALON[jour] ?? [];
  if (plages.length === 0) return "Fermé";
  return plages
    .map((p) => `${formatHeure(p.debut)} – ${formatHeure(p.fin)}`)
    .join(" / ");
}
