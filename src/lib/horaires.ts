export type Plage = { debut: string; fin: string };

// Index = Date.getDay() : 0 dimanche ... 6 samedi
//
// La borne de fin est l'heure de fermeture : une séance doit être terminée à
// cette heure-là, nettoyage compris. Le salon fermant à 18h, aucune plage ne
// va au-delà — jeudi et vendredi allaient jusqu'à 18h30, ce qui laissait des
// séances se terminer après la fermeture.
export const HORAIRES_SALON: Record<number, Plage[]> = {
  0: [],
  1: [{ debut: "13:30", fin: "18:00" }],
  2: [],
  3: [
    { debut: "09:00", fin: "13:00" },
    { debut: "14:00", fin: "18:00" },
  ],
  4: [
    { debut: "09:00", fin: "13:00" },
    { debut: "14:00", fin: "18:00" },
  ],
  5: [
    { debut: "09:00", fin: "13:00" },
    { debut: "14:00", fin: "18:00" },
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

// Les prestations enfants ne se réservent que le mercredi.
export function estMercredi(date: Date): boolean {
  return date.getDay() === 3;
}
