'use client';

import { useState } from 'react';

// Photo du data center.
// Priorité : image mise en avant WordPress (modifiable depuis l'admin WP) →
// sinon image locale public/dc-{slug}.jpg si déposée manuellement →
// sinon repli générique public/hero-datacenter.jpg, sans jamais afficher
// d'image cassée.
const GENERIC = '/hero-datacenter.jpg';

export function DcPhoto({
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

