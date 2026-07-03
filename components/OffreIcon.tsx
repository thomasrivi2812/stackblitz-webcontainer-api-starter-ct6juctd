// Icônes de la page « Nos offres » (enjeux / problèmes des personas).
// Même style que le reste du site : trait fin, currentColor. La clé provient
// du champ WP `icon` (select ~20 icônes). Toute valeur inconnue (ancien emoji
// par ex.) retombe sur l'icône par défaut → jamais d'emoji affiché.
//
// ⚠️ Garder cette liste de clés synchronisée avec le select ACF du CPT persona
// (voir le snippet). Ordre = ordre proposé dans WordPress.
export const OFFRE_ICON_KEYS = [
  'lock', 'shield', 'key', 'flag', 'scale',
  'bolt', 'plug', 'gauge', 'flame', 'leaf',
  'euro', 'chart', 'growth', 'target',
  'globe', 'network', 'signal', 'cloud', 'database', 'server',
  'building', 'institution', 'home', 'mapPin', 'map',
  'wrench', 'search', 'ruler', 'document', 'check', 'clock',
  'users', 'user', 'handshake',
] as const;

export function OffreIcon({ name, className }: { name?: string | null; className?: string }) {
  const c = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  switch (name) {
    case 'lock':
      return (<svg {...c}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>);
    case 'shield':
      return (<svg {...c}><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>);
    case 'key':
      return (<svg {...c}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l2 2M14 9l2 2" /></svg>);
    case 'flag':
      return (<svg {...c}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>);
    case 'scale':
      return (<svg {...c}><path d="M12 4v16M7 20h10M4 8l4-4 4 4M20 8l-4-4-4 4M4 8l-2 5a3 3 0 006 0zM20 8l-2 5a3 3 0 006 0z" /></svg>);
    case 'bolt':
      return (<svg {...c}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>);
    case 'plug':
      return (<svg {...c}><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 01-12 0zM12 17v5" /></svg>);
    case 'gauge':
      return (<svg {...c}><path d="M12 13l4-3" /><path d="M4 18a8 8 0 1116 0" /><circle cx="12" cy="13" r="1" /></svg>);
    case 'flame':
      return (<svg {...c}><path d="M12 3c1 4 5 5 5 9a5 5 0 01-10 0c0-2 1-3 2-4 .5 1 1 1.5 2 2 0-3-1-5 1-7z" /></svg>);
    case 'leaf':
      return (<svg {...c}><path d="M4 20c0-9 7-14 16-14 0 9-6 15-14 14M4 20c4-4 7-6 11-8" /></svg>);
    case 'euro':
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5A4 4 0 009 11c0 3 2.5 4.5 6.5 4M7 11h6M7 13.5h5" /></svg>);
    case 'chart':
      return (<svg {...c}><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" /></svg>);
    case 'growth':
      return (<svg {...c}><path d="M4 18l6-6 3 3 7-7M15 8h6v6" /></svg>);
    case 'target':
      return (<svg {...c}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></svg>);
    case 'globe':
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>);
    case 'network':
      return (<svg {...c}><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8 11l8-4M8 13l8 4" /></svg>);
    case 'signal':
      return (<svg {...c}><path d="M5 18a9 9 0 019-9M8 18a5 5 0 015-5" /><circle cx="6" cy="18" r="1" /><path d="M15 5l4 4" /></svg>);
    case 'cloud':
      return (<svg {...c}><path d="M7 18a4 4 0 010-8 5 5 0 019.5 1.5A3.5 3.5 0 0117 18z" /></svg>);
    case 'database':
      return (<svg {...c}><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></svg>);
    case 'server':
      return (<svg {...c}><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></svg>);
    case 'building':
      return (<svg {...c}><path d="M6 21V6l7-3v18M6 21h12M18 21V9l-5-3M9 9h.01M9 12h.01M9 15h.01" /></svg>);
    case 'institution':
      return (<svg {...c}><path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18" /></svg>);
    case 'home':
      return (<svg {...c}><path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-6h4v6" /></svg>);
    case 'mapPin':
      return (<svg {...c}><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
    case 'map':
      return (<svg {...c}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></svg>);
    case 'wrench':
      return (<svg {...c}><path d="M15 6a4 4 0 015 5l-9 9-4-4 9-9a4 4 0 01-1-1z" /><path d="M7 16l-3 3" /></svg>);
    case 'search':
      return (<svg {...c}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
    case 'ruler':
      return (<svg {...c}><rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(0 12 12)" /><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4" /></svg>);
    case 'document':
      return (<svg {...c}><path d="M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h6M9.5 15h6M9.5 9h3" /></svg>);
    case 'check':
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>);
    case 'clock':
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
    case 'users':
      return (<svg {...c}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0111 0M16 6a3 3 0 010 6M17 20a5.5 5.5 0 00-2-4" /></svg>);
    case 'user':
      return (<svg {...c}><circle cx="12" cy="8" r="3.6" /><path d="M5 20a7 7 0 0114 0" /></svg>);
    case 'handshake':
      return (<svg {...c}><path d="M8 12l3-3 3 3 3-3 3 3M3 9l4-2 4 2M21 9l-4-2M11 9l2 2a1.5 1.5 0 002-2M6 11v4a2 2 0 002 2l6 2a2 2 0 002-2v-3" /></svg>);
    default:
      // Icône neutre par défaut (aucun emoji).
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>);
  }
}
