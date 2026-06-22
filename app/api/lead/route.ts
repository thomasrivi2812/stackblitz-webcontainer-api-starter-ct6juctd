import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Point d'entrée unique pour TOUTES les captures du site :
 *  - formulaire de contact         (type: "contact")
 *  - modale "Poser votre question" (type: "question")
 *  - téléchargement brochure       (type: "brochure")
 *  - téléchargement document       (type: "download")
 *
 * Le payload est validé/borné ici (côté serveur) puis relayé vers l'endpoint
 * REST WordPress `POST /wp-json/ndc/v1/lead`, qui crée un CPT « lead ».
 *
 * Défense en profondeur :
 *  - honeypot anti-bot,
 *  - rate limiting par IP,
 *  - garde de taille du corps de requête,
 *  - secret partagé Next.js ↔ WordPress (l'endpoint WP rejette tout POST direct).
 */

type LeadType = 'contact' | 'question' | 'brochure' | 'download';

const VALID_TYPES: LeadType[] = ['contact', 'question', 'brochure', 'download'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Taille maximale acceptée pour le corps de requête (anti-abus). */
const MAX_BODY_BYTES = 16 * 1024; // 16 Ko

/* ------------------------------------------------------------------ *
 *  Rate limiting en mémoire (par IP) — simple fenêtre glissante.
 *  Suffisant pour un endpoint de formulaire ; pour un cluster multi-
 *  instances, remplacer par un store partagé (Upstash/Redis).
 * ------------------------------------------------------------------ */
const RL_WINDOW_MS = 60_000; // 1 minute
const RL_MAX = 5; // 5 envois / IP / minute
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  // Nettoyage occasionnel pour éviter une croissance illimitée de la Map.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RL_WINDOW_MS)) hits.delete(k);
    }
  }
  return arr.length > RL_MAX;
}

function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/** Déduit l'URL de l'endpoint WordPress à partir de la config existante. */
function getWordpressLeadEndpoint(): string | null {
  const explicit = process.env.WORDPRESS_REST_LEAD_ENDPOINT;
  if (explicit) return explicit;

  const gql = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!gql) return null;
  // https://site.tld/graphql  ->  https://site.tld/wp-json/ndc/v1/lead
  return gql.replace(/\/graphql\/?$/, '') + '/wp-json/ndc/v1/lead';
}

export async function POST(request: Request) {
  // 1) Rate limiting par IP
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Trop de requêtes. Merci de réessayer dans une minute.' },
      { status: 429 },
    );
  }

  // 2) Garde de taille (avant parsing JSON)
  const lenHeader = request.headers.get('content-length');
  if (lenHeader && Number(lenHeader) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Requête trop volumineuse.' }, { status: 413 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Requête trop volumineuse.' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Corps de requête invalide.' }, { status: 400 });
  }

  // 3) Honeypot anti-spam : un bot remplit ce champ caché, un humain non.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') {
    // On répond "ok" pour ne pas signaler au bot qu'il a été filtré.
    return NextResponse.json({ ok: true });
  }

  const type = String(body.type ?? '') as LeadType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, error: 'Type de demande inconnu.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Adresse e-mail invalide.' }, { status: 400 });
  }

  // 4) Champs facultatifs, nettoyés / bornés.
  const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const payload = {
    type,
    email,
    prenom: clip(body.prenom, 80),
    nom: clip(body.nom, 80),
    telephone: clip(body.telephone, 40),
    entreprise: clip(body.entreprise, 120),
    objet: clip(body.objet, 120),
    message: clip(body.message, 5000),
    ressource: clip(body.ressource, 200),
    source_url: clip(body.source_url, 300),
  };

  if (type === 'contact' && payload.message.length < 10) {
    return NextResponse.json({ ok: false, error: 'Message trop court.' }, { status: 400 });
  }
  if (type === 'question' && payload.message.length < 5) {
    return NextResponse.json({ ok: false, error: 'Question trop courte.' }, { status: 400 });
  }

  const endpoint = getWordpressLeadEndpoint();
  if (!endpoint) {
    // Pas de WordPress configuré : on log et on renvoie ok pour ne pas bloquer l'UX en dev.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[NDC] WORDPRESS_GRAPHQL_ENDPOINT manquant — lead non transmis :', payload);
    }
    return NextResponse.json({ ok: true, stored: false });
  }

  // 5) Secret partagé : prouve à WordPress que la requête vient bien de ce serveur.
  //    On le passe dans le CORPS JSON (champ `token`) plutôt que dans un en-tête :
  //    certains hébergeurs WP managés (InstaWP, WP Engine…) ont un WAF qui coupe
  //    la connexion dès qu'un en-tête custom de type token est présent.
  const secret = process.env.LEAD_SHARED_SECRET;
  const bodyToSend = secret ? { ...payload, token: secret } : payload;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyToSend),
      cache: 'no-store',
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[NDC] WordPress a refusé le lead :', res.status, detail);
      return NextResponse.json(
        { ok: false, error: 'Enregistrement impossible pour le moment.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error('[NDC] Erreur réseau vers WordPress (lead) :', err);
    return NextResponse.json(
      { ok: false, error: 'Service momentanément indisponible.' },
      { status: 503 },
    );
  }
}
