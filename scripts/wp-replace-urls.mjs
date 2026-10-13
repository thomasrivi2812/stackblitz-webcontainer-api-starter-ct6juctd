#!/usr/bin/env node
// Remplace l'ancienne adresse InstaWP par la nouvelle dans la base WordPress.
// ---------------------------------------------------------------------------
//   node wp-replace-urls.mjs --wp ~/back-ndc
//
// Étapes : compte les occurrences → sauvegarde la base (fichier .sql) →
// simulation (nombre de remplacements) → confirmation → remplacement de
// toutes les variantes (https, http, « https:\/\/ » de l'éditeur de blocs,
// adresse encodée) → vidage des caches → vérification → demande au site Next
// de se rafraîchir (secret lu dans wp-config.php).
//
// Options :
//   --wp <dossier>      dossier du WordPress (défaut ~/back-ndc)
//   --from <hôte>       ancien domaine (défaut ndc-site-test.instawp.site)
//   --to <hôte>         nouveau domaine (défaut core.nationdatacenter.fr)
//   --as <utilisateur>  lancer WP-CLI sous cet utilisateur (ex. www-data, via sudo)
//   --yes               ne pas demander de confirmation
//   --dry-run           compter et simuler seulement, ne rien modifier
//
// Utilise WP-CLI (commande « wp »), avec --precise : les données
// sérialisées (ACF, options) sont réécrites proprement.
// Retour arrière : wp --path=<dossier> db import <sauvegarde.sql>

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';

const c = (code) => (s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), yellow = c(33), bold = c(1);
const step = (s) => console.log(`\n${bold('▶ ' + s)}`);
const ok = (s) => console.log(`  ${green('✔')} ${s}`);
const warn = (s) => console.log(`  ${yellow('!')} ${s}`);
function fail(s) {
  console.error(`\n${red('✘ ' + s)}`);
  process.exit(1);
}

// ---------- options ----------
const o = { wp: path.join(os.homedir(), 'back-ndc'), from: 'ndc-site-test.instawp.site', to: 'core.nationdatacenter.fr' };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const k = argv[i];
  if (k === '--yes') o.yes = true;
  else if (k === '--dry-run') o.dryRun = true;
  else if (['--wp', '--from', '--to', '--as'].includes(k)) o[k.slice(2)] = argv[++i];
  else if (k === '-h' || k === '--help') {
    console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 23).join('\n'));
    process.exit(0);
  } else fail(`Option inconnue : ${k} (voir --help)`);
}
o.wp = path.resolve(o.wp.replace(/^~(?=$|\/)/, os.homedir()));
for (const k of ['from', 'to']) {
  o[k] = String(o[k] || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!/^[a-z0-9.-]+$/i.test(o[k])) fail(`--${k} doit être un nom de domaine (ex. core.nationdatacenter.fr)`);
}
if (o.from === o.to) fail('Ancien et nouveau domaine identiques.');

