export type PrestationCalcul = {
  dureeMinutes: number;
  prixCentimes: number;
  tempsNettoyageMinutes: number;
};

export function calculerTotal(prestations: PrestationCalcul[]) {
  const dureePrestations = prestations.reduce((s, p) => s + p.dureeMinutes, 0);
  const prixTotalCentimes = prestations.reduce((s, p) => s + p.prixCentimes, 0);
  const tempsNettoyage = prestations.length
    ? Math.max(...prestations.map((p) => p.tempsNettoyageMinutes))
    : 0;

  return {
    dureePrestations,
    dureeTotaleAvecNettoyage: dureePrestations + tempsNettoyage,
    prixTotalCentimes,
    tempsNettoyage,
  };
}

export function formatPrix(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
}
