const PATHS: Record<string, React.ReactNode> = {
  FEMME: (
    <>
      <circle cx="12" cy="6.5" r="3" />
      <path d="M7.5 21l1.8-8.5a3 3 0 0 1 5.4 0L16.5 21" />
      <path d="M9.5 16h5" />
    </>
  ),
  HOMME: (
    <>
      <circle cx="12" cy="6.5" r="3" />
      <path d="M7 21v-6a5 5 0 0 1 10 0v6" />
    </>
  ),
  ENFANT: (
    <>
      <circle cx="12" cy="7" r="2.4" />
      <path d="M9 21v-5.5a3 3 0 0 1 6 0V21" />
    </>
  ),
};

export function ProfilIcon({ profil, className = "" }: { profil: string; className?: string }) {
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
      {PATHS[profil] ?? <circle cx="12" cy="12" r="6" />}
    </svg>
  );
}
