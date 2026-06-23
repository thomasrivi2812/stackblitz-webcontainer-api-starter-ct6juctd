import type { Metadata } from 'next';
import { Jost } from 'next/font/google';

import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getPersonas, getDatacenters } from '@/lib/wordpress';
import './globals.css';

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nationdc.fr'),
  title: {
    default: 'Nation Data Center — Hébergement souverain & responsable',
    template: '%s | Nation Data Center',
  },
  description:
    'Un réseau de data centers français, souverains et écoresponsables, au service des enjeux critiques des entreprises.',
  keywords: [
    'data center France', 'hébergement souverain', 'colocation datacenter',
    'data center écoresponsable', 'hébergement données France', 'Tier 3', 'NDC',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Nation Data Center',
    title: 'Nation Data Center — Hébergement souverain & responsable',
    description:
      'Un réseau de data centers français, souverains et écoresponsables, au service des enjeux critiques des entreprises.',
    images: [{ url: '/hero-datacenter.jpg', width: 1200, height: 630, alt: 'Nation Data Center' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nation Data Center — Hébergement souverain & responsable',
    description: 'Un réseau de data centers français, souverains et écoresponsables.',
    images: ['/hero-datacenter.jpg'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Récupéré côté serveur pour alimenter les menus déroulants du header.
  // Les deux fonctions retombent sur les données d'exemple si WP est absent.
  const [personas, datacenters] = await Promise.all([getPersonas(), getDatacenters()]);

  return (
    <html lang="fr" className={jost.variable}>
      <body>
        <SiteHeader personas={personas} datacenters={datacenters} />

        {children}

        <SiteFooter />
      </body>
    </html>
  );
}
