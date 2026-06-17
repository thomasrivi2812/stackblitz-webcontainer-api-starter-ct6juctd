'use client';

import { useState } from 'react';

// Photo du data center.
// Par défaut on affiche l'image générique d'infrastructure (public/hero-datacenter.jpg),
// qui existe toujours. Si un jour tu déposes une photo spécifique par site
// (public/dc-{slug}.jpg), elle sera utilisée en priorité ; sinon repli propre,
// sans jamais afficher d'image cassée.
const GENERIC = '/hero-datacenter.jpg';

export function DcPhoto({ slug, title }: { slug: string; title: string }) {
  const [src, setSrc] = useState(`/dc-${slug}.jpg`);

  return (
    <div className="dc-photo">
      <img
        src={src}
        alt={`Data center ${title}`}
        onError={() => {
          if (src !== GENERIC) setSrc(GENERIC);
        }}
      />
    </div>
  );
}
