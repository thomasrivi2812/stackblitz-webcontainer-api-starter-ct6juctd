const createNextIntlPlugin = require('next-intl/plugin');

// Pointe le plugin sur notre config de requête (chargement des dictionnaires d'interface).
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autorise l'affichage des images servies par WordPress (médias) une fois l'API branchée.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = withNextIntl(nextConfig);
