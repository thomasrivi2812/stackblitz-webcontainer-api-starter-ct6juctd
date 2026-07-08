'use client';

// Bouton « Gérer mes cookies » du footer : rouvre la modale de préférences
// Didomi (obligation CNIL : le retrait du consentement doit rester aussi
// simple que son octroi). Rendu seulement quand la CMP est configurée.
const ENABLED = !!process.env.NEXT_PUBLIC_DIDOMI_API_KEY;

declare global {
  interface Window {
    Didomi?: { preferences?: { show?: () => void } };
  }
}

export function CookiePreferencesLink({ label }: { label: string }) {
  if (!ENABLED) return null;
  return (
    <li>
      <button
        type="button"
        className="footer-cookie-link"
        onClick={() => window.Didomi?.preferences?.show?.()}
      >
        {label}
      </button>
    </li>
  );
}