// ---------- WP-CLI ----------
function wp(args, { show = false, stdout = 'pipe' } = {}) {
  const full = [`--path=${o.wp}`, ...args];
  const [cmd, cmdArgs] = o.as ? ['sudo', ['-u', o.as, 'wp', ...full]] : ['wp', full];
  if (show) console.log(`  $ wp ${args.join(' ')}`);
  const r = spawnSync(cmd, cmdArgs, {
    encoding: 'utf8',
    stdio: ['inherit', stdout, 'pipe'],
    maxBuffer: 512 * 1024 * 1024,
  });
  if (r.error?.code === 'ENOENT') fail('WP-CLI introuvable : la commande « wp » n\'est pas installée.');
  if (r.error) fail(`WP-CLI : ${r.error.message}`);
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

// Variantes stockées par WordPress : normale, http, échappée JSON (éditeur de
// blocs, ACF), encodée (liens partagés, réglages d'extensions).
const pairs = [
  [`https://${o.from}`, `https://${o.to}`],
  [`http://${o.from}`, `https://${o.to}`],
  [`https:\\/\\/${o.from}`, `https:\\/\\/${o.to}`],
  [`http:\\/\\/${o.from}`, `https:\\/\\/${o.to}`],
  [`https%3A%2F%2F${o.from}`, `https%3A%2F%2F${o.to}`],
  [`http%3A%2F%2F${o.from}`, `https%3A%2F%2F${o.to}`],
];
const baseArgs = ['--all-tables', '--precise', '--skip-columns=guid', '--format=count'];

function countReplace(from, to, dry) {
  const r = wp(['search-replace', from, to, ...baseArgs, ...(dry ? ['--dry-run'] : [])]);
  if (!r.ok) fail(`search-replace a échoué pour « ${from} » :\n${r.err || r.out}`);
  const n = Number((r.out.match(/(\d+)\s*$/) || [])[1]);
  return Number.isFinite(n) ? n : 0;
}
// Occurrences restantes, hors colonne « guid » : identifiant interne des
// contenus, que WordPress demande de ne jamais modifier (non utilisé pour
// afficher les médias ni par le site).
function remaining() {
  const r = wp(['db', 'search', o.from, '--all-tables', '--table_column_color=', '--id_color=', '--match_color=']);
  if (!r.ok && !/no matches/i.test(r.err + r.out)) return null;
  let col = '';
  let n = 0;
  for (const line of r.out.split('\n')) {
    const head = line.match(/^[\w$]+:([\w$]+)$/);
    if (head) col = head[1];
    else if (line.trim() && col && col !== 'guid') n++;
  }
  return n;
}

// ---------- programme ----------
step('Contrôles');
if (!fs.existsSync(path.join(o.wp, 'wp-config.php'))) fail(`Pas de wp-config.php dans ${o.wp} (préciser --wp <dossier du WordPress>)`);
const home = wp(['option', 'get', 'home']);
if (!home.ok) fail(`WP-CLI ne peut pas lire le WordPress :\n${home.err}\n  Essayer --as www-data si c'est un problème de droits.`);
ok(`WordPress : ${home.out}`);
ok(`Remplacement : ${o.from}  →  ${o.to}`);

step('Occurrences de l\'ancienne adresse');
const before = remaining();
if (before === null) warn('Comptage impossible (wp db search) : on continue avec la simulation.');
else if (before === 0) {
  ok(`Aucune occurrence de ${o.from} : rien à faire.`);
  process.exit(0);
} else ok(`${before} occurrence(s) trouvée(s)`);

step('Simulation (rien n\'est modifié)');
let planned = 0;
for (const [f, t] of pairs) {
  const n = countReplace(f, t, true);
  planned += n;
  if (n) console.log(`  ${String(n).padStart(6)}  ${f}`);
}
ok(`${planned} remplacement(s) prévu(s)`);
if (o.dryRun) {
  console.log(`\n${green('Simulation terminée')} (--dry-run : rien n'a été modifié).`);
  process.exit(0);
}
if (!planned) {
  warn(`L'adresse apparaît encore, mais sous une autre forme : voir « wp --path=${o.wp} db search ${o.from} --all-tables »`);
  process.exit(0);
}

step('Sauvegarde de la base');
const stamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
const backup = path.join(os.homedir(), `ndc-wp-avant-remplacement-${stamp}.sql`);
// Export sur la sortie standard, écrit directement dans le fichier (aucune
// limite de taille ; fonctionne aussi avec --as, le fichier restant à nous).
const fd = fs.openSync(backup, 'w', 0o600); // contient les comptes et les leads
const exp = wp(['db', 'export', '-'], { stdout: fd });
fs.closeSync(fd);
if (!exp.ok || fs.statSync(backup).size < 1000) {
  fs.rmSync(backup, { force: true });
  fail(`Sauvegarde impossible, rien n'a été modifié :\n${exp.err}`);
}
ok(`Sauvegarde : ${backup} (${(fs.statSync(backup).size / 1e6).toFixed(1)} Mo)`);

if (!o.yes) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const a = (await rl.question(`\n  Remplacer ${planned} occurrence(s) maintenant ? (o/N) `)).trim().toLowerCase();
  rl.close();
  if (!['o', 'oui', 'y', 'yes'].includes(a)) {
    console.log('  Annulé : rien n\'a été modifié.');
    process.exit(0);
  }
}

step('Remplacement');
let done = 0;
for (const [f, t] of pairs) {
  const n = countReplace(f, t, false);
  done += n;
  if (n) ok(`${n}  ${f}  →  ${t}`);
}
ok(`${done} remplacement(s) effectué(s)`);

step('Caches WordPress');
wp(['cache', 'flush'], { show: true });
wp(['transient', 'delete', '--all'], { show: true });
wp(['rewrite', 'flush'], { show: true });

step('Vérification');
const after = remaining();
if (after === 0) ok(`Plus aucune occurrence de ${o.from}`);
else if (after === null) warn('Vérification impossible (wp db search)');
else warn(`${after} occurrence(s) restante(s), sous une forme non gérée (e-mail, texte brut…) : voir « wp --path=${o.wp} db search ${o.from} --all-tables »`);

step('Rafraîchissement du site Next');
const url = wp(['config', 'get', 'NDC_NEXT_URL']);
const secret = wp(['config', 'get', 'NDC_REVALIDATE_SECRET']);
if (!url.ok || !secret.ok || !url.out || !secret.out) {
  warn('NDC_NEXT_URL / NDC_REVALIDATE_SECRET absents de wp-config.php : le site se mettra à jour seul sous 5 minutes.');
} else {
  try {
    const r = await fetch(`${url.out.replace(/\/+$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: secret.out, path: '/' }),
      signal: AbortSignal.timeout(15000),
    });
    if (r.ok) ok(`Site rafraîchi (${url.out})`);
    else warn(`Le site a répondu ${r.status} : ${r.status === 401 ? 'secrets différents entre wp-config.php et .env.local' : 'voir les logs du front'}. Il se mettra à jour seul sous 5 minutes.`);
  } catch (e) {
    warn(`Site injoignable (${e.message}) : il se mettra à jour seul sous 5 minutes.`);
  }
}

console.log(`\n${green(bold('Terminé.'))}`);
console.log(`Retour arrière si besoin : wp --path=${o.wp} db import ${backup}`);
console.log('Vérifier les médias : ls ' + path.join(o.wp, 'wp-content/uploads') + '  (dossiers par année attendus)');
console.log('Une fois validé, supprimer la sauvegarde (elle contient les comptes et les leads) : rm ' + backup);
