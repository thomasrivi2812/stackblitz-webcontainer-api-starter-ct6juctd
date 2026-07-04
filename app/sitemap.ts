import type { MetadataRoute } from 'next';
import { getDatacenters, getAllPosts } from '@/lib/wordpress';
import { SITE_URL, localePath } from '@/lib/seo';

// Sitemap bilingue : chaque URL FR ET sa version EN (préfixe /en).
// - Articles : getAllPosts (tous, pas seulement les 5 récents) avec leur
//   vraie date de publication comme lastModified.
// - Pas de lastModified artificiel (« maintenant ») sur les pages statiques :
//   un sitemap qui prétend que tout vient de changer finit ignoré par Google.
const LOCALES = ['fr', 'en'] as const;

const STATIC_PATHS: { path: string; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/datacenters', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/offres', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/certifications', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/equipes', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/groupe', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/actualites', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const { path, changeFrequency, priority } of STATIC_PATHS) {
      entries.push({
        url: `${SITE_URL}${localePath(locale, path)}`,
        changeFrequency,
        // La version EN est légèrement dépriorisée (contenu miroir).
        priority: locale === 'fr' ? priority : Math.max(0.1, priority - 0.2),
      });
    }
  }

  // Pages dynamiques — repli silencieux si l'API WP est injoignable.
  for (const locale of LOCALES) {
    try {
      const [dcs, posts] = await Promise.all([getDatacenters(locale), getAllPosts(locale)]);
      entries.push(
        ...dcs.map((d) => ({
          url: `${SITE_URL}${localePath(locale, `/datacenters/${d.slug}`)}`,
          changeFrequency: 'monthly' as const,
          priority: locale === 'fr' ? 0.8 : 0.6,
        })),
        ...posts.map((p) => ({
          url: `${SITE_URL}${localePath(locale, `/actualites/${p.slug}`)}`,
          ...(p.date ? { lastModified: new Date(p.date) } : {}),
          changeFrequency: 'monthly' as const,
          priority: locale === 'fr' ? 0.6 : 0.5,
        })),
      );
    } catch {
      // données indisponibles pour cette langue : on garde le reste
    }
  }

  // Sécurité : aucune URL en double dans le fichier final.
  const seen = new Set<string>();
  return entries.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));
}
