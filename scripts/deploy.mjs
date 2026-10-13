#!/usr/bin/env node
// Déploiement du site NDC sur la machine, en une commande.
// ---------------------------------------------------------
// À lancer depuis la NOUVELLE version décompressée (le zip), en indiquant le
// dossier du site en service :
//
//   node scripts/deploy.mjs --front /chemin/du/front
//
// Étapes : vérifie la configuration (.env.local / .env.production) → copie le
// nouveau code dans <front>.new avec la configuration actuelle → npm ci +
// build (le site actuel reste en ligne pendant ce temps) → arrêt du site →
// bascule des dossiers → redémarrage → contrôle /api/health. Si le contrôle
// échoue, l'ancienne version est remise automatiquement.
//
// Options :
//   --front <dossier>   dossier du site en service (obligatoire)
//   --service <nom>     service systemd (sinon détecté : ndc-front, …)
//   --pm2 <nom>         process pm2 (au lieu de systemd)
//   --port <n>          port de Next pour le contrôle (défaut 3000)
//   --check             vérifie seulement la configuration, ne déploie rien
//   --rollback          remet la version précédente (<front>.ancien-…)
//
// Aucune dépendance : Node ≥ 20.9 suffit. Pour systemd, le script appelle
// « sudo systemctl » (mot de passe demandé si besoin).

import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILES = ['.env.production', '.env.local', '.env'];
const SKIP = new Set(['node_modules', '.next', '.git', ...ENV_FILES]);

// ---------- petits outils ----------
const c = (code) => (s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), yellow = c(33), bold = c(1);
const step = (s) => console.log(`\n${bold('▶ ' + s)}`);
const ok = (s) => console.log(`  ${green('✔')} ${s}`);
const warn = (s) => console.log(`  ${yellow('!')} ${s}`);
function fail(s) {
  console.error(`\n${red('✘ ' + s)}`);
  process.exit(1);
}
function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit', ...opts });
  return r.status === 0;
}
function quiet(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
}

function args() {
  const a = process.argv.slice(2);
  const o = { port: 3000 };
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (k === '--check') o.check = true;
    else if (k === '--rollback') o.rollback = true;
    else if (['--front', '--service', '--pm2', '--port'].includes(k)) o[k.slice(2)] = a[++i];
    else if (k === '-h' || k === '--help') {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 25).join('\n'));
      process.exit(0);
    } else fail(`Option inconnue : ${k} (voir --help)`);
  }
  if (!o.front) fail('Indique le dossier du site en service : --front /chemin/du/front');
  o.front = path.resolve(o.front.replace(/\/+$/, ''));
  o.port = Number(o.port) || 3000;
  return o;
}

// ---------- configuration (.env) ----------
function readEnv(dir) {
  const vars = {};
  const files = [];
  // Ordre de priorité de Next en production : .env.production.local >
  // .env.local > .env.production > .env (le premier trouvé l'emporte).
  for (const f of ['.env.production.local', '.env.local', '.env.production', '.env']) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    files.push(f);
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in vars)) vars[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { vars, files };
}

