// Marque Altarea recréée en SVG (le « A » + le mot-symbole), couleur via currentColor.
// Pour utiliser le vrai logo officiel : dépose-le dans public/altarea-logo.svg et
// remplace <AltareaMark/> par <img src="/altarea-logo.svg" .../>.

export function AltareaMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="currentColor"
      className={className}
      role="img"
      aria-label="Altarea"
    >
      {/* jambe gauche */}
      <path d="M50 16 L61 16 L34 104 L20 104 Z" />
      {/* jambe droite (plus large) */}
      <path d="M66 16 L80 16 L101 104 L84 104 Z" />
    </svg>
  );
}

export function AltareaLogo({ height = 34, className }: { height?: number; className?: string }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: height * 0.1, color: 'currentColor' }}
    >
      <AltareaMark size={height} />
      <span
        style={{
          fontWeight: 700,
          letterSpacing: '0.18em',
          fontSize: height * 0.34,
          lineHeight: 1,
        }}
      >
        ALTAREA
      </span>
    </span>
  );
}
