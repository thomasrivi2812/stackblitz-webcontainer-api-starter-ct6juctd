import { notFound, redirect } from 'next/navigation';
import {
  getPostBySlug,
  getAllPosts,
  stripHtml,
  type WpLocale,
} from '@/lib/wordpress';
import { ArticleDownloadButton } from '@/components/ArticleDownloadButton';
import { sanitizeWpHtml } from '@/lib/sanitize';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';

interface Props {
  params: { locale: WpLocale; slug: string };
}

const fmtDate = (iso: string, locale: WpLocale) => {
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch { return ''; }
};

/* Metadata dynamique */
// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug, params.locale);
  const t = (await import(`../../../../messages/${params.locale}.json`)).default.actualites as Record<string, string>;
  if (!post) return { title: t.notFound };
  return {
    title: `${post.title} — Nation Data Center`,
    description: stripHtml(post.excerpt).slice(0, 160),
    alternates: {
      canonical: `/actualites/${params.slug}`,
      languages: { fr: `/actualites/${params.slug}`, en: `/en/actualites/${params.slug}` },
    },
  };
}

// Contenu éditable dans WP + résolution/redirection de traduction Polylang
// (slug différent par langue) : rendu à la demande, jamais figé au build.

/* ------------------------------- Icônes ------------------------------- */
function Icon({ name }: { name: string }) {
  const c = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'arrow-left':
      return (
        <svg {...c}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...c}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case 'user':
      return (
        <svg {...c}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'building':
      return (
        <svg {...c}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
        </svg>
      );
    case 'file':
      return (
        <svg {...c}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const t = (await import(`../../../../messages/${params.locale}.json`)).default.actualites as Record<string, string>;
  const post = await getPostBySlug(params.slug, params.locale);
  if (!post) notFound();

  // Slug résolu ≠ slug demandé : l'URL portait le slug d'une autre langue
  // (switch FR/EN sur un article — chaque traduction Polylang a son slug).
  // On redirige vers l'URL canonique de la traduction.
  if (post.slug && post.slug !== params.slug) {
    redirect(params.locale === 'fr' ? `/actualites/${post.slug}` : `/${params.locale}/actualites/${post.slug}`);
  }

  /* Articles récents pour la sidebar « À lire aussi » */
  const allPosts = await getAllPosts(params.locale);
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main>
      {/* ── Hero article ── */}
      <section className="article-hero">
        <div className="container">
          <Link className="back-link" href="/actualites">
            <Icon name="arrow-left" />
            {t.back}
          </Link>

          <div className="article-hero-meta">
            {post.categories.nodes.map((cat) => (
              <span className="article-cat-badge" key={cat.slug}>
                {cat.name}
              </span>
            ))}
          </div>

          <h1 className="fil-rouge">{post.title}</h1>

          <div className="article-info">
            <span className="article-info-item">
              <Icon name="calendar" />
              {fmtDate(post.date, params.locale)}
            </span>
            {post.author?.node?.name && (
              <span className="article-info-item">
                <Icon name="user" />
                {post.author.node.name}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Image à la une ── */}
      {post.featuredImage?.node?.sourceUrl && (
        <section className="article-featured">
          <div className="container">
            <div className="article-featured-wrap">
              <img
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText || post.title}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Corps de l'article ── */}
      <section className="section">
        <div className="container">
          <div className="article-layout">
            {/* Contenu principal */}
            <article
              className="article-content"
              dangerouslySetInnerHTML={{ __html: sanitizeWpHtml(post.content) }}
            />

            {/* Sidebar */}
            <aside className="article-sidebar">
              {/* ── Document à télécharger (modal email) ── */}
              {post.document?.url && (
                <div className="article-download-card">
                  <div className="article-download-icon">
                    <Icon name="file" />
                  </div>
                  <div className="article-download-info">
                    <span className="article-download-label">
                      {t.downloadLabel}
                    </span>
                    <strong>{post.document.titre || t.docFallback}</strong>
                  </div>
                  <ArticleDownloadButton
                    url={post.document.url}
                    title={post.document.titre || t.docFallback}
                  />
                </div>
              )}

              {/* ── Tags ── */}
              {post.tags.nodes.length > 0 && (
                <div className="article-sidebar-block">
                  <h4>{t.tags}</h4>
                  <div className="article-tags">
                    {post.tags.nodes.map((tag) => (
                      <span className="article-tag" key={tag.slug}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Articles liés ── */}
              {related.length > 0 && (
                <div className="article-sidebar-block">
                  <h4>{t.alsoRead}</h4>
                  <div className="article-related">
                    {related.map((r) => (
                      <Link
                        className="article-related-card"
                        key={r.slug}
                        href={`/actualites/${r.slug}`}
                      >
                        <div className="article-related-media">
                          {r.featuredImage?.node?.sourceUrl ? (
                            <img
                              src={r.featuredImage.node.sourceUrl}
                              alt={r.featuredImage.node.altText || r.title}
                            />
                          ) : (
                            <span className="actu-card-ph">
                              <Icon name="building" />
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="article-related-date">
                            {fmtDate(r.date, params.locale)}
                          </span>
                          <h5>{r.title}</h5>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CTA Contact ── */}
              <div className="article-sidebar-cta">
                <h4>{t.ctaTitle}</h4>
                <p>{t.ctaText}</p>
                <Link className="btn btn-primary" href="/contact">
                  {t.ctaButton}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}