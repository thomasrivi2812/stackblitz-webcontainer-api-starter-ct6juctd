'use client';

import { useState } from 'react';

// Image d'une tuile data center avec repli automatique sur public/hero-datacenter.jpg
// si l'image spécifique au site (dc-{slug}.jpg) n'existe pas.
// Composant client minimal pour éviter de passer toute la home en client.

const GENERIC = '/hero-datacenter.jpg';

export function DcTileImage({ slug, title }: { slug: string; title: string }) {
  const [src, setSrc] = useState(`/dc-${slug}.jpg`);

  return (
    <img
      src={src}
      alt={`Data center ${title}`}
      onError={() => { if (src !== GENERIC) setSrc(GENERIC); }}
    />
  );
}
