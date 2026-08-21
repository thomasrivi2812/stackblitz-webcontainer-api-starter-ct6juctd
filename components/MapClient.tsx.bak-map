'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslations, useLocale } from 'next-intl';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapPoint } from '@/lib/wordpress';

const STATUT_COLOR: Record<string, string> = {
  // Charte sobre, lisible sur le fond clair : opérationnel = turquoise,
  // en construction = gris ardoise, à venir = gris-bleu (plus de vert/jaune).
  livre: '#1c8cbd',
  construction: '#5d6b85',
  avenir: '#8593af',
};

// Clés i18n des libellés de statut (traduits FR/EN via messages/*.json → « map »).
const STATUT_KEY: Record<string, string> = {
  livre: 'statutLivre',
  construction: 'statutConstruction',
  avenir: 'statutAvenir',
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
  // Cadrage par défaut : la France métropolitaine (zoom 6), plutôt que
  // l'Europe de l'Ouest entière — le réseau est 100 % français.
  center = [48.5, 1.3],
  zoom = 7,
}: {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
}) {
  const t = useTranslations('map');
  // Préfixe de langue : FR à la racine, EN sous /en (localePrefix "as-needed").
  const locale = useLocale();
  const prefix = locale === 'en' ? '/en' : '';
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      {/* Fond de carte épuré (CARTO « Positron ») : gris clair, peu de calques,
          dans l'esprit du reste du site — remplace les tuiles OSM par défaut. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      {points.map((p) => (
        <Marker key={p.slug} position={[p.lat, p.lng]} icon={pin(STATUT_COLOR[p.statut] ?? '#1b3360')}>
          <Popup>
            <strong style={{ color: '#1b3360', fontSize: 15 }}>{p.title}</strong>
            <br />
            {p.ville && <span style={{ color: '#5d6b85' }}>{p.ville}</span>}
            <br />
            <span style={{ color: STATUT_COLOR[p.statut] ?? '#1b3360', fontWeight: 600, fontSize: 13 }}>
              {STATUT_KEY[p.statut] ? t(STATUT_KEY[p.statut]) : ''}
            </span>
            <br />
            <a href={`${prefix}/datacenters/${p.slug}`} style={{ color: '#1c8cbd', fontWeight: 600 }}>
              {t('voir')}
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
