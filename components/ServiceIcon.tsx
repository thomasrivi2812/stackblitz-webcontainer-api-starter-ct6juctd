// Icônes des services — partagées entre le carrousel d'accueil et la page /services.
// La clé provient du champ WP `serviceFields.icone`.

export function ServiceIcon({ name }: { name: string }) {
  const c = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'proximite':
      return (
        <svg {...c}>
          <path d="M14 7l3-3 3 3-3 3M3 21l6-6M9 11l4 4M5 13l-2 2 4 4 2-2" />
        </svg>
      );
    case 'ia':
      return (
        <svg {...c}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </svg>
      );
    case 'colocation':
      return (
        <svg {...c}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      );
    case 'accompagnement':
      return (
        <svg {...c}>
          <path d="M16 21v-2a4 4 0 00-8 0v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'bureau':
      return (
        <svg {...c}>
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <path d="M3 20h18M8 16v4M16 16v4" />
        </svg>
      );
    case 'connectivite':
      return (
        <svg {...c}>
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M8 11l8-4M8 13l8 4" />
        </svg>
      );
    case 'modulable':
      return (
        <svg {...c}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case 'continuite':
      return (
        <svg {...c}>
          <path d="M3 12a9 9 0 1015-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      );
    default:
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
  }
}
