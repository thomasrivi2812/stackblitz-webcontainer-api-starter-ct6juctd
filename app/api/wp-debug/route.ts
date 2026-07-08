import { NextResponse } from 'next/server';

// Diagnostic de la liaison WordPress, à ouvrir dans le navigateur :
// https://<domaine-du-site>/api/wp-debug
// Montre ce que voit le SERVEUR (Vercel) : variable d'environnement présente ?
// l'endpoint GraphQL répond-il depuis Vercel ? avec quel statut/corps ?
// Ne révèle aucun secret (l'URL de l'endpoint est visible publiquement dans WP).
// Route temporaire : à supprimer une fois la liaison rétablie.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Remonte toute la chaîne de causes d'une erreur réseau (undici enveloppe la
// vraie cause — ENOTFOUND, ECONNRESET, CERT… — dans error.cause).
function causeChain(e: unknown): { name?: string; code?: string; message?: string }[] {
  const chain: { name?: string; code?: string; message?: string }[] = [];
  let c: unknown = e;
  for (let i = 0; c && i < 6; i++) {
    const err = c as { name?: string; code?: string; message?: string; cause?: unknown };
    chain.push({ name: err.name, code: err.code, message: err.message });
    c = err.cause;
  }
  return chain;
}

export async function GET() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT || null;
  const out: Record<string, unknown> = {
    envPresente: !!endpoint,
    // Longueur brute : détecte espaces/retours à la ligne collés dans Vercel.
    envLongueur: endpoint ? endpoint.length : 0,
    endpoint: endpoint,
  };
  if (!endpoint) {
    out.diagnostic =
      'WORDPRESS_GRAPHQL_ENDPOINT est ABSENTE côté serveur : à créer dans Vercel → Settings → Environment Variables (environnement Production), puis REDÉPLOYER.';
    return NextResponse.json(out);
  }
  try {
    // Valide l'URL (espace ou caractère parasite → erreur explicite ici).
    new URL(endpoint);
  } catch {
    out.diagnostic = 'La valeur de la variable n\'est pas une URL valide (espace ou caractère en trop ?).';
    return NextResponse.json(out);
  }
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ generalSettings { title } }' }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const text = await r.text();
    out.httpStatus = r.status;
    out.reponse = text.slice(0, 400);
    out.diagnostic = r.ok && text.includes('generalSettings')
      ? 'OK : Vercel joint bien WordPress. Si le site affiche encore les contenus par défaut, cliquer « ↻ Mettre à jour le site » dans WP (cache ISR).'
      : 'L\'endpoint répond mais pas normalement (pare-feu, challenge anti-bot, redirection ou plugin de sécurité ?). Voir le corps de la réponse ci-dessus.';
  } catch (e) {
    out.erreurFetch = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    out.erreurCauses = causeChain(e);
    out.diagnostic = 'Vercel n\'arrive PAS à joindre l\'endpoint (site WP en pause, DNS, pare-feu…).';
  }

  // Tests complémentaires pour localiser le blocage :
  // DNS vu par Vercel, puis GET simple sur la racine du site WP.
  const host = new URL(endpoint).hostname;
  try {
    const dns = await import('node:dns/promises');
    out.dns = await dns.lookup(host, { all: true });
  } catch (e) {
    out.dnsErreur = causeChain(e);
  }
  try {
    const r = await fetch(new URL(endpoint).origin, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    out.racineHttpStatus = r.status;
  } catch (e) {
    out.racineErreur = causeChain(e);
  }
  return NextResponse.json(out);
}
