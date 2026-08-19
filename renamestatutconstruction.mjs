#!/usr/bin/env node
/**
 * rename-statut-construction.mjs
 * ------------------------------------------------------------------
 * Renomme le libellé du statut « construction » des data centers.
 *
 *   FR : « En cours »   → « En construction »
 *   EN : « In progress » → « Under construction »
 *
 * Contexte (site NDC, Next.js + next-intl + WordPress headless) :
 *  - La valeur ACF stockée dans WordPress est la CLÉ `construction`
 *    (cf. `statut: ['construction']`). Elle ne change pas.
 *  - Le libellé affiché vient des dictionnaires next-intl, dans DEUX
 *    namespaces par locale : `datacenters.statutConstruction` (cards,
 *    fiche site, menu réseau du header) et `map.statutConstruction`
 *    (popups de la carte Leaflet).
 *  - Un libellé de repli peut aussi être codé en dur dans `lib/`,
 *    `components/` ou `app/` : le script le détecte et le corrige.
 *  - Si le champ ACF est un select avec des choix libellés côté WP,
 *    passe `--acf <dossier acf-json>` pour corriger aussi le choix.
 *
 * Usage :
 *   node scripts/rename-statut-construction.mjs               # applique
 *   node scripts/rename-statut-construction.mjs --dry-run     # simule
 *   node scripts/rename-statut-construction.mjs --root ../ndc # autre racine
 *   node scripts/rename-statut-construction.mjs --acf ../wp/.../acf-json
 *   node scripts/rename-statut-construction.mjs --fr "En construction" --en "Under construction"
 *
 * Aucune dépendance. Node >= 18. Idempotent : relançable sans effet de bord.
 * Les JSON sont modifiés par remplacement ciblé (pas de reformatage du fichier).
 */

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// ─── Arguments ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { root: process.cwd(), acf: null, dryRun: false, verbose: false };
  const labels = {
    fr: { from: ['En cours'], to: 'En construction' },
    en: { from: ['In progress'], to: 'Under construction' },
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run' || a === '-n') out.dryRun = true;
    else if (a === '--verbose' || a === '-v') out.verbose = true;
    else if (a === '--root') out.root = path.resolve(argv[++i]);
    else if (a === '--acf') out.acf = path.resolve(argv[++i]);
    else if (a === '--fr') labels.fr.to = argv[++i];
    else if (a === '--en') labels.en.to = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(HELP);
      process.exit(0);
    } else {
      console.error(`Argument inconnu : ${a}\n`);
      console.log(HELP);
      process.exit(1);
    }
  }
  out.labels = labels;
  return out;
}

const HELP = `
Usage : node scripts/rename-statut-construction.mjs [options]

  -n, --dry-run        Simule : affiche les changements sans écrire.
  -v, --verbose        Détaille les fichiers inspectés.
      --root <dir>     Racine du projet Next.js (défaut : dossier courant).
      --acf <dir>      Dossier acf-json du thème/plugin WordPress (optionnel).
      --fr <libellé>   Libellé FR cible (défaut : "En construction").
      --en <libellé>   Libellé EN cible (défaut : "Under construction").
  -h, --help           Cette aide.
`;

// ─── Constantes ───────────────────────────────────────────────────────────

/** Clé i18n du libellé, présente dans plusieurs namespaces. */
const I18N_KEY = 'statutConstruction';

/** Dossiers de code source scannés pour les libellés codés en dur. */
const SOURCE_DIRS = ['lib', 'components', 'app'];
const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', 'coverage']);

/** Valeur ACF (clé technique) concernée — jamais renommée, seulement son libellé. */
const ACF_VALUE = 'construction';

// ─── Utilitaires ──────────────────────────────────────────────────────────

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Échappe une chaîne pour l'insérer telle quelle dans un littéral JSON. */
const jsonEscape = (s) => JSON.stringify(s).slice(1, -1);

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walk(path.join(dir, e.name));
    } else if (e.isFile()) {
      yield path.join(dir, e.name);
    }
  }
}

const changes = []; // { file, before, after, where }
const warnings = [];

function record(file, root, where, before, after) {
  changes.push({ file: path.relative(root, file), where, before, after });
}

// ─── 1. Dictionnaires next-intl (messages/*.json) ─────────────────────────

/**
 * Remplace la valeur de chaque occurrence de "statutConstruction": "…"
 * par un remplacement ciblé, ce qui préserve l'indentation, l'ordre des
 * clés et le reste du fichier au caractère près (pas de JSON.stringify).
 */
