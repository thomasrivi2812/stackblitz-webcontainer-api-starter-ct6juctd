import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Détecte la locale (préfixe d'URL, sinon Accept-Language / cookie) et réécrit
// vers le segment [locale] interne. FR reste à la racine, EN passe par /en.
export default createMiddleware(routing);

export const config = {
  // On exclut l'API, les fichiers Next internes, et tout ce qui a une extension
  // (assets statiques : images, favicon, robots.txt, sitemap.xml…).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
