import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Revalidation à la demande, appelée par WordPress (hook save_post) pour
// rafraîchir le cache dès qu'un contenu est publié/modifié, sans attendre
// la fenêtre ISR de 5 min. Protégée par un secret partagé.
//
// ENV requis : REVALIDATE_SECRET (identique côté Next et côté WordPress).
// Appel : POST /api/revalidate { "secret": "...", "path": "/actualites" }
// path optionnel (défaut « / ») ; on revalide en mode "layout" pour couvrir
// la page et ses variantes de langue.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'REVALIDATE_SECRET non configuré' }, { status: 500 });
  }

  let body: { secret?: string; path?: string } = {};
  try {
    body = await request.json();
  } catch {
    // corps vide/invalide : on tolère et on lira l'en-tête ci-dessous
  }
  const provided = body.secret || request.headers.get('x-revalidate-secret') || '';
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Secret invalide' }, { status: 401 });
  }

  const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path : '/';
  try {
    revalidatePath(path, 'layout');
    return NextResponse.json({ ok: true, revalidated: path, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erreur de revalidation' },
      { status: 500 },
    );
  }
}
