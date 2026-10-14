// Réglages du site pilotés depuis WordPress (Réglages → Version anglaise).
// -----------------------------------------------------------------------
// Snippet WP : wordpress/ndc-snippet-version-anglaise.php, qui expose
// `ndcSiteSettings { enEnabled }` en GraphQL. Si le snippet n'est pas installé
// ou si WordPress ne répond pas, on retombe sur NEXT_PUBLIC_EN_ENABLED
// (valeur de compilation, anglais masqué par défaut).
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

/**
 * Pages (rendu serveur, ISR) : valeur relue à chaque régénération ; la case
 * WordPress déclenche une revalidation de tout le site quand elle change.
 */
export const getEnEnabled = cache(async (): Promise<boolean> => (await fetchEnFlag({})) ?? EN_DEFAULT);

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
