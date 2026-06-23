import { notFound } from 'next/navigation';
import {
  getPostBySlug,
  getAllPosts,
  formatDateFr,
  stripHtml,
} from '@/lib/wordpress';
import { ArticleDownloadButton } from '@/components/ArticleDownloadButton';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

/* Metadata dynamique */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Article introuvable — NDC' };
  return {
    title: `${post.title} — Nation Data Center`,
    description: stripHtml(post.excerpt).slice(0, 160),
  };
}

/* Pré-génération des slugs connus (ISR) */
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

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
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  /* Articles récents pour la sidebar « À lire aussi » */
  const allPosts = await getAllPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main>
      {/* ── Hero article ── */}
      <section className="article-hero">
        <div className="container">
          <a className="back-link" href="/actualites">
            <Icon name="arrow-left" />
            Retour aux actualités
          </a>

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
              {formatDateFr(post.date)}
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
              dangerouslySetInnerHTML={{ __html: post.content }}
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
                      Document à télécharger
                    </span>
                    <strong>{post.document.titre || 'Document associé'}</strong>
                  </div>
                  <ArticleDownloadButton
                    url={post.document.url}
                    title={post.document.titre || 'Document associé'}
                  />
                </div>
              )}

              {/* ── Tags ── */}
              {post.tags.nodes.length > 0 && (
                <div className="article-sidebar-block">
                  <h4>Tags</h4>
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
                  <h4>À lire aussi</h4>
                  <div className="article-related">
                    {related.map((r) => (
                      <a
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
                            {formatDateFr(r.date)}
                          </span>
                          <h5>{r.title}</h5>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CTA Contact ── */}
              <div className="article-sidebar-cta">
                <h4>Un projet d'hébergement ?</h4>
                <p>
                  Nos équipes sont à votre écoute pour étudier votre besoin.
                </p>
                <a className="btn btn-primary" href="/contact">
                  Nous contacter
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}