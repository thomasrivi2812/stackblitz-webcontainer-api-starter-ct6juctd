// Images optimisées via l'optimiseur de Next (/_next/image) : redimensionnées
// à la taille d'affichage, converties en WebP, mises en cache par le serveur.
// Pour les <img> existants (CSS inchangé) et les images de fond.
//
// Seules les images du site ou des hôtes autorisés dans next.config.js
// (WordPress…, liste NDC_IMAGE_HOSTS) passent par l'optimiseur ; les autres
// sont servies telles quelles (l'optimiseur les refuserait).
const HOSTS = (process.env.NDC_IMAGE_HOSTS || '').split(',').filter(Boolean);
const WIDTHS = [640, 828, 1200, 1920] as const;

export type OptimizedWidth = 640 | 750 | 828 | 1080 | 1200 | 1920;

function optimizable(src: string): boolean {
  if (!src || src.startsWith('data:') || /\.svg(\?|$)/i.test(src)) return false;
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    return HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** URL optimisée à une largeur donnée (ex. image de fond CSS). */
export function optimizedImage(src: string, width: OptimizedWidth): string {
  return optimizable(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75` : src;
}

/**
 * Props à étaler sur un <img> : src + srcSet + sizes. `sizes` décrit la
 * largeur affichée (ex. « (max-width: 768px) 100vw, 33vw ») pour que le
 * navigateur télécharge la plus petite version suffisante.
 */
export function imgProps(src: string, sizes: string): { src: string; srcSet?: string; sizes?: string } {
  if (!optimizable(src)) return { src };
  return {
    src: optimizedImage(src, 1200),
    srcSet: WIDTHS.map((w) => `${optimizedImage(src, w)} ${w}w`).join(', '),
    sizes,
  };
}
