import { getDatacenters, type WpLocale } from '@/lib/wordpress';
import { Logo } from './Logo';
import { AltareaLogo } from './AltareaLogo';
import { CookiePreferencesLink } from './CookiePreferencesLink';

// Préfixe les liens internes selon la langue (FR à la racine, EN sous /en).
// On évite ici les helpers de next-intl côté serveur (Link / getLocale), qui
// dépendent du « contexte de requête » mal propagé sous WebContainer/StackBlitz.
function lhref(locale: WpLocale, path: string): string {
  if (locale !== 'en') return path;
  return path === '/' ? '/en' : `/en${path}`;
}

export async function SiteFooter({ locale, logoUrl = null }: { locale: WpLocale; logoUrl?: string | null }) {
  // Dictionnaire chargé par import direct (aucune API à portée de requête).
  const t = (await import(`../messages/${locale}.json`)).default.footer as Record<string, string>;
  const datacenters = await getDatacenters(locale);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Marque + endossement */}
          <div className="footer-brand">
            <Logo white src={logoUrl} />
            <p>{t.tagline}</p>
            <div className="footer-altarea">
              <span className="footer-altarea-label">{t.altarea}</span>
              <AltareaLogo height={42} className="footer-altarea-logo" />
            </div>
          </div>

          {/* Data centers */}
          <div className="footer-col">
            <h4>{t.datacentersTitle}</h4>
            <ul>
              {datacenters.map((dc) => (
                <li key={dc.slug}>
                  <a href={lhref(locale, `/datacenters/${dc.slug}`)}>
                    NDC {dc.title}
                    {dc.datacenterFields.ville ? ` — ${dc.datacenterFields.ville}` : ''}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="footer-col">
            <h4>{t.siteTitle}</h4>
            <ul>
              <li><a href={lhref(locale, '/datacenters')}>{t.reseau}</a></li>
              <li><a href={lhref(locale, '/offres')}>{t.offres}</a></li>
              <li><a href={lhref(locale, '/#services')}>{t.services}</a></li>
              <li><a href={lhref(locale, '/#engagements')}>{t.engagements}</a></li>
              <li><a href={lhref(locale, '/documentation')}>{t.documentation}</a></li>
              <li><a href={lhref(locale, '/#actualites')}>{t.actualites}</a></li>
              <li><a href={lhref(locale, '/contact')}>{t.contact}</a></li>
            </ul>
            <a
              className="footer-portal"
              href={process.env.NEXT_PUBLIC_PORTAL_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.portailAria}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>{t.portail}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>

          {/* Légal */}
          <div className="footer-col">
            <h4>{t.infosTitle}</h4>
            <ul>
              {/* Slugs identiques à l'ancien site (pages WP « Pages ») */}
              <li><a href={lhref(locale, '/mentions-legales')}>{t.mentions}</a></li>
              <li><a href={lhref(locale, '/politique-de-protection-des-donnees-personnelles')}>{t.confidentialite}</a></li>
              <li><a href={lhref(locale, '/politique-de-cookies')}>{t.cookies}</a></li>
              {/* Rouvre la modale Didomi (rendu seulement si la CMP est configurée) */}
              <CookiePreferencesLink label={t.cookiesPrefs} />
            </ul>
            <div className="footer-social">
              <a href="#" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.98h4v12H3zM9 8.98h3.8v1.64h.05a4.17 4.17 0 013.75-2.06c4 0 4.75 2.64 4.75 6.07v6.35h-4v-5.63c0-1.34 0-3.07-1.87-3.07s-2.16 1.46-2.16 2.97v5.73H9z"/></svg></a>
              <a href="#" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.8-.48-5.6a2.9 2.9 0 00-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 00-2 2C1 8.2 1 12 1 12s0 3.8.48 5.6a2.9 2.9 0 002 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 002-2C23 15.8 23 12 23 12zm-13.2 3.5v-7l6 3.5z"/></svg></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          {t.copyright.replace('{year}', String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}
