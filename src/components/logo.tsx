/**
 * Le mark reprend l'objet central de l'app : la case à cocher du formulaire.
 * Pas une métaphore abstraite — l'icône littérale de ce que l'outil donne :
 * la bonne case, cochée. Cf. maquette de marque validée.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <rect x="10" y="10" width="80" height="80" rx="14" strokeWidth="6" />
      <path d="M28 52 L44 68 L74 34" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-heading text-xl font-black tracking-tight ${className ?? ""}`}>
      décla
    </span>
  );
}
