interface PerfumeBottlePlaceholderProps {
  liquid: string;
  marca: string;
  size?: "sm" | "lg";
}

/**
 * Ilustração decorativa exibida quando o perfume não tem foto:
 * um frasco minimalista preenchido com a cor do "líquido" (derivada
 * dos acordes principais) e a inicial da marca como monograma.
 */
export function PerfumeBottlePlaceholder({
  liquid,
  marca,
  size = "sm",
}: PerfumeBottlePlaceholderProps) {
  const initial = (marca?.trim().charAt(0) || "?").toUpperCase();
  const bottleH = size === "lg" ? "h-44 md:h-56" : "h-28";
  const monoSize = size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 80 120"
        className={`${bottleH} w-auto drop-shadow-sm`}
        role="presentation"
      >
        {/* tampa */}
        <rect x="30" y="4" width="20" height="14" rx="2" className="fill-foreground/80" />
        {/* gargalo */}
        <rect x="34" y="18" width="12" height="10" className="fill-foreground/25" />
        {/* corpo do frasco */}
        <rect
          x="16"
          y="28"
          width="48"
          height="86"
          rx="10"
          className="fill-background/70 stroke-foreground/20"
          strokeWidth="1.5"
        />
        {/* líquido */}
        <path
          d="M20 62 h40 v42 a8 8 0 0 1 -8 8 h-24 a8 8 0 0 1 -8 -8 z"
          fill={liquid}
          opacity="0.75"
        />
        {/* reflexo */}
        <rect x="22" y="34" width="6" height="70" rx="3" className="fill-background/60" />
      </svg>
      <span className={`txt-display ${monoSize} text-foreground/60 select-none`}>
        {initial}
      </span>
    </div>
  );
}
