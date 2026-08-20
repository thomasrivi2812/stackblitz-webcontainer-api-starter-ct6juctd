'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { stripHtml, readingMinutes } from '@/lib/wordpress';
import type { WPPost } from '@/lib/wordpress';

function SearchIcon() {
  return (
    <svg
      width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      width={26} height={26} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </svg>
  );
}

interface Props {
  posts: WPPost[];
  categories: { name: string; slug: string }[];
}

export function ArticleSearch({ posts, categories }: Props) {
  const t = useTranslations('actualites');
  const locale = useLocale();
  const fmtDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch { return ''; }
  };
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      // Filtre par catégorie
      const matchCat =
        activeCat === 'all' ||
        p.categories.nodes.some((c) => c.slug === activeCat);

      // Filtre par recherche (titre + excerpt + catégories + tags)
      const q = query.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        stripHtml(p.excerpt).toLowerCase().includes(q) ||
        p.categories.nodes.some((c) => c.name.toLowerCase().includes(q)) ||
        p.tags.nodes.some((t) => t.name.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [posts, query, activeCat]);

  return (
    <>
      {/* ── Barre de recherche + filtres catégories (même bandeau) ── */}
      <div className="actu-search-bar">
        <div className="actu-search-input-wrap">
          <span className="actu-search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="actu-search-input"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="actu-search-clear"
              onClick={() => setQuery('')}
              aria-label={t('clear')}
            >
              ×
            </button>
          )}
        </div>
        <div className="actu-filters">
          <button
            className={`actu-filter-btn ${activeCat === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCat('all')}
          >
            {t('all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`actu-filter-btn ${activeCat === cat.slug ? 'active' : ''}`}
              onClick={() => setActiveCat(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Compteur résultats ── */}
      <p className="actu-count">
        {filtered.length} {filtered.length !== 1 ? t('articlesMany') : t('articlesOne')}
        {query && (
          <>
            {' '}{t('forQuery')} «&nbsp;<strong>{query}</strong>&nbsp;»
          </>
        )}
      </p>

      {/* ── Grille articles ── */}
      {filtered.length > 0 ? (
        <div className="actu-grid">
          {filtered.map((p) => (
            <Link className="actu-card" key={p.slug} href={`/actualites/${p.slug}`}>
              <div className="actu-card-media">
                {p.featuredImage?.node?.sourceUrl ? (
                  <img
                    src={p.featuredImage.node.sourceUrl}
                    alt={p.featuredImage.node.altText || p.title}
                  />
                ) : (
                  <span className="actu-card-ph">
                    <BuildingIcon />
                  </span>
                )}
                {p.categories.nodes[0] && (
                  <span className="news-pill navy">{p.categories.nodes[0].name}</span>
                )}
              </div>
              <div className="actu-card-body">
                <span className="actu-card-meta">
                  {fmtDate(p.date)} · {readingMinutes(p.content)} {t('minRead')}
                </span>
                <h3>{p.title}</h3>
                <p>{stripHtml(p.excerpt)}</p>
                <span className="actu-card-link">
                  {t('readArticle')}
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="actu-empty">
          <p>{t('empty')}</p>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setQuery('');
              setActiveCat('all');
            }}
          >
            {t('reset')}
          </button>
        </div>
      )}
    </>
  );
}
