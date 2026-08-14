export type Plage = { debut: string; fin: string };

// Index = Date.getDay() : 0 dimanche ... 6 samedi
export const HORAIRES_SALON: Record<number, Plage[]> = {
  0: [],
  1: [{ debut: "13:30", fin: "17:30" }],
  2: [],
  3: [
    { debut: "09:00", fin: "12:30" },
    { debut: "14:00", fin: "18:30" },
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
// Jeudi, vendredi : bien-être
// Lundi, samedi : privilège et bien-être
export function estMercredi(date: Date): boolean {
  return date.getDay() === 3;
}

export function estJourEnfantEtHomme(date: Date): boolean {
  return date.getDay() === 3; // Mercredi
}

export function estJourBienEtre(date: Date): boolean {
  const jour = date.getDay();
  return jour === 4 || jour === 5; // Jeudi, vendredi
}

export function estJourPrivilegeEtBienEtre(date: Date): boolean {
  const jour = date.getDay();
  return jour === 1 || jour === 6; // Lundi, samedi
}
