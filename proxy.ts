import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { EN_ENABLED, routing } from './i18n/routing';

// Proxy (ex-« middleware », renommé par Next 16). Détecte la locale (préfixe
// d'URL, sinon Accept-Language / cookie) et réécrit vers le segment [locale] interne. FR reste à la racine, EN passe par /en.
const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Version anglaise masquée (voir EN_ENABLED) : /en/… → page française.
  // Redirection temporaire (307) pour que Google ne l'enregistre pas comme
  // définitive. Adresse reconstruite depuis les en-têtes du proxy (Apache /
  // nginx) : le serveur Node, lui, n'écoute qu'en http sur localhost.
  if (!EN_ENABLED) {
    const { pathname, search } = request.nextUrl;
    if (pathname === '/en' || pathname.startsWith('/en/')) {
      let fr = pathname.slice(3) || '/';
      // Fiches à slug traduit (Polylang) : le slug anglais n'existe pas en
      // français → on renvoie vers la liste de la rubrique.
      const fiche = fr.match(/^\/(datacenters|actualites)\/[^/]+\/?$/);
      if (fiche) fr = `/${fiche[1]}`;
      const h = request.headers;
      const proto = (h.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')).split(',')[0].trim();
      const host = (h.get('x-forwarded-host') || h.get('host') || request.nextUrl.host).split(',')[0].trim();
      return NextResponse.redirect(`${proto}://${host}${fr}${search}`, 307);
    }
  }
  return intl(request);
}

export const config = {
  // On exclut l'API, les fichiers Next internes, et tout ce qui a une extension
  // (assets statiques : images, favicon, robots.txt, sitemap.xml…).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
