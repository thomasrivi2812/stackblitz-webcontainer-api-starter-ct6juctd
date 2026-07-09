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

  // Sonde « liaison pages » : slugs des pages WP + présence des groupes ACF
  // dans le schéma GraphQL, pour diagnostiquer un bandeau non relié
  // (page au mauvais slug vs snippet/JSON pas importé).
  const gq = async (query: string): Promise<{ data?: unknown; error?: string }> => {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });
      const j = (await r.json()) as { data?: unknown; errors?: { message: string }[] };
      if (j.errors?.length) return { error: j.errors[0].message };
      return { data: j.data };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  };
  const slugsRes = await gq('{ pages(first: 100) { nodes { slug } } }');
  out.pagesSlugs = slugsRes.error
    ? `erreur: ${slugsRes.error}`
    : ((slugsRes.data as { pages?: { nodes?: { slug: string }[] } })?.pages?.nodes ?? []).map((n) => n.slug);
  const groupes: Record<string, string> = {
    datacentersPageFields: '{ pages(where: {name: "datacenters"}) { nodes { slug datacentersPageFields { visitTitle } } } }',
    servicesPageFields: '{ pages(where: {name: "services"}) { nodes { slug servicesPageFields { titre } } } }',
    documentationFields: '{ pages(where: {name: "documentation"}) { nodes { slug documentationFields { titre } } } }',
    homeGrow: '{ pages(where: {name: "accueil"}) { nodes { slug homeFields { growNumber } } } }',
  };
  const probe: Record<string, unknown> = {};
  for (const [nom, query] of Object.entries(groupes)) {
    const r = await gq(query);
    probe[nom] = r.error ? `ABSENT DU SCHEMA (${r.error.slice(0, 80)})` : r.data;
  }
  out.groupes = probe;

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
