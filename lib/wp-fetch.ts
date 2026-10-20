// Accès à l'API GraphQL de WordPress, en ménageant le serveur mutualisé.
// ----------------------------------------------------------------------
// Chaque requête GraphQL réveille tout WordPress (PHP + base) : sans
// précaution, la fabrication des pages (compilation, ISR, revalidation après
// un enregistrement) en envoie des centaines en rafale et sature PHP pour les
// autres sites du serveur. Ici :
// - les réponses sont mémorisées WP_CACHE_TTL secondes (défaut 300) et
//   partagées par toutes les pages : une même question n'est posée qu'une fois ;
// - des requêtes identiques simultanées n'en font qu'une ;
// - au plus WP_MAX_CONCURRENCY requêtes en parallèle (défaut 2) ;
// - abandon après WP_TIMEOUT_MS (défaut 8000) au lieu de s'empiler ;
// - WordPress en panne : la dernière réponse connue est servie, et l'échec est
//   mémorisé 15 s (pas de nouvelles tentatives en rafale).
// /api/revalidate (enregistrement dans WordPress) périme toute la mémoire.

type Entry = { data?: unknown; dataAt?: number; err?: string; errGql?: boolean; errAt?: number };
type Store = {
  entries: Map<string, Entry>;
  inflight: Map<string, Promise<unknown>>;
  active: number;
  queue: (() => void)[];
};

// globalThis : une seule mémoire par processus, partagée par les routes et le proxy.
const g = globalThis as typeof globalThis & { __ndcWp?: Store };
const store: Store = (g.__ndcWp ??= { entries: new Map(), inflight: new Map(), active: 0, queue: [] });

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return v !== undefined && v !== '' && Number.isFinite(n) && n >= 0 ? n : d;
};
const TTL = num(process.env.WP_CACHE_TTL, 300) * 1000;
const MAX = Math.max(1, num(process.env.WP_MAX_CONCURRENCY, 2));
const TIMEOUT = Math.max(1000, num(process.env.WP_TIMEOUT_MS, 8000));
const FAIL_TTL = 15_000;
const MAX_ENTRIES = 1000;

/** Erreur renvoyée par GraphQL (champ absent…) : déterministe, mémorisée comme une réponse. */
export class WpGraphQLError extends Error {}

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  // Le créneau libéré passe directement au suivant de la file : jamais plus de MAX en vol.
  if (store.active >= MAX) await new Promise<void>((resolve) => store.queue.push(resolve));
  else store.active++;
  try {
    return await fn();
  } finally {
    const next = store.queue.shift();
    if (next) next();
    else store.active--;
  }
}

async function post(endpoint: string, query: string, variables: Record<string, unknown>): Promise<unknown> {
  // Pas d'option `cache` : sous Next, `no-store` rendrait les pages dynamiques.
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  let json: { data?: unknown; errors?: { message?: string }[] };
  try {
    json = await res.json();
  } catch {
    throw new Error(`WordPress HTTP ${res.status} : réponse illisible`);
  }
  if (json.errors?.length) throw new WpGraphQLError(json.errors.map((e) => e.message ?? '?').join(' | '));
  if (!res.ok) throw new Error(`WordPress HTTP ${res.status}`);
  return json.data;
}

function remember(key: string, entry: Entry) {
  store.entries.delete(key);
  store.entries.set(key, entry);
  if (store.entries.size > MAX_ENTRIES) store.entries.delete(store.entries.keys().next().value as string);
}

export async function wpQuery<T>(endpoint: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const key = `${endpoint}\n${query}\n${JSON.stringify(variables)}`;
  const now = Date.now();
  const e = store.entries.get(key);
  if (e?.dataAt !== undefined && now - e.dataAt < TTL) return e.data as T;
  if (e?.errAt !== undefined && now - e.errAt < (e.errGql ? TTL : FAIL_TTL)) {
    if (!e.errGql && e.dataAt !== undefined) return e.data as T;
    throw e.errGql ? new WpGraphQLError(e.err) : new Error(e.err);
  }

  let p = store.inflight.get(key) as Promise<T> | undefined;
  if (!p) {
    p = withSlot(() => post(endpoint, query, variables))
      .then((data) => {
        remember(key, { data, dataAt: Date.now() });
        return data as T;
      })
      .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : String(error);
        if (error instanceof WpGraphQLError) {
          remember(key, { err: msg, errGql: true, errAt: Date.now() });
          throw error;
        }
        const prev = store.entries.get(key);
        remember(key, { ...prev, err: msg, errGql: false, errAt: Date.now() });
        if (prev?.dataAt !== undefined) {
          console.warn('[NDC] WordPress injoignable — dernière réponse connue servie :', msg);
          return prev.data as T;
        }
        throw error;
      })
      .finally(() => store.inflight.delete(key));
    store.inflight.set(key, p);
  }
  return p;
}

/** Périme toutes les réponses (gardées seulement en secours si WordPress tombe). */
export function expireWpCache(): void {
  for (const e of store.entries.values()) {
    if (e.dataAt !== undefined) e.dataAt = -Infinity;
    delete e.errAt;
  }
}

/** Remplaçant de GraphQLClient (graphql-request) passant par la mémoire ci-dessus. */
export class WpClient {
  constructor(private readonly endpoint: string) {}

  request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return wpQuery<T>(this.endpoint, query, variables);
  }
}
