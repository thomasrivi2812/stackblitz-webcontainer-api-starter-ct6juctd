'use client';

import { useState } from 'react';
import { RedMotif } from './RedMotif';

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
          src={src}
          alt="Data center Nation Data Center"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
