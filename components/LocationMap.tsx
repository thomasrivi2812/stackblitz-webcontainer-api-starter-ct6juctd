'use client';

import dynamic from 'next/dynamic';
import type { MapPoint } from '@/lib/wordpress';

const MapClient = dynamic(() => import('./MapClient').then((m) => m.MapClient), {
  ssr: false,
  loading: () => <div className="map-loading" aria-hidden="true" />,
});

// Carte centrée sur un seul site (fiche data center).
// Zoom 10 plutôt que 11 : à 11, le cadre s'arrêtait à la commune
// d'implantation, sans repère. À 10, la métropole voisine entre dans le
// champ — c'est elle qui situe le site pour qui ne connaît pas la commune.
// Un cran suffit : plus large, la pastille du site se perdrait.
// `labels` affiche les noms de lieux, sans quoi le dézoom n'aiderait pas.
export function LocationMap({ point }: { point: MapPoint }) {
  return (
    <div className="dc-map-shell">
      <MapClient points={[point]} center={[point.lat, point.lng]} zoom={10} labels />
    </div>
  );
}
