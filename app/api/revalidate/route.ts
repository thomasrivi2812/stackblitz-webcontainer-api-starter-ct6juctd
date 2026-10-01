import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createHash, timingSafeEqual } from 'node:crypto';

// Revalidation à la demande, appelée par WordPress (hook save_post) pour
// rafraîchir le cache dès qu'un contenu est publié/modifié, sans attendre
// la fenêtre ISR de 5 min. Protégée par un secret partagé.
//
// ENV requis : REVALIDATE_SECRET (identique côté Next et côté WordPress).
// Appel : POST /api/revalidate { "secret": "...", "path": "/actualites" }
// path optionnel (défaut « / » = tout le site) ; un chemin sans préfixe de
// langue revalide ses variantes FR et EN.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Comparaison en temps constant : un `!==` s'arrête au premier caractère
// différent, ce qui permet en théorie de deviner le secret en mesurant le
// temps de réponse. Les empreintes SHA-256 ont toujours la même longueur.
function sameSecret(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

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
  if (!sameSecret(provided, secret)) {
    return NextResponse.json({ ok: false, error: 'Secret invalide' }, { status: 401 });
  }

  const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path : '/';
  // Le proxy next-intl réécrit les URL publiques vers la route interne
  // [locale] (« /actualites » est servie par « /fr/actualites ») : c'est ce
  // chemin interne qu'il faut revalider, sinon le cache FR n'est pas rafraîchi.
  // Chemin sans préfixe de langue → on revalide les deux variantes.
  const paths =
    path === '/' || /^\/(fr|en)(\/|$)/.test(path) ? [path] : [`/fr${path}`, `/en${path}`];
  try {
    // « / » en mode layout = tout le site. Pour un chemin précis, PAS de type :
    // `revalidatePath('/fr/x', 'layout')` ne vise que les layouts situés à ce
    // chemin (il n'y en a pas) et ne rafraîchissait donc rien.
    for (const p of paths) {
      if (p === '/') revalidatePath(p, 'layout');
      else revalidatePath(p);
    }
    return NextResponse.json({ ok: true, revalidated: paths, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erreur de revalidation' },
      { status: 500 },
    );
  }
}
