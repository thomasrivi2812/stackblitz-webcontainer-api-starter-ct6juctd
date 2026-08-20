'use client';

import { useState } from 'react';

// Image d'une tuile data center.
// Priorité : image mise en avant WordPress (imageUrl) → sinon image locale
// public/dc-{slug}.jpg si déposée manuellement → sinon repli générique
// public/hero-datacenter.jpg.
// Composant client minimal pour éviter de passer toute la home en client.

const GENERIC = '/hero-datacenter.jpg';

export function DcTileImage({
  slug,
  title,
  imageUrl,
}: {
  slug: string;
  title: string;
  imageUrl?: string | null;
}) {
  const [src, setSrc] = useState(imageUrl || `/dc-${slug}.jpg`);

  return (
    <img
      src={src}
      alt={`Data center ${title}`}
      onError={() => { if (src !== GENERIC) setSrc(GENERIC); }}
    />
  );
}

