'use client';

import { useEffect, useRef, useState } from 'react';
import { imgProps } from '@/lib/image';

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
  // Une image en erreur AVANT l'hydratation n'a pas déclenché onError
  // (React n'était pas encore branché) : on vérifie au montage.
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0 && src !== GENERIC) setSrc(GENERIC);
  }, [src]);

  return (
    <img
      ref={ref}
      loading="lazy"
      decoding="async"
      {...imgProps(src, '(max-width: 768px) 100vw, 33vw')}
      alt={`Data center ${title}`}
      onError={() => { if (src !== GENERIC) setSrc(GENERIC); }}
    />
  );
}

