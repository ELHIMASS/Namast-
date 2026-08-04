const PATHS: Record<string, React.ReactNode> = {
  COUPE: (
    <>
      <circle cx="7" cy="7" r="2.1" />
      <circle cx="7" cy="17" r="2.1" />
      <line x1="8.7" y1="8.5" x2="19" y2="19" />
      <line x1="8.7" y1="15.5" x2="19" y2="5" />
    </>
  ),
  COULEUR: <path d="M12 3c4 5 6 8.5 6 11.5A6 6 0 1 1 6 14.5C6 11.5 8 8 12 3Z" />,
  SOIN: (
    <>
      <path d="M4 20c8-1 14-7 15-15C11 6 5 12 4 20Z" />
      <path d="M6.5 17.5c3-3 6-6 11-9" />
    </>
  ),
  HEAD_SPA: (
    <>
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="5.5" r="1.8" />
      <circle cx="12" cy="18.5" r="1.8" />
      <circle cx="5.5" cy="12" r="1.8" />
      <circle cx="18.5" cy="12" r="1.8" />
    </>
  ),
  MASSAGE: (
    <>
      <path d="M4 11c2-3 5-3 7 0s5 3 7 0" />
      <path d="M4 16c2-3 5-3 7 0s5 3 7 0" />
    </>
  ),
  EVENEMENTIEL: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
};

export function CategoryIcon({ categorie, className = "" }: { categorie: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[categorie] ?? <circle cx="12" cy="12" r="6" />}
    </svg>
  );
}
