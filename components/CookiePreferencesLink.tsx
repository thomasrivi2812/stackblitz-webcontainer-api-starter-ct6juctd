'use client';

// Bouton « Gérer mes cookies » du footer : rouvre la modale de préférences
// Didomi (obligation CNIL : le retrait du consentement doit rester aussi
// simple que son octroi). Rendu seulement quand la CMP est configurée.
import { DIDOMI_ENABLED as ENABLED } from '@/lib/didomi';

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
