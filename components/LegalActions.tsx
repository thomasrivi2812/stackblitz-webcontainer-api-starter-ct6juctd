'use client';

import { useEffect } from 'react';
import { optOutAnalytics } from '@/lib/analytics';
import { showDidomiPreferences } from '@/lib/didomi';

// Liens d'action insérables dans le contenu WordPress des pages légales :
//   <a href="#gerer-mes-cookies">…</a>           → préférences Didomi
//   <a href="#opposition-mesure-audience">…</a>  → opposition à Piano
// Les rédacteurs les posent comme de simples liens dans l'éditeur WP.
export function LegalActions({ locale }: { locale: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]');
      const href = a?.getAttribute('href');
      if (!a || !href) return;
      if (href === '#gerer-mes-cookies') {
        e.preventDefault();
        showDidomiPreferences();
      } else if (href === '#opposition-mesure-audience') {
        e.preventDefault();
        optOutAnalytics();
        a.textContent = locale === 'en'
          ? 'Your opt-out has been recorded on this browser.'
          : 'Votre opposition est enregistrée sur ce navigateur.';
        a.setAttribute('aria-live', 'polite');
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [locale]);
  return null;
}
