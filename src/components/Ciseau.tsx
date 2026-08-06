/**
 * Motif ciseau + peigne du salon (public/images/ciseau.png).
 *
 * L'icône est appliquée en masque CSS : elle prend donc la couleur du texte
 * (`text-primary/30`, etc.) au lieu de rester noire. Purement décoratif,
 * masqué aux lecteurs d'écran.
 */
export function Ciseau({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`motif-ciseau ${className}`} />;
}

/** Séparateur de section : un filet, le ciseau, un filet. */
export function SeparateurCiseau({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-4 text-primary/50 ${className}`}
    >
      <span className="h-px w-10 bg-current sm:w-14" />
      <Ciseau className="h-6 w-6 -rotate-12 text-primary/60" />
      <span className="h-px w-10 bg-current sm:w-14" />
    </div>
  );
}
