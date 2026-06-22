import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Point d'entrée unique pour TOUTES les captures du site :
 *  - formulaire de contact      (type: "contact")
 *  - modale "Poser votre question" (type: "question")
 *  - téléchargement brochure     (type: "brochure")
 *  - téléchargement document     (type: "download")
 *
 * Le payload est validé ici (côté serveur) puis relayé vers l'endpoint
 * REST WordPress `POST /wp-json/ndc/v1/lead`, qui crée un CPT « lead ».
 * Brancher Monday.com plus tard = ajouter un appel ici, rien d'autre à changer.
 */

type LeadType = 'contact' | 'question' | 'brochure' | 'download';

const VALID_TYPES: LeadType[] = ['contact', 'question', 'brochure', 'download'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Corps de requête invalide.' }, { status: 400 });
  }

  // Honeypot anti-spam : un bot remplit ce champ caché, un humain non.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') {
    // On répond "ok" pour ne pas signaler au bot qu'il a été filtré.
    return NextResponse.json({ ok: true });
  }

  const type = String(body.type ?? '') as LeadType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, error: 'Type de demande inconnu.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Adresse e-mail invalide.' }, { status: 400 });
  }

  // Champs facultatifs, nettoyés / bornés.
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

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
