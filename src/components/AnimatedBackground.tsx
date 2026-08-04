"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Blob gradient animé 1 */}
      <div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-blob opacity-40"
        style={{ animation: "blob 7s infinite" }}
      />

      {/* Blob gradient animé 2 */}
      <div
        className="absolute top-1/3 -left-40 w-80 h-80 bg-gradient-to-br from-primary/15 to-primary/0 rounded-full blur-3xl opacity-30"
        style={{ animation: "blob 9s infinite 2s" }}
      />

      {/* Blob gradient animé 3 */}
      <div
        className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/0 rounded-full blur-3xl opacity-20"
        style={{ animation: "blob 11s infinite 4s" }}
      />

      {/* Lignes animées de décoration */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
