import { getAllPosts, getCategories } from '@/lib/wordpress';
import { ArticleSearch } from '@/components/ArticleSearch';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Actualités — Nation Data Center',
  description:
    'Retrouvez toutes les actualités de Nation Data Center : nouveaux sites, innovations, engagements RSE et événements.',
};

export const dynamic = 'force-dynamic';

export default async function ActualitesPage() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getCategories(),
  ]);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="actu-hero">
        <div className="container">
          <span className="eyebrow">Blog & actualités</span>
          <h1 className="fil-rouge">Actualités NDC</h1>
          <p>
            Suivez les dernières avancées de Nation Data Center : ouvertures de
            sites, innovations technologiques, engagements RSE et événements.
          </p>
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