function checkEnv(dir) {
  step('Vérification de la configuration');
  const { vars, files } = readEnv(dir);
  if (!files.length) fail(`Aucun fichier .env.local / .env.production dans ${dir}`);
  ok(`Fichier(s) lu(s) : ${files.join(', ')}`);

  let errors = 0;
  const need = {
    WORDPRESS_GRAPHQL_ENDPOINT: 'adresse GraphQL du WordPress',
    REVALIDATE_SECRET: 'secret de mise à jour immédiate (= NDC_REVALIDATE_SECRET du wp-config)',
    LEAD_SHARED_SECRET: 'secret des formulaires (= NDC_LEAD_SECRET du wp-config)',
  };
  for (const [k, label] of Object.entries(need)) {
    const v = vars[k];
    if (!v) {
      console.log(`  ${red('✘')} ${k} manquant — ${label}`);
      errors++;
    } else if (/[<>\s]/.test(v)) {
      console.log(`  ${red('✘')} ${k} contient des chevrons < > ou des espaces : à retirer`);
      errors++;
    } else if (k.endsWith('SECRET') && (v.length < 32 || /change-moi/.test(v))) {
      console.log(`  ${red('✘')} ${k} trop court ou valeur d'exemple : générer un vrai secret`);
      errors++;
    } else ok(`${k} présent${k.endsWith('SECRET') ? ` (${v.length} caractères)` : ` : ${v}`}`);
  }
  const ep = vars.WORDPRESS_GRAPHQL_ENDPOINT || '';
  if (/instawp/i.test(ep)) warn('WORDPRESS_GRAPHQL_ENDPOINT pointe encore vers InstaWP');
  if (ep && !/^https:\/\/.+\/graphql\/?$/.test(ep)) warn('WORDPRESS_GRAPHQL_ENDPOINT devrait être https://…/graphql');
  if (vars.NODE_EXTRA_CA_CERTS && !/instawp/i.test(ep)) warn('NODE_EXTRA_CA_CERTS ne sert qu\'à InstaWP : peut être retiré');
  if (vars.WP_LIVE === '1') warn('WP_LIVE=1 : aucun cache, site plus lent (mettre 0 en temps normal)');
  if (errors) fail(`${errors} réglage(s) à corriger avant de déployer.`);
  return vars;
}

async function checkWordPress(endpoint) {
  step('Accès au WordPress');
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ generalSettings { title } }' }),
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json();
    if (!j?.data?.generalSettings) throw new Error(`réponse inattendue (HTTP ${r.status})`);
    ok(`WordPress répond : « ${j.data.generalSettings.title} »`);
  } catch (e) {
    fail(`WordPress injoignable (${endpoint}) : ${e.message}\n  Le build échouerait : vérifier l'adresse et que le WordPress est en ligne.`);
  }
}

// ---------- arrêt / démarrage du site ----------
function detectRunner(o) {
  if (o.pm2) return { kind: 'pm2', name: o.pm2 };
  if (o.service) return { kind: 'systemd', name: o.service };
  const units = quiet('systemctl list-unit-files --type=service --no-legend');
  for (const name of ['ndc-front', 'ndc', 'nextjs', 'next', 'front']) {
    if (new RegExp(`^${name}\\.service\\s`, 'm').test(units)) return { kind: 'systemd', name };
  }
  try {
    const list = JSON.parse(quiet('pm2 jlist') || '[]');
    const p = list.find((x) => x.pm2_env?.pm_cwd && path.resolve(x.pm2_env.pm_cwd) === o.front);
    if (p) return { kind: 'pm2', name: p.name };
  } catch {
    /* pm2 absent */
  }
  fail('Impossible de savoir comment le site est lancé : préciser --service <nom systemd> ou --pm2 <nom>.');
}
const stop = (r) => (r.kind === 'pm2' ? run(`pm2 stop ${r.name}`) : run(`sudo systemctl stop ${r.name}`));
const start = (r) => (r.kind === 'pm2' ? run(`pm2 start ${r.name}`) : run(`sudo systemctl start ${r.name}`));

async function health(port) {
  const url = `http://localhost:${port}/api/health?deep=1`;
  for (let i = 0; i < 45; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const j = await r.json();
      if (j.ok) return true;
      if (j.wordpress === false) {
        warn('Le site démarre mais ne joint pas WordPress');
        return false;
      }
    } catch {
      /* pas encore démarré */
    }
    await new Promise((res) => setTimeout(res, 2000));
  }
  return false;
}

function previousVersions(front) {
  const dir = path.dirname(front);
  const base = path.basename(front) + '.ancien-';
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(base))
    .sort()
    .map((f) => path.join(dir, f));
}

// ---------- programme ----------
const o = args();
const [maj, min] = process.versions.node.split('.').map(Number);
if (maj < 20 || (maj === 20 && min < 9)) fail(`Node ${process.versions.node} : il faut Node ≥ 20.9 (22 recommandé).`);
if (!fs.existsSync(o.front)) fail(`Dossier introuvable : ${o.front}`);

