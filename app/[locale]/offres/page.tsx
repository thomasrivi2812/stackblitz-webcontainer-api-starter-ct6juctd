import { Suspense } from 'react';
import { OffresPersonas } from '@/components/OffresPersonas';
import { getPersonas, type WpLocale } from '@/lib/wordpress';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.offresTitle,
    description: m.offresDesc,
    alternates: { canonical: '/offres', languages: { fr: '/offres', en: '/en/offres' } },
  };
}

export default async function OffresPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const personas = await getPersonas(locale);
  return (
    <main>
      <Suspense fallback={null}>
        <OffresPersonas personas={personas} />
      </Suspense>
    </main>
  );
}
