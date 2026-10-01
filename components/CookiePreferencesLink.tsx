'use client';

// Bouton « Gérer mes cookies » du footer : rouvre la modale de préférences
// Didomi (obligation CNIL : le retrait du consentement doit rester aussi
// simple que son octroi). Rendu seulement quand la CMP est configurée.
import { DIDOMI_ENABLED as ENABLED, showDidomiPreferences } from '@/lib/didomi';

export function CookiePreferencesLink({ label }: { label: string }) {
  if (!ENABLED) return null;
  return (
    <li>
      <button
        type="button"
        className="footer-cookie-link"
        onClick={showDidomiPreferences}
      >
        {label}
      </button>
    </li>
  );
}
