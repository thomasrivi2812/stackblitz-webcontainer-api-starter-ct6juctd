'use client';

import { useEffect } from 'react';

// CMP Didomi (bannière cookies + registre des consentements).
// Ne charge RIEN tant que la clé API publique n'est pas configurée :
//   NEXT_PUBLIC_DIDOMI_API_KEY   (Didomi Console → paramètres du SDK)
//   NEXT_PUBLIC_DIDOMI_NOTICE_ID (optionnel : id de la notice si plusieurs)
// La bannière, la modale de préférences et le registre de preuves sont
// entièrement gérés par Didomi ; le bouton « Gérer mes cookies » du footer
// rouvre la modale (window.Didomi.preferences.show()).
const API_KEY = process.env.NEXT_PUBLIC_DIDOMI_API_KEY;
const NOTICE_ID = process.env.NEXT_PUBLIC_DIDOMI_NOTICE_ID;

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
