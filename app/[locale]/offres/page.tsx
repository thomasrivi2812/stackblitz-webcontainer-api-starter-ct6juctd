import { Suspense } from 'react';
import { loadMessages } from '@/lib/messages';
import { OffresPersonas } from '@/components/OffresPersonas';
import { getPersonas, type WpLocale } from '@/lib/wordpress';
import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) → rendu
// dynamique, gere dans le layout (Next 16 exige ici une valeur litterale).
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: WpLocale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = (await loadMessages(locale)).meta as Record<string, string>;
  return {
    title: m.offresTitle,
    description: m.offresDesc,
    alternates: alternatesFor(locale, '/offres'),
  };
}


export default async function OffresPage({ params }: { params: Promise<{ locale: WpLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const personas = await getPersonas(locale);
  return (
    <main>
      <Suspense fallback={null}>
        <OffresPersonas personas={personas} />
      </Suspense>
    </main>
  );
}
