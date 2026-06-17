import type { MetadataRoute } from 'next';
import { getDatacenters, getRecentPosts } from '@/lib/wordpress';

const BASE = 'https://www.nationdc.fr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Pages statiques principales
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/datacenters`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/offres`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/actualites`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ];

  // Pages dynamiques (data centers + articles) — repli silencieux si l'API est injoignable
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [dcs, posts] = await Promise.all([getDatacenters(), getRecentPosts()]);
    dynamicRoutes = [
      ...dcs.map((d) => ({
        url: `${BASE}/datacenters/${d.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
      ...posts.map((p) => ({
        url: `${BASE}/actualites/${p.slug}`,
        lastModified: p.date ? new Date(p.date) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // données indisponibles : on publie au moins les routes statiques
  }

  return [...staticRoutes, ...dynamicRoutes];
}
