import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { DidomiConsent } from '@/components/DidomiConsent';
import { getPersonas, getDatacenters, getServices, getSiteBranding } from '@/lib/wordpress';
import { SITE_URL } from '@/lib/seo';
import { routing, type Locale } from '@/i18n/routing';
import '../globals.css';

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
});

// Metadata dépendant de la locale (og:locale correct sur /en). Les mots-clés
// meta ont été retirés : ignorés par tous les moteurs depuis des années.
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEn = locale === 'en';
  return {
    metadataBase: new URL('https://www.nationdc.fr'),
    title: {
      default: 'Nation Data Center — Hébergement souverain & responsable',
      template: '%s | Nation Data Center',
    },
    description:
      'Un réseau de data centers français, souverains et écoresponsables, au service des enjeux critiques des entreprises.',
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_GB' : 'fr_FR',
      alternateLocale: isEn ? 'fr_FR' : 'en_GB',
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
}

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
  const [personas, datacenters, services, branding] = await Promise.all([
    getPersonas(locale as Locale),
    getDatacenters(locale as Locale),
    // Liste des services pour le menu déroulant « Nos services » (ancres).
    getServices(locale as Locale),
    // Logo du site (header + footer), éditable dans WP. Repli sur la marque
    // N|D|C dessinée si aucun logo n'est défini.
    getSiteBranding(),
  ]);

  return (
    <html lang={locale} className={jost.variable}>
      <body>
        {/* CMP Didomi (bannière cookies) — inactive tant que la clé API
            NEXT_PUBLIC_DIDOMI_API_KEY n'est pas configurée. */}
        <DidomiConsent locale={locale} />
        {/* Données structurées Organization (rich results / knowledge panel). */}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Nation Data Center',
            url: SITE_URL,
            logo: `${SITE_URL}/favicon.svg`,
            description:
              'Réseau de data centers français, souverains et écoresponsables.',
            parentOrganization: { '@type': 'Organization', name: 'Altarea' },
            // sameAs (LinkedIn…) : à ajouter quand les URLs officielles seront actives.
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteHeader
            personas={personas}
            datacenters={datacenters}
            services={services}
            logoUrl={branding.logo}
            equipeImageUrl={branding.equipeImage}
            offresImageUrl={branding.offresImage}
          />

          {children}

          <SiteFooter locale={locale as Locale} logoUrl={branding.logoWhite || branding.logo} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
