'use client';

import { useEffect, useRef, useState } from 'react';
import { imgProps } from '@/lib/image';

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
  // Une image en erreur AVANT l'hydratation n'a pas déclenché onError
  // (React n'était pas encore branché) : on vérifie au montage.
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0 && src !== GENERIC) setSrc(GENERIC);
  }, [src]);

  return (
    <div className="dc-photo">
      <img
        ref={ref}
        fetchPriority="high"
        decoding="async"
        {...imgProps(src, '(max-width: 768px) 100vw, 50vw')}
        alt={`Data center ${title}`}
        onError={() => {
          if (src !== GENERIC) setSrc(GENERIC);
        }}
      />
    </div>
  );
}

