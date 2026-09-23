import { getAllPosts, getCategories, type WpLocale } from '@/lib/wordpress';
import { loadMessages } from '@/lib/messages';
import { ArticleSearch } from '@/components/ArticleSearch';
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
    title: m.actualitesTitle,
    description: m.actualitesDesc,
    alternates: alternatesFor(locale, '/actualites'),
  };
}


export default async function ActualitesPage({ params }: { params: Promise<{ locale: WpLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = (await loadMessages(locale)).actualites as Record<string, string>;
  const [posts, categories] = await Promise.all([
    getAllPosts(locale),
    getCategories(locale),
  ]);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="actu-hero">
        <div className="container actu-hero-grid">
          <div>
            <span className="eyebrow">{t.eyebrow}</span>
            <h1 className="fil-rouge">{t.h1}</h1>
          </div>
          <p>{t.intro}</p>
        </div>
      </section>

      {/* ── Contenu ── */}
      <section className="section">
        <div className="container">
          <ArticleSearch posts={posts} categories={categories} />
        </div>
      </section>
    </main>
  );
}
