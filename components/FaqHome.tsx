'use client';

import { useState } from 'react';
import type { Faq } from '@/lib/wordpress';

// Section FAQ de l'accueil — accordéon, une seule réponse ouverte à la fois.
// Le contenu vient de WordPress (CPT « faq »), avec repli sur les données d'exemple.

export function FaqHome({ items = [] }: { items?: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section className="section section-alt" id="faq">
      <div className="container faq-home-inner">
        <div className="section-head">
          <span className="eyebrow">Questions fréquentes</span>
          <h2 className="fil-rouge">Tout savoir sur l’hébergement chez NDC</h2>
        </div>

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
      </div>
    </section>
  );
}
