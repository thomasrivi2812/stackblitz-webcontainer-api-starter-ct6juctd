// Helpers SEO centralisés (canoniques par langue, hreflang, URL du site).
import { getEnEnabled } from '@/lib/site-settings';

export const SITE_URL = 'https://nationdatacenter.fr';
export const SITE_NAME = 'Nation Data Center';

/** Chemin localisé : FR à la racine, EN préfixé /en (localePrefix "as-needed"). */
export function localePath(locale: string, path: string): string {
  if (locale !== 'en') return path;
  return path === '/' ? '/en' : `/en${path}`;
}

/**
 * Bloc `alternates` complet pour une page symétrique (même chemin dans les
 * deux langues) : canonical DANS la langue courante (sinon Next résout le
 * chemin relatif contre metadataBase et déclare la page EN comme duplicata
 * de la FR → désindexation de tout le site anglais), hreflang des deux
 * langues + x-default vers le FR.
 */
export async function alternatesFor(locale: string, path: string) {
  const enEnabled = await getEnEnabled();
  return {
    canonical: localePath(locale, path),
    languages: {
      fr: path,
      // Version anglaise masquée : pas de hreflang vers des pages redirigées.
      ...(enEnabled ? { en: localePath('en', path) } : {}),
      'x-default': path,
    },
  };
}
