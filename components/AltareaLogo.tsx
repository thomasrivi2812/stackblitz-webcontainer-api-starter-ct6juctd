// Logo Altarea OFFICIEL (vecteurs extraits du .ai fourni), recoloré via
// currentColor grâce à un masque CSS : la forme reste strictement identique,
// seule la couleur change (violet #6A2C91 sur fond clair, blanc sur fond
// sombre). Fichiers : public/altarea-mark.svg (le « A ») et
// public/altarea-lockup.svg (« A » + wordmark ALTAREA).

const MARK_RATIO = 194.6 / 206.0;   // largeur / hauteur du « A » seul
const LOCKUP_RATIO = 285.7 / 285.7; // lockup (quasi carré)

function maskStyle(url: string): React.CSSProperties {
  return {
    display: 'inline-block',
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  };
}

// Le « A » seul (encart certifs, sur-titres…).
export function AltareaMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Altarea"
      className={className}
      style={{ ...maskStyle('/altarea-mark.svg'), width: size * MARK_RATIO, height: size, color: 'currentColor' }}
    />
  );
}

// Le lockup complet « A + ALTAREA » (bas de page Groupe, footer…).
export function AltareaLogo({ height = 34, className }: { height?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Altarea"
      className={className}
      style={{ ...maskStyle('/altarea-lockup.svg'), width: height * LOCKUP_RATIO, height, color: 'currentColor' }}
    />
  );
}
