'use client';

// Page 404 du segment [locale], déclenchée par notFound() (slug WP inconnu,
// article/datacenter supprimé…) ou une URL inexistante. La langue est déduite
// du chemin via usePathname() (cohérent serveur ↔ client, pas de lecture de
// window pendant le rendu → aucun décalage d'hydratation sur /en).
import { usePathname } from 'next/navigation';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';

export default function NotFound() {
  const pathname = usePathname() || '/';
  const isEn = pathname.split('/')[1] === 'en';
  const t = (isEn ? en : fr).states;
  const home = isEn ? '/en' : '/';

  return (
    <main className="route-state">
      <div className="container route-state-inner">
        <span className="route-state-code" aria-hidden="true">404</span>
        <h1 className="route-state-title">{t.notFoundTitle}</h1>
        <p className="route-state-text">{t.notFoundText}</p>
        <div className="route-state-actions">
          <a className="btn btn-primary" href={home}>{t.notFoundHome}</a>
        </div>
      </div>
    </main>
  );
}
