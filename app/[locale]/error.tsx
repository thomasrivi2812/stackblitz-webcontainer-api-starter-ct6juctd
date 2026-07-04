'use client';

// Frontière d'erreur du segment [locale] : capte les exceptions de rendu
// (ex. WP/GraphQL injoignable) et propose de réessayer sans recharger toute
// l'app. Composant client obligatoire (contrat Next.js). La langue est
// déduite de l'URL car les frontières error/not-found ne reçoivent pas
// `params`.
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Trace côté client pour le diagnostic (visible dans la console navigateur).
    console.error(error);
  }, [error]);

  const pathname = usePathname() || '/';
  const isEn = pathname.split('/')[1] === 'en';
  const t = (isEn ? en : fr).states;
  const home = isEn ? '/en' : '/';

  return (
    <main className="route-state">
      <div className="container route-state-inner">
        <div className="route-state-icon" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="route-state-title">{t.errorTitle}</h1>
        <p className="route-state-text">{t.errorText}</p>
        <div className="route-state-actions">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            {t.errorRetry}
          </button>
          <a className="btn btn-ghost" href={home}>{t.errorHome}</a>
        </div>
      </div>
    </main>
  );
}
