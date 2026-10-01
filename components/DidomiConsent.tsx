'use client';

import { useEffect } from 'react';
import { DIDOMI_API_KEY as API_KEY, DIDOMI_NOTICE_ID as NOTICE_ID } from '@/lib/didomi';

// CMP Didomi (bannière cookies + registre des consentements).
// Clé API et notice NDC : voir lib/didomi.ts.
// La bannière, la modale de préférences et le registre de preuves sont
// entièrement gérés par Didomi ; le bouton « Gérer mes cookies » du footer
// rouvre la modale (window.Didomi.preferences.show()).

declare global {
  interface Window {
    didomiConfig?: Record<string, unknown>;
  }
}

export function DidomiConsent({ locale }: { locale: string }) {
  useEffect(() => {
    if (!API_KEY) return;
    if (document.getElementById('didomi-loader')) return;
    // Aligne la langue de la bannière sur celle du site (FR racine, EN /en).
    window.didomiConfig = {
      languages: { enabled: ['fr', 'en'], default: locale },
    };
    const s = document.createElement('script');
    s.id = 'didomi-loader';
    s.async = true;
    s.src = `https://sdk.privacy-center.org/${encodeURIComponent(API_KEY)}/loader.js${
      NOTICE_ID ? `?target_type=notice&target=${encodeURIComponent(NOTICE_ID)}` : ''
    }`;
    document.head.appendChild(s);
  }, [locale]);

  return null;
}
