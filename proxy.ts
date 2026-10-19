import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { isEnEnabledForProxy } from './lib/site-settings';

// Proxy (ex-« middleware », renommé par Next 16). Détecte la locale (préfixe
// d'URL, sinon Accept-Language / cookie) et réécrit vers le segment [locale] interne. FR reste à la racine, EN passe par /en.
const intl = createMiddleware(routing);

// Domaines acceptés pour les redirections (+ localhost pour les tests sur la machine).
const ALLOWED_HOST = /^((www\.|preprod\.)?nationdatacenter\.fr|localhost(:\d+)?)$/;

export default async function proxy(request: NextRequest) {
  // Version anglaise masquée (case WordPress, voir lib/site-settings.ts) :
  // /en/… → page française.
  // Redirection temporaire (307) pour que Google ne l'enregistre pas comme
  // définitive. Adresse reconstruite depuis les en-têtes du proxy (Apache /
  // nginx) : le serveur Node, lui, n'écoute qu'en http sur localhost.
  const { pathname, search } = request.nextUrl;
  if ((pathname === '/en' || pathname.startsWith('/en/')) && !(await isEnEnabledForProxy())) {
    let fr = pathname.slice(3) || '/';
    // Fiches à slug traduit (Polylang) : le slug anglais n'existe pas en
    // français → on renvoie vers la liste de la rubrique.
    const fiche = fr.match(/^\/(datacenters|actualites)\/[^/]+\/?$/);
    if (fiche) fr = `/${fiche[1]}`;
    const h = request.headers;
    const proto = (h.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')).split(',')[0].trim() === 'http' ? 'http' : 'https';
    // Hôte de destination limité aux domaines du site : ces en-têtes peuvent
    // être forgés par le visiteur (sinon redirection ouverte vers un autre site).
    const candidates = [h.get('x-forwarded-host'), h.get('host'), request.nextUrl.host]
      .flatMap((v) => (v || '').split(','))
      .map((v) => v.trim().toLowerCase());
    const host = candidates.find((v) => ALLOWED_HOST.test(v)) || 'nationdatacenter.fr';
    return NextResponse.redirect(`${proto}://${host}${fr}${search}`, 307);
  }
  return intl(request);
}

export const config = {
  // On exclut l'API, les fichiers Next internes, et tout ce qui a une extension
  // (assets statiques : images, favicon, robots.txt, sitemap.xml…).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
