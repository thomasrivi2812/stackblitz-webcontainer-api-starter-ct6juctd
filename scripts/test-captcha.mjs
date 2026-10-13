#!/usr/bin/env node
// Test de bout en bout du captcha ALTCHA et de l'envoi des formulaires.
// ---------------------------------------------------------------------
// À lancer DEPUIS le dossier du site (il utilise sa copie d'altcha-lib) :
//
//   cd ~/htdocs && node scripts/test-captcha.mjs [--url http://localhost:3000] [--email vous@exemple.fr]
//
// 1. /api/altcha fournit un défi signé ;
// 2. un envoi SANS captcha est refusé (403) ;
// 3. un envoi avec un captcha FAUX est refusé (403) ;
// 4. un envoi avec le captcha résolu est accepté et enregistré dans WordPress ;
// 5. le même captcha réutilisé est refusé (anti-rejeu).
// L'étape 4 crée un vrai lead « TEST captcha » dans WordPress (à supprimer ensuite).
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const BASE = opt('--url', 'http://localhost:3000').replace(/\/+$/, '');
const EMAIL = opt('--email', 'test-captcha@nationdatacenter.fr');

const green = (s) => `\x1b[32m${s}\x1b[0m`, red = (s) => `\x1b[31m${s}\x1b[0m`;
let failures = 0;
const check = (ok, label, detail = '') => {
  console.log(`${ok ? green('✔') : red('✘')} ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

// altcha-lib du site (node_modules du dossier courant).
const req = createRequire(path.join(process.cwd(), 'package.json'));
let solveChallenge, deriveKey;
try {
  ({ solveChallenge } = await import(pathToFileURL(req.resolve('altcha-lib')).href));
  ({ deriveKey } = await import(pathToFileURL(req.resolve('altcha-lib/algorithms/pbkdf2')).href));
} catch {
  console.error(red('altcha-lib introuvable : lancer ce script depuis le dossier du site (cd ~/htdocs).'));
  process.exit(1);
}

async function lead(captcha, label) {
  const body = {
    type: 'contact',
    email: EMAIL,
    prenom: 'Test',
    nom: 'Captcha',
    message: 'TEST captcha — envoi automatique de vérification, à supprimer.',
    ...(captcha !== undefined ? { captcha } : {}),
  };
  const r = await fetch(`${BASE}/api/lead`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, json: j, label };
}

console.log(`Site testé : ${BASE}\n`);

// 1. Défi
let challenge;
try {
  const r = await fetch(`${BASE}/api/altcha`, { cache: 'no-store' });
  challenge = await r.json();
  check(r.ok && challenge?.parameters?.algorithm, '1. /api/altcha fournit un défi', `HTTP ${r.status}`);
} catch (e) {
  check(false, '1. /api/altcha fournit un défi', e.message);
  process.exit(1);
}

// 2. Sans captcha
const noCap = await lead(undefined);
check(noCap.status === 403, '2. Envoi sans captcha refusé', `HTTP ${noCap.status}`);
if (noCap.status === 200) console.log('   → ALTCHA_DISABLED=1 est-il défini dans .env.local ? Le captcha est alors coupé.');

// 3. Captcha faux
const fake = await lead(Buffer.from(JSON.stringify({ challenge, solution: { counter: 1, derivedKey: 'x' } })).toString('base64'));
check(fake.status === 403, '3. Envoi avec un captcha faux refusé', `HTTP ${fake.status}`);

// 4. Captcha résolu (comme le fait le navigateur)
const t0 = Date.now();
const solution = await solveChallenge({ challenge, deriveKey, timeout: 30_000 });
const ms = Date.now() - t0;
check(Boolean(solution), '   Défi résolu par calcul', `${ms} ms`);
const token = Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
const good = await lead(token);
check(good.status === 200 && good.json.ok === true, '4. Envoi avec captcha valide accepté', `HTTP ${good.status} ${JSON.stringify(good.json)}`);
if (good.status === 502) console.log('   → Captcha OK, mais WordPress refuse le lead : LEAD_SHARED_SECRET (.env.local) ≠ NDC_LEAD_SECRET (wp-config.php).');
if (good.status === 503) console.log('   → Captcha OK, mais WordPress injoignable depuis le site (voir journalctl / pm2 logs).');
if (good.json.stored === false) console.log('   → Accepté mais NON transmis à WordPress (WORDPRESS_GRAPHQL_ENDPOINT absent ?).');

// 5. Rejeu
const replay = await lead(token);
check(replay.status === 403, '5. Même captcha réutilisé refusé', `HTTP ${replay.status}`);

console.log(failures ? red(`\n${failures} test(s) en échec.`) : green('\nCaptcha et formulaire : tout fonctionne.'));
if (good.status === 200) console.log(`Un lead « TEST captcha » (${EMAIL}) a été créé dans WordPress : le supprimer.`);
process.exit(failures ? 1 : 0);
