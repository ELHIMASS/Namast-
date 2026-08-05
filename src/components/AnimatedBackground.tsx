"use client";

// Fond d'écran : un voile dégradé et quelques halos qui dérivent lentement.
// Aucune trame géométrique, pour garder une impression douce et organique.
export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Voile de base, du blanc rosé vers un rose plus soutenu en bas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(175deg, #fdf9f8 0%, #fbf2f1 42%, #f8ebec 72%, #f5e3e5 100%)",
        }}
      />

      {/* Halo chaud en haut à gauche */}
      <div
        className="absolute -left-[20%] -top-[25%] h-[75vmax] w-[75vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(193, 122, 144, 0.18) 0%, rgba(193, 122, 144, 0.06) 45%, transparent 70%)",
          animation: "blob 22s ease-in-out infinite",
        }}
      />

      {/* Halo plus profond à droite */}
      <div
        className="absolute -right-[25%] top-[20%] h-[65vmax] w-[65vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(138, 74, 94, 0.13) 0%, rgba(138, 74, 94, 0.04) 45%, transparent 70%)",
          animation: "blob 28s ease-in-out infinite 4s",
        }}
      />

      {/* Éclaircie en bas, pour éviter que la page se ferme sur du sombre */}
      <div
        className="absolute -bottom-[20%] left-[15%] h-[60vmax] w-[60vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 72%)",
          animation: "blob 25s ease-in-out infinite 8s",
        }}
      />
    </div>
  );
}
