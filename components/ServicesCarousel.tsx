'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceMedia } from './ServiceMedia';
import type { Service } from '@/lib/wordpress';

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'prev' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

export function ServicesCarousel({ services }: { services: Service[] }) {
  const n = services.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((idx: number) => setI(((idx % n) + n) % n), [n]);
  const next = useCallback(() => setI((p) => (p + 1) % n), [n]);

  // Défilement automatique (6,5 s), en pause au survol.
  useEffect(() => {
    if (n <= 1 || paused) return;
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, [n, paused, next]);

  if (n === 0) return null;
  const s = services[i];

  return (
    <div
      className="svc-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* key={i} → remontage à chaque changement = fondu d'entrée (CSS) */}
      <article className="svc-slide" key={i}>
        <div className="svc-slide-media">
          <ServiceMedia service={s} />
        </div>
        <div className="svc-slide-text">
          <span className="eyebrow"><span className="eyebrow-dot" />{s.accroche || 'Nos services'}</span>
          <h3>{s.titre}</h3>
          <p>{s.description}</p>
          <a className="btn-v2 btn-v2-ghost" href={s.lienUrl || '/services'}>
            {s.lienLabel || 'En savoir plus'}
          </a>
        </div>
      </article>

      {n > 1 && (
        <div className="svc-carousel-controls">
          <button className="svc-arrow" type="button" onClick={() => go(i - 1)} aria-label="Service précédent">
            <Arrow dir="prev" />
          </button>
          <div className="svc-dots" role="tablist" aria-label="Sélecteur de service">
            {services.map((sv, idx) => (
              <button
                key={sv.slug || idx}
                type="button"
                className={`svc-dot${idx === i ? ' active' : ''}`}
                onClick={() => go(idx)}
                aria-label={sv.titre}
                aria-selected={idx === i}
                role="tab"
              />
            ))}
          </div>
          <button className="svc-arrow" type="button" onClick={next} aria-label="Service suivant">
            <Arrow dir="next" />
          </button>
        </div>
      )}
    </div>
  );
}
