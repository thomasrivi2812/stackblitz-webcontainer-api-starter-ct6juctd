'use client';

import { useState } from 'react';
import { RedMotif } from './RedMotif';
import { imgProps } from '@/lib/image';

// Affiche la photo du data center si elle existe (public/hero-datacenter.jpg),
// sinon bascule automatiquement sur le motif graphique NDC.
export function HeroVisual({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="hero-visual">
      {failed ? (
        <div className="hero-motif-fallback">
          <RedMotif />
        </div>
      ) : (
        <img
          className="hero-img"
          fetchPriority="high"
          decoding="async"
          {...imgProps(src, '(max-width: 768px) 100vw, 50vw')}
          alt="Data center Nation Data Center"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
