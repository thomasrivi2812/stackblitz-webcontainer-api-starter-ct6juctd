import { Suspense } from 'react';
import { OffresPersonas } from '@/components/OffresPersonas';
import { getPersonas, type WpLocale } from '@/lib/wordpress';
import type { Metadata } from 'next';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

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
