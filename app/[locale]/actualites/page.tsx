import { getAllPosts, getCategories, type WpLocale } from '@/lib/wordpress';
import { ArticleSearch } from '@/components/ArticleSearch';
import type { Metadata } from 'next';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
export const revalidate = 300;

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.actualitesTitle,
    description: m.actualitesDesc,
    alternates: { canonical: '/actualites', languages: { fr: '/actualites', en: '/en/actualites' } },
  };
}


export default async function ActualitesPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.actualites as Record<string, string>;
  const [posts, categories] = await Promise.all([
    getAllPosts(locale),
    getCategories(locale),
  ]);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="actu-hero">
        <div className="container">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="fil-rouge">{t.h1}</h1>
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
