'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapPoint } from '@/lib/wordpress';

const STATUT_COLOR: Record<string, string> = {
  livre: '#39b184',
  construction: '#e8c04e',
  avenir: '#2dafe6',
};

const STATUT_LABEL: Record<string, string> = {
  livre: 'Livré',
  construction: 'En construction',
  avenir: 'À venir',
};

// Marqueur sur mesure (pas d'image externe → pas de souci de chemin avec le bundler).
function pin(color: string) {
  return L.divIcon({
    className: 'ndc-pin',
    html: `<span style="
      display:block;width:20px;height:20px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2.5px solid #fff;box-shadow:0 3px 8px rgba(20,40,73,.4);"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -18],
  });
}

export function MapClient({
  points,
  center = [46.6, 2.4],
  zoom = 5,
}: {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.slug} position={[p.lat, p.lng]} icon={pin(STATUT_COLOR[p.statut] ?? '#1b3360')}>
          <Popup>
            <strong style={{ color: '#1b3360', fontSize: 15 }}>{p.title}</strong>
            <br />
            {p.ville && <span style={{ color: '#5d6b85' }}>{p.ville}</span>}
            <br />
            <span style={{ color: STATUT_COLOR[p.statut] ?? '#1b3360', fontWeight: 600, fontSize: 13 }}>
              {STATUT_LABEL[p.statut] ?? ''}
            </span>
            <br />
            <a href={`/datacenters/${p.slug}`} style={{ color: '#1c8cbd', fontWeight: 600 }}>
              Voir le site →
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
