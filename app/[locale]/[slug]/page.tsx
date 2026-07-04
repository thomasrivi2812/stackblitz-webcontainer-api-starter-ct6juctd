import { notFound } from 'next/navigation';
import { getPage, type WpLocale } from '@/lib/wordpress';
import { sanitizeWpHtml } from '@/lib/sanitize';
import type { Metadata } from 'next';


// Page « simple » : on lit une Page native de WordPress (Titre + contenu + image
// à la une) et on la rend avec le design NDC, comme un article.
// Routes explicites (datacenters, actualites, contact, offres) prioritaires ;
// slugs inconnus → 404.

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params }: { params: { locale: WpLocale; slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug, params.locale);
  if (!page) return {};
  return {
    title: `${page.title} — Nation Data Center`,
    alternates: {
      canonical: `/${params.slug}`,
      languages: { fr: `/${params.slug}`, en: `/en/${params.slug}` },
    },
  };
}

export default async function CustomPage({ params }: { params: { locale: WpLocale; slug: string } }) {
  const page = await getPage(params.slug, params.locale);
  if (!page) notFound();

  return (
    <main>
      <section className="actu-hero">
        <div className="container">
          <h1 className="fil-rouge">{page.title}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container page-section">
          {page.image && (
            <img
              src={page.image.sourceUrl}
              alt={page.image.altText || page.title}
              style={{ width: '100%', height: 'auto', borderRadius: 12, marginBottom: '2rem' }}
            />
          )}
          {page.content && (
            <div
              className="page-richtext"
              dangerouslySetInnerHTML={{ __html: sanitizeWpHtml(page.content) }}
            />
          )}
        </div>
      </section>
    </main>
  );
}
