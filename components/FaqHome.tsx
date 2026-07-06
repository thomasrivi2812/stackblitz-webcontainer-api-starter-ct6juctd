'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Faq } from '@/lib/wordpress';

// Section FAQ de l'accueil — accordéon, une seule réponse ouverte à la fois.
// Le contenu vient de WordPress (CPT « faq »), avec repli sur les données d'exemple.
// Si une image est définie dans WP (accueil → onglet FAQ), la section passe en
// deux colonnes : accordéon à gauche, image collante à droite. Sinon, mise en
// page centrée d'origine.

type FaqImage = { sourceUrl: string; altText: string } | null;

export function FaqHome({
  items = [],
  eyebrow,
  title,
  images = [],
}: { items?: Faq[]; eyebrow?: string; title?: string; images?: FaqImage[] }) {
  const t = useTranslations('faq');
  const [open, setOpen] = useState<number | null>(0);

  if (!items.length) return null;

  const head = (
    <div className="section-head">
      <span className="eyebrow">{eyebrow || t('eyebrow')}</span>
      <h2 className="fil-rouge">{title || t('title')}</h2>
    </div>
  );

  const list = (
    <div className="faq-home-list">
      {items.map((item, i) => (
        <div className={`faq-home-row${open === i ? ' open' : ''}`} key={i}>
          <button
            type="button"
            className="faq-home-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.question}
            <svg className="faq-home-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {open === i && <div className="faq-home-a">{item.reponse}</div>}
        </div>
      ))}
    </div>
  );

  const visuals = images.filter((im): im is NonNullable<FaqImage> => !!im?.sourceUrl);

  if (visuals.length > 0) {
    return (
      <section className="section section-alt" id="faq">
        <div className="container faq-layout">
          <div>
            {head}
            {list}
          </div>
          <div className="faq-media">
            {visuals.map((im, i) => (
              <img key={i} src={im.sourceUrl} alt={im.altText || ''} loading="lazy" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-alt" id="faq">
      <div className="container faq-home-inner">
        {head}
        {list}
      </div>
    </section>
  );
}
