import { NextResponse } from 'next/server';

// Sonde de supervision : GET /api/health → 200 si le serveur Next répond.
// GET /api/health?deep=1 vérifie aussi que WordPress répond (503 sinon) —
// à utiliser pour l'alerte « contenu non rafraîchi », pas pour le
// répartiteur de charge (une panne WP ne doit pas retirer le site).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const deep = new URL(request.url).searchParams.get('deep') === '1';
  const body: Record<string, unknown> = { ok: true, uptime: Math.round(process.uptime()) };
  if (deep) {
    const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
    let wp = false;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' }),
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        wp = res.ok;
      } catch {
        wp = false;
      }
    }
    body.wordpress = wp;
    if (!wp) body.ok = false;
  }
  return NextResponse.json(body, { status: body.ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
