"use client";

// Fond d'écran : un voile dégradé et quelques halos qui dérivent lentement.
// Aucune trame géométrique, pour garder une impression douce et organique.
export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Voile de base : Crème chaud #F0DFCE vers Beige sable #E6CEB3 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(175deg, #f9f3ea 0%, #f0dfce 42%, #e6ceb3 72%, #d5b695 100%)",
        }}
      />

      {/* Halo Vert sauge chaud (#989077) en haut à gauche */}
      <div
        className="absolute -left-[20%] -top-[25%] h-[75vmax] w-[75vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(152, 144, 119, 0.25) 0%, rgba(152, 144, 119, 0.08) 45%, transparent 70%)",
          animation: "blob 22s ease-in-out infinite",
        }}
      />

      {/* Halo Terracotta / Brun miel (#A97847) à droite */}
      <div
        className="absolute -right-[25%] top-[20%] h-[65vmax] w-[65vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(169, 120, 71, 0.18) 0%, rgba(169, 120, 71, 0.05) 45%, transparent 70%)",
          animation: "blob 28s ease-in-out infinite 4s",
        }}
      />

      {/* Éclaircie douce en bas */}
      <div
        className="absolute -bottom-[20%] left-[15%] h-[60vmax] w-[60vmax] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 253, 250, 0.6) 0%, rgba(255, 253, 250, 0.2) 50%, transparent 72%)",
          animation: "blob 25s ease-in-out infinite 8s",
        }}
      />
    </div>
  );
}
