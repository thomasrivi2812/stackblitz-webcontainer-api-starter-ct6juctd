'use client';

import dynamic from 'next/dynamic';
import type { MapPoint } from '@/lib/wordpress';

const MapClient = dynamic(() => import('./MapClient').then((m) => m.MapClient), {
  ssr: false,
  loading: () => <div className="map-loading">Chargement de la carte…</div>,
});

// Carte centrée sur un seul site (fiche data center), zoomée sur la ville.
export function LocationMap({ point }: { point: MapPoint }) {
  return (
    <div className="dc-map-shell">
      <MapClient points={[point]} center={[point.lat, point.lng]} zoom={11} />
    </div>
  );
}