if (o.rollback) {
  const prev = previousVersions(o.front).pop();
  if (!prev) fail('Aucune version précédente (<front>.ancien-…) à remettre.');
  const runner = detectRunner(o);
  step(`Retour à ${path.basename(prev)}`);
  stop(runner);
  fs.renameSync(o.front, `${o.front}.annule-${stamp()}`);
  fs.renameSync(prev, o.front);
  start(runner);
  (await health(o.port)) ? ok('Version précédente en ligne.') : fail('Le site ne répond pas : voir journalctl / pm2 logs.');
  process.exit(0);
}

if (path.resolve(SRC) === o.front) fail('Lancer le script depuis la NOUVELLE version (le zip décompressé), pas depuis le dossier en service.');

const vars = checkEnv(o.front);
await checkWordPress(vars.WORDPRESS_GRAPHQL_ENDPOINT);
if (o.check) {
  console.log(`\n${green('Configuration correcte.')} (mode --check : rien n'a été déployé)`);
  process.exit(0);
}
const runner = detectRunner(o);
ok(`Site lancé par ${runner.kind} : ${runner.name}`);

function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
}

// 1. Préparer la nouvelle version à côté (le site actuel reste en ligne)
const NEW = `${o.front}.new`;
step(`Préparation de la nouvelle version dans ${NEW}`);
fs.rmSync(NEW, { recursive: true, force: true });
fs.cpSync(SRC, NEW, {
  recursive: true,
  filter: (p) => !SKIP.has(path.basename(p)) || path.dirname(p) !== SRC,
});
for (const f of [...ENV_FILES, '.env.production.local']) {
  const p = path.join(o.front, f);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(NEW, f));
    ok(`Configuration reprise : ${f}`);
  }
}

// 2. Installer et compiler
step('Installation des dépendances (npm ci)');
if (!run('npm ci --no-audit --no-fund', { cwd: NEW })) fail(`npm ci a échoué. Le site actuel n'a pas été touché.`);
step('Compilation (npm run build) — le site actuel reste en ligne');
if (!run('npm run build', { cwd: NEW })) fail(`Le build a échoué (voir ci-dessus). Le site actuel n'a pas été touché.`);

// Mêmes propriétaire et groupe que la version en service (le service peut
// tourner sous un autre utilisateur, qui doit pouvoir écrire dans .next/cache).
const st = fs.statSync(o.front);
if (typeof process.getuid === 'function' && (st.uid !== process.getuid() || st.gid !== process.getgid())) {
  step('Droits des fichiers');
  run(`sudo chown -R ${st.uid}:${st.gid} "${NEW}"`);
}

// 3. Bascule
const OLD = `${o.front}.ancien-${stamp()}`;
step('Bascule vers la nouvelle version');
if (!stop(runner)) fail('Arrêt du site impossible : rien n\'a été changé.');
fs.renameSync(o.front, OLD);
fs.renameSync(NEW, o.front);
ok(`Ancienne version conservée : ${OLD}`);
start(runner);

// 4. Contrôle, retour arrière automatique si besoin
step(`Contrôle http://localhost:${o.port}/api/health`);
if (await health(o.port)) {
  ok('Site en ligne et relié à WordPress.');
  const old = previousVersions(o.front);
  for (const p of old.slice(0, -2)) fs.rmSync(p, { recursive: true, force: true }); // garde les 2 dernières
  console.log(`\n${green(bold('Déploiement terminé.'))}`);
  console.log(`Retour arrière si besoin : node scripts/deploy.mjs --front ${o.front} --rollback`);
} else {
  warn('Le nouveau site ne répond pas correctement : retour à l\'ancienne version');
  stop(runner);
  fs.renameSync(o.front, `${o.front}.echec-${stamp()}`);
  fs.renameSync(OLD, o.front);
  start(runner);
  fail(`Ancienne version remise en ligne. Version en échec conservée pour analyse : ${o.front}.echec-…\n  Logs : ${runner.kind === 'pm2' ? `pm2 logs ${runner.name}` : `journalctl -u ${runner.name} -n 50`}`);
}