async function patchMessages(root, labels, opts) {
  const dir = path.join(root, 'messages');
  if (!(await exists(dir))) {
    warnings.push(`Dossier introuvable : ${path.relative(root, dir) || 'messages'} — dictionnaires non traités.`);
    return;
  }

  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  if (files.length === 0) warnings.push('Aucun fichier .json dans messages/.');

  for (const file of files) {
    const full = path.join(dir, file);
    const locale = path.basename(file, '.json').toLowerCase();
    const spec = labels[locale];

    if (!spec) {
      warnings.push(`Locale « ${locale} » non gérée (${file}) — aucun libellé cible défini, fichier ignoré.`);
      continue;
    }

    const original = await readFile(full, 'utf8');
    let content = original;
    let hits = 0;

    // Toutes les occurrences de la clé, quel que soit le namespace.
    const re = new RegExp(`("${escapeRe(I18N_KEY)}"\\s*:\\s*")((?:[^"\\\\]|\\\\.)*)(")`, 'g');
    content = content.replace(re, (whole, head, value, tail) => {
      if (value === jsonEscape(spec.to)) return whole; // déjà à jour → idempotent
      if (!spec.from.includes(value)) {
        warnings.push(
          `${file} : valeur inattendue pour ${I18N_KEY} → « ${value} » (attendu « ${spec.from.join(' » ou « ')} »). Remplacée quand même.`,
        );
      }
      hits++;
      record(full, root, `${I18N_KEY} (${locale})`, value, spec.to);
      return `${head}${jsonEscape(spec.to)}${tail}`;
    });

    if (hits === 0) {
      if (original.includes(`"${I18N_KEY}"`)) {
        if (opts.verbose) console.log(`  · ${file} : déjà à jour.`);
      } else {
        warnings.push(`${file} : clé "${I18N_KEY}" absente.`);
      }
      continue;
    }

    // Garde-fou : le résultat doit rester du JSON valide.
    try {
      JSON.parse(content);
    } catch (err) {
      throw new Error(`${file} : le remplacement produit un JSON invalide (${err.message}). Fichier non modifié.`);
    }

    if (!opts.dryRun) await writeFile(full, content, 'utf8');
  }
}

// ─── 2. Libellés codés en dur dans le code source ─────────────────────────

async function patchSources(root, labels, opts) {
  const needles = Object.values(labels).flatMap((l) => l.from.map((from) => ({ from, to: l.to })));

  for (const rel of SOURCE_DIRS) {
    const dir = path.join(root, rel);
    if (!(await exists(dir))) continue;

    for await (const full of walk(dir)) {
      if (!SOURCE_EXT.has(path.extname(full))) continue;

      const original = await readFile(full, 'utf8');
      let content = original;

      for (const { from, to } of needles) {
        // Uniquement dans un littéral de chaîne ('…', "…" ou `…`), pour ne pas
        // toucher un commentaire ou du texte rédactionnel.
        const re = new RegExp(`(['"\`])${escapeRe(from)}\\1`, 'g');
        content = content.replace(re, (whole, quote) => {
          record(full, root, 'libellé codé en dur', from, to);
          return `${quote}${to}${quote}`;
        });
      }

      if (content !== original && !opts.dryRun) await writeFile(full, content, 'utf8');
      if (opts.verbose && content === original) console.log(`  · ${path.relative(root, full)} : rien à faire.`);
    }
  }
}

// ─── 3. Choix ACF côté WordPress (optionnel) ──────────────────────────────

/**
 * Dans un acf-json/group_*.json, un select stocke ses options sous
 * "choices": { "construction": "En cours", … }. Seul le LIBELLÉ change ;
 * la clé `construction` reste identique, sinon toutes les fiches déjà
 * saisies perdraient leur statut.
 */
async function patchAcf(dir, labels, opts) {
  if (!(await exists(dir))) {
    warnings.push(`Dossier ACF introuvable : ${dir} — ignoré.`);
    return;
  }

  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const full = path.join(dir, file);
    const original = await readFile(full, 'utf8');
    let content = original;

    const re = new RegExp(`("${escapeRe(ACF_VALUE)}"\\s*:\\s*")((?:[^"\\\\]|\\\\.)*)(")`, 'g');
    content = content.replace(re, (whole, head, value, tail) => {
      if (value === jsonEscape(labels.fr.to)) return whole;
      if (!labels.fr.from.includes(value)) return whole; // ne touche que le libellé attendu
      record(full, dir, 'choix ACF', value, labels.fr.to);
      return `${head}${jsonEscape(labels.fr.to)}${tail}`;
    });

    if (content === original) continue;

    try {
      JSON.parse(content);
    } catch (err) {
      throw new Error(`${file} : JSON ACF invalide après remplacement (${err.message}). Fichier non modifié.`);
    }

    if (!opts.dryRun) await writeFile(full, content, 'utf8');
  }
}

// ─── Exécution ────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { labels } = opts;

  console.log(`\n${opts.dryRun ? '[SIMULATION]' : '[APPLICATION]'} Renommage du libellé de statut « ${ACF_VALUE} »`);
  console.log(`  Racine  : ${opts.root}`);
  console.log(`  FR      : « ${labels.fr.from.join(' » / « ')} » → « ${labels.fr.to} »`);
  console.log(`  EN      : « ${labels.en.from.join(' » / « ')} » → « ${labels.en.to} »`);
  if (opts.acf) console.log(`  ACF     : ${opts.acf}`);
  console.log('');

  await patchMessages(opts.root, labels, opts);
  await patchSources(opts.root, labels, opts);
  if (opts.acf) await patchAcf(opts.acf, labels, opts);

  if (changes.length === 0) {
    console.log('Aucun changement : les libellés sont déjà à jour.');
  } else {
    console.log(`${changes.length} remplacement(s) :\n`);
    for (const c of changes) {
      console.log(`  ${c.file}`);
      console.log(`    ${c.where} : « ${c.before} » → « ${c.after} »`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} avertissement(s) :`);
    for (const w of warnings) console.log(`  ! ${w}`);
  }

  console.log(
    opts.dryRun
      ? '\nSimulation terminée — aucun fichier écrit. Relance sans --dry-run pour appliquer.'
      : '\nTerminé. Vérifie le diff (git diff), puis relance le build.',
  );
}

main().catch((err) => {
  console.error(`\nÉchec : ${err.message}`);
  process.exit(1);
});
