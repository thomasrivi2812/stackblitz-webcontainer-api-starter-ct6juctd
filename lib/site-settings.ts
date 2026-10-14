// Réglages du site pilotés depuis WordPress (Réglages → Site NDC).
// ----------------------------------------------------------------
// Snippet WP : wordpress/ndc-snippet-reglages-site.php, qui expose
// `ndcSiteSettings { enEnabled portalUrl linkedinUrl youtubeUrl vimeoUrl }`.
// Si le snippet n'est pas installé ou si WordPress ne répond pas : anglais
// selon NEXT_PUBLIC_EN_ENABLED (masqué par défaut), portail selon
// NEXT_PUBLIC_PORTAL_URL, réseaux sociaux non affichés.
import { cache } from 'react';
import { EN_ENABLED as EN_DEFAULT } from '@/i18n/routing';

const QUERY = '{ ndcSiteSettings { enEnabled } }';

async function fetchEnFlag(init: RequestInit): Promise<boolean | null> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return null;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY }),
      signal: AbortSignal.timeout(3000),
      ...init,
    });
    const json = (await res.json()) as { data?: { ndcSiteSettings?: { enEnabled?: unknown } | null } };
    const v = json.data?.ndcSiteSettings?.enEnabled;
    return typeof v === 'boolean' ? v : null;
  } catch {
    return null;
  }
}

export type SiteLinks = {
  /** Bouton « Portail client » (en-tête et pied de page) ; null = masqué. */
  portalUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  vimeoUrl: string | null;
};

const LINKS_QUERY = '{ ndcSiteSettings { enEnabled portalUrl linkedinUrl youtubeUrl vimeoUrl } }';

/** Adresse http(s) valide, sinon null. */
function cleanUrl(v: unknown): string | null {
  return typeof v === 'string' && /^https?:\/\/\S+$/.test(v.trim()) ? v.trim() : null;
}

/**
 * Pages (rendu serveur, ISR) : valeurs relues à chaque régénération ; un
 * enregistrement dans WordPress déclenche une revalidation de tout le site.
 */
export const getSiteSettings = cache(async (): Promise<{ enEnabled: boolean } & SiteLinks> => {
  const portalDefault = cleanUrl(process.env.NEXT_PUBLIC_PORTAL_URL);
  const empty = { portalUrl: portalDefault, linkedinUrl: null, youtubeUrl: null, vimeoUrl: null };
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: LINKS_QUERY }),
        signal: AbortSignal.timeout(3000),
      });
      const json = (await res.json()) as { data?: { ndcSiteSettings?: Record<string, unknown> | null } };
      const s = json.data?.ndcSiteSettings;
      if (s && typeof s.enEnabled === 'boolean') {
        return {
          enEnabled: s.enEnabled,
          portalUrl: cleanUrl(s.portalUrl) ?? portalDefault,
          linkedinUrl: cleanUrl(s.linkedinUrl),
          youtubeUrl: cleanUrl(s.youtubeUrl),
          vimeoUrl: cleanUrl(s.vimeoUrl),
        };
      }
    } catch {
      /* repli ci-dessous */
    }
  }
  // Ancien snippet (case anglaise seule) ou WordPress injoignable.
  return { enEnabled: (await fetchEnFlag({})) ?? EN_DEFAULT, ...empty };
});

export const getEnEnabled = cache(async (): Promise<boolean> => (await getSiteSettings()).enEnabled);

// Proxy (redirection de /en/…) : appelé à chaque requête, d'où un cache
// mémoire d'une minute. En cas d'erreur, on garde la dernière valeur connue.
const g = globalThis as typeof globalThis & { __ndcEn?: { v: boolean; at: number } };
const TTL_MS = 60_000;

export async function isEnEnabledForProxy(): Promise<boolean> {
  const c = g.__ndcEn;
  if (c && Date.now() - c.at < TTL_MS) return c.v;
  const v = (await fetchEnFlag({ cache: 'no-store' })) ?? c?.v ?? EN_DEFAULT;
  g.__ndcEn = { v, at: Date.now() };
  return v;
}
