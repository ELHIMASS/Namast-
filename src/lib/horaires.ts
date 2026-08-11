export type Plage = { debut: string; fin: string };

// Index = Date.getDay() : 0 dimanche ... 6 samedi
//
// La borne de fin est l'heure de fermeture : une séance doit être terminée à
// cette heure-là, nettoyage compris. Le mercredi, réservé aux hommes et aux
// enfants, va de 9h à 18h ; jeudi et vendredi ferment à 18h30.
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
    { debut: "14:00", fin: "18:30" },
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

// Les prestations enfants ne se réservent que le mercredi.
export function estMercredi(date: Date): boolean {
  return date.getDay() === 3;
}
