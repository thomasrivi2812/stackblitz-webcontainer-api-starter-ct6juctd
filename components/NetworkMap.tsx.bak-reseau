'use client';

import dynamic from 'next/dynamic';
import type { MapPoint } from '@/lib/wordpress';

// Leaflet a besoin du DOM (window) : on charge la carte côté client uniquement.
const MapClient = dynamic(() => import('./MapClient').then((m) => m.MapClient), {
  ssr: false,
  loading: () => <div className="map-loading" aria-hidden="true" />,
});

export function NetworkMap({ points }: { points: MapPoint[] }) {
  return (
    <div className="map-shell">
      <MapClient points={points} />
    </div>
  );
}
