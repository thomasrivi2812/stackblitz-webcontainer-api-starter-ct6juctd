const createNextIntlPlugin = require('next-intl/plugin');

// Pointe le plugin sur notre config de requête (chargement des dictionnaires d'interface).
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Hôte WordPress déduit de l'endpoint GraphQL (mêmes médias). Sert à la fois à
// restreindre l'optimiseur d'images next/image ET la directive img-src de la CSP.
// Repli sur l'hôte de test si la variable n'est pas encore renseignée.
function wpHost() {
  try {
    return new URL(
      process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://ndc-site-test.instawp.site/graphql',
    ).hostname;
  } catch {
    return 'ndc-site-test.instawp.site';
  }
}
const WP_HOST = wpHost();

// Tuiles de la carte (Leaflet / OpenStreetMap) chargées en <img> côté client.
const TILE_HOSTS = 'https://*.tile.openstreetmap.org';

// En-têtes de sécurité appliqués à toutes les routes.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-inline' requis par le runtime Next.js (App Router) et les
      // <style>/styles inline des composants ; 'unsafe-eval' seulement en dev.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https://${WP_HOST} ${TILE_HOSTS}`,
      "font-src 'self' data:",
      `connect-src 'self' https://${WP_HOST}`,
      // Intégrations vidéo autorisées (YouTube/Vimeo) ; le reste est bloqué.
      "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimiseur d'images restreint au domaine WordPress (plus de wildcard '**' :
  // empêche l'abus de /_next/image comme proxy d'images ouvert).
  images: {
    remotePatterns: [{ protocol: 'https', hostname: WP_HOST }],
  },
  poweredByHeader: false, // masque l'en-tête X-Powered-By: Next.js
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = withNextIntl(nextConfig);
