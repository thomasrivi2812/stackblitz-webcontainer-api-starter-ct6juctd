import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getPersonas, getDatacenters, getHeaderNav } from '@/lib/wordpress';
import { routing, type Locale } from '@/i18n/routing';
import '../globals.css';

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

// Pré-génère les deux variantes de langue à la compilation (/ et /en).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Locale inconnue → 404 (évite de servir un dictionnaire inexistant).
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Dictionnaire d'interface chargé par import direct (pas de getMessages /
  // setRequestLocale, qui dépendent du contexte de requête mal propagé sous
  // WebContainer/StackBlitz). On passe locale + messages explicitement au
  // provider : les composants client (header, sélecteur) les lisent du contexte.
  const messages = (await import(`../../messages/${locale}.json`)).default;

  // Récupéré côté serveur pour alimenter les menus déroulants du header.
  // Les deux fonctions retombent sur les données d'exemple si WP est absent,
  // et sur le contenu FR si la traduction EN n'existe pas encore (fallback).
  const [personas, datacenters, headerNav] = await Promise.all([
    getPersonas(locale as Locale),
    getDatacenters(locale as Locale),
    // Menu « header » éditable dans WP (Apparence → Menus) : choix des pages
    // et de leur ordre. null = pas de menu configuré → nav par défaut du site.
    getHeaderNav(locale as Locale),
  ]);

  return (
    <html lang={locale} className={jost.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteHeader personas={personas} datacenters={datacenters} nav={headerNav} />

          {children}

          <SiteFooter locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
