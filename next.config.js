/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autorise l'affichage des images servies par WordPress (médias) une fois l'API branchée.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
