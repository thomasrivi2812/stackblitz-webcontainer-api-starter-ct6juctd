import type { Metadata } from 'next';
import { Jost } from 'next/font/google';

import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
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
    'data center écoresponsable', 'hébergement données France', 'Tier III', 'NDC',
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jost.variable}>
      <body>
        <SiteHeader />

        {children}

        <SiteFooter />
      </body>
    </html>
  );
}
