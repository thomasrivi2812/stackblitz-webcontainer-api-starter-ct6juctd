// Moteur de recherche de l'assistant du site.
// -------------------------------------------
// Recherche lexicale locale : aucune IA, aucun appel réseau, aucune donnée
// qui sort du navigateur. Le classement est un BM25 pondéré par champ —
// l'algorithme des moteurs de recherche documentaires — plutôt qu'une somme
// de recouvrements de mots.
//
// POURQUOI BM25 PLUTÔT QU'UN COMPTAGE DE MOTS
//   L'IDF donne à chaque terme un poids inverse à sa fréquence dans la base.
//   « data », « center » ou « site » apparaissent dans presque toutes les
//   entrées : ils ne discriminent rien et pèsent donc peu. « secnumcloud »,
//   « altarea » ou « geothermie » n'apparaissent qu'une fois : ils identifient
//   l'entrée à eux seuls. Le moteur précédent traitait tous les mots à
//   égalité, d'où 37 % de réponses assurées mais fausses sur un jeu de test
//   de 70 questions de visiteurs — le pire défaut possible sur un site B2B.
//
// TROIS ISSUES, PAS DEUX
//   Le score est ramené dans [0,1] par rapport au score parfait théorique de
//   la question posée, ce qui rend un seuil absolu comparable d'une question
//   à l'autre. Trois bandes de confiance :
//     answer   — une entrée se détache nettement : on répond ;
//     clarify  — deux ou trois entrées se tiennent : on demande laquelle ;
//     none     — rien de pertinent : on passe la main à un humain.
//   Le moteur précédent n'avait que « répondre » ou « je ne sais pas », et
//   tranchait les égalités par l'ordre de déclaration des entrées.

import type { KnowledgeEntry } from './chatbot-knowledge';

/* ------------------------------------------------------------------ *
 *  Normalisation
 * ------------------------------------------------------------------ */

/**
 * Minuscules, accents retirés, ponctuation ramenée à des espaces.
 * Les traits d'union et apostrophes DOIVENT devenir des espaces : sans cela
 * « êtes-vous » ne rencontrait jamais l'expression « etes vous » de la base,
 * et les formes interrogatives inversées ne déclenchaient rien.
 */
export function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'‘`\-–—_/]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mots vides : uniquement les mots outils présents partout. Les interrogatifs
// (ou, quel, combien, comment, pourquoi) sont VOLONTAIREMENT conservés — ils
// portent l'intention, et l'IDF leur donnera le poids qu'ils méritent.
const STOP = new Set([
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd', 'et', 'a', 'au',
  'aux', 'en', 'dans', 'sur', 'pour', 'par', 'avec', 'sans', 'que', 'ce',
  'cette', 'ces', 'se', 'sa', 'son', 'ses', 'est', 'sont', 'etre', 'ete', 'ne',
  'pas', 'y', 'il', 'elle', 'ils', 'elles', 'on', 'me', 'ma', 'mes', 'mon',
  'te', 'ta', 'tes', 'ton', 'leur', 'leurs', 'si', 'ni', 'the', 'of', 'to',
  'in', 'on', 'for', 'with', 'and', 'or', 'is', 'are', 'was', 'be', 'been',
  'an', 'it', 'this', 'that', 'there', 'as', 'at', 'by', 'from',
]);

// Suffixes français du plus long au plus court, après retrait des accents.
const SUFFIXES = [
  'issements', 'issement', 'ationnels', 'ationnel', 'atrices', 'atrice',
  'ateurs', 'ateur', 'ations', 'ation', 'ements', 'ement', 'ances', 'ance',
  'ences', 'ence', 'ismes', 'isme', 'istes', 'iste', 'euses', 'euse',
  'trices', 'trice', 'eurs', 'ables', 'able', 'ibles', 'ible', 'ites', 'ite',
  'ants', 'antes', 'ante', 'ant', 'ents', 'entes', 'ente', 'elles', 'elle',
  'eaux', 'eau', 'aux', 'ales', 'ale', 'els', 'ives', 'ive', 'ifs', 'if',
  'ies', 'ie', 'ees', 'ee', 'es', 'er', 'ir', 's', 'x',
];

/**
 * Racinisation légère : un seul suffixe retiré, jamais en dessous de quatre
 * lettres, puis troncature à six. La troncature réunit les familles que le
 * retrait de suffixe laisse divergentes (« certification » → « certific »,
 * « certifiés » → « certif »). Elle remplace la comparaison des quatre
 * premières lettres du moteur précédent, qui appariait « certification » et
 * « certain », ou « puissance » et « puits ».
 */
export function stem(w: string): string {
  if (w.length <= 4) return w;
  let out = w;
  for (const suf of SUFFIXES) {
    // Le pluriel en « s » peut se retirer jusqu'à quatre lettres restantes
    // (« sites » → « site »). Un suffixe plus long en exige cinq : sans cette
    // réserve, « certifs » perdait « ifs » et devenait « cert », qui ne
    // rencontrait plus « certifications ».
    const floor = suf.length <= 1 ? 4 : 5;
    if (out.length - suf.length >= floor && out.endsWith(suf)) {
      out = out.slice(0, -suf.length);
      break;
    }
  }
  return out.length > 6 ? out.slice(0, 6) : out;
}

export function tokens(s: string): string[] {
  return norm(s).split(' ').filter((w) => w.length > 1 && !STOP.has(w));
}

function stems(s: string): string[] {
  return tokens(s).map(stem);
}

/* ------------------------------------------------------------------ *
 *  Index
 * ------------------------------------------------------------------ */

// Poids par champ. Un mot-déclencheur explicite vaut plus qu'une occurrence
// noyée dans le corps de la réponse. Ces valeurs, comme les seuils plus bas,
// ont été calées sur un jeu de 70 questions de visiteurs, puis validées en
// n'apprenant que sur une moitié et en mesurant sur l'autre.
const W_KEYWORD = 5;
const W_QUESTION = 2;
const W_ANSWER = 1.5;

const K1 = 1.2;
const B = 0.55;
const PHRASE_W = 0.9;

type Doc = { tf: Map<string, number>; len: number; phrases: string[]; boost: number };

export type KnowledgeIndex = {
  entries: KnowledgeEntry[];
  docs: Doc[];
  idf: Map<string, number>;
  /** Racines connues, classées par longueur : sert au rattrapage des fautes. */
  vocab: string[];
  avgLen: number;
  n: number;
};

export function buildIndex(entries: KnowledgeEntry[]): KnowledgeIndex {
  const docs: Doc[] = entries.map((e) => {
    const tf = new Map<string, number>();
    const bump = (text: string, w: number) => {
      for (const t of stems(text)) tf.set(t, (tf.get(t) || 0) + w);
    };
    // Une expression de plusieurs mots ne nourrit PAS le sac de mots : elle
    // ne compte que comme expression. Sans cette règle, l'entrée « réseau »,
    // qui porte « combien de sites » et « vous etes ou », récoltait au poids
    // fort les mots « combien », « vous » et « etes » — et captait toute
    // question interrogative, quel qu'en soit le sujet.
    const phrases: string[] = [];
    for (const k of e.keywords || []) {
      const nk = norm(k);
      if (nk.includes(' ')) phrases.push(nk);
      else bump(k, W_KEYWORD);
    }
    bump(e.question || '', W_QUESTION);
    bump(e.answer || '', W_ANSWER);

    let len = 0;
    for (const v of tf.values()) len += v;
    return { tf, len, phrases, boost: e.boost ?? 1 };
  });

  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);

  const n = docs.length || 1;
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / n || 1;
  const idf = new Map<string, number>();
  for (const [t, k] of df) idf.set(t, Math.log(1 + (n - k + 0.5) / (k + 0.5)));

  return { entries, docs, idf, vocab: [...df.keys()], avgLen, n };
}

/**
 * Vrai si les deux mots sont à une seule modification l'un de l'autre
 * (insertion, suppression ou substitution). Sort au premier écart de trop :
 * inutile de calculer une distance complète pour répondre à « au plus un ».
 */
function within1(a: string, b: string): boolean {
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let diff = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++diff > 1) return false;
    if (la === lb) { i++; j++; }
    else if (la > lb) i++;
    else j++;
  }
  return diff + (la - i) + (lb - j) <= 1;
}

/**
 * Termes de la question, avec leur poids. Une racine inconnue du corpus est
 * rattrapée sur la racine connue la plus proche à une faute près, à poids
 * réduit : « renne » retrouve « rennes », « coment » retrouve « comment ».
 * Sans ce rattrapage, une seule lettre de travers suffisait à ne rien
 * renvoyer du tout.
 */
const FUZZY_W = 0.75;

/**
 * Passerelles de vocabulaire du métier. Un visiteur écrit « refroidissez »,
 * le site publie « free cooling » et « PUE » : aucun mot commun, donc aucune
 * rencontre possible par la seule racinisation. Chaque famille est ajoutée à
 * la question à poids réduit, sans compter dans le score parfait — elle peut
 * donc faire remonter la bonne entrée sans jamais faire baisser les autres.
 *
 * Table volontairement courte et sûre : n'y mettre que des synonymes stricts
 * du domaine, jamais des mots simplement voisins.
 */
const SYNONYM_W = 0.55;
const SYNONYMS: string[][] = [
  ['refroidissement', 'refroidir', 'climatisation', 'cooling', 'free cooling', 'thermique', 'pue'],
  ['disponibilite', 'sla', 'uptime', 'garantie', 'redondance', 'tier', 'continuite'],
  ['prix', 'tarif', 'cout', 'devis', 'budget', 'facturation'],
  ['energie', 'electricite', 'electrique', 'alimentation', 'onduleur', 'groupe electrogene'],
  ['securite', 'surete', 'protection', 'incendie', 'acces', 'acceder', 'badge', 'horaire'],
  ['souverainete', 'souverain', 'cloud act', 'rgpd', 'juridiction'],
  ['baie', 'rack', 'armoire', 'u'],
  ['salarie', 'effectif', 'employe', 'collaborateur'],
  ['metier', 'profession', 'equipe', 'exploitation', 'technicien'],
  ['visite', 'visiter', 'portes ouvertes', 'rendez vous'],
  ['brochure', 'plaquette', 'documentation', 'livret', 'fiche technique'],
  ['connectivite', 'operateur', 'fibre', 'reseau telecom', 'carrier'],
  ['certification', 'certifie', 'norme', 'referentiel', 'label', 'audit'],
  ['ecologie', 'environnement', 'carbone', 'rse', 'ecoresponsable', 'chaleur fatale'],
];

/** stem → stems des autres membres de sa famille. */
const SYNONYM_MAP = (() => {
  const m = new Map<string, string[]>();
  for (const family of SYNONYMS) {
    const all = family.flatMap((w) => norm(w).split(' ').filter((x) => x.length > 1).map(stem));
    const uniq = [...new Set(all)];
    for (const t of uniq) {
      const others = uniq.filter((x) => x !== t);
      m.set(t, [...(m.get(t) || []), ...others]);
    }
  }
  return m;
})();

function queryTerms(index: KnowledgeIndex, query: string): { t: string; w: number }[] {
  const seen = new Map<string, number>();
  for (const t of stems(query)) {
    if (seen.has(t)) continue;
    if (index.idf.has(t)) { seen.set(t, 1); continue; }
    if (t.length < 4) { seen.set(t, 1); continue; }
    let near = '';
    let bestIdf = -1;
    for (const v of index.vocab) {
      if (Math.abs(v.length - t.length) > 1 || !within1(t, v)) continue;
      const score = index.idf.get(v) ?? 0;
      if (score > bestIdf) { bestIdf = score; near = v; }
    }
    if (near && !seen.has(near)) seen.set(near, FUZZY_W);
    else if (!near) seen.set(t, 1);
  }
  // Élargissement par familles de vocabulaire, à poids réduit.
  for (const [t] of [...seen]) {
    for (const alt of SYNONYM_MAP.get(t) || []) {
      if (!seen.has(alt)) seen.set(alt, -SYNONYM_W); // négatif = marqueur « hors score parfait »
    }
  }
  return [...seen].map(([t, w]) => ({ t, w }));
}

/* ------------------------------------------------------------------ *
 *  Score
 * ------------------------------------------------------------------ */

export type Scored = { entry: KnowledgeEntry; score: number };

export function scoreAll(index: KnowledgeIndex, query: string): Scored[] {
  const q = norm(query);
  const terms = queryTerms(index, query);
  if (!terms.length) return [];

  // Score parfait théorique : chaque terme de la question saturerait le
  // document. Diviser par lui ramène le score dans [0,1] quelle que soit la
  // longueur de la question — un seuil absolu redevient comparable.
  // Les termes ajoutés par élargissement (poids négatif, marqueur) ne
  // comptent pas dans le score parfait : ils peuvent aider une entrée à
  // remonter, jamais pénaliser celles qui répondent déjà mot pour mot.
  let ideal = 0;
  for (const { t, w } of terms) {
    if (w < 0) continue;
    ideal += w * (index.idf.get(t) ?? Math.log(1 + index.n)) * (K1 + 1);
  }
  if (ideal <= 0) return [];

  const out: Scored[] = [];
  for (let i = 0; i < index.docs.length; i++) {
    const d = index.docs[i];
    let s = 0;
    for (const { t, w } of terms) {
      const f = d.tf.get(t);
      if (!f) continue;
      const idf = index.idf.get(t) ?? 0;
      s += Math.abs(w) * idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * (d.len / index.avgLen)));
    }
    // Bonus d'expression pondéré par la rareté : « data center », présent
    // partout, ne rapporte presque rien ; « secteur public » rapporte
    // beaucoup. Aucune liste à maintenir, l'IDF fait le tri.
    for (const p of d.phrases) {
      if (!q.includes(p)) continue;
      let w = 0;
      for (const t of stems(p)) w += index.idf.get(t) ?? 0;
      s += PHRASE_W * w;
    }
    if (s > 0) out.push({ entry: index.entries[i], score: (s / ideal) * d.boost });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

/* ------------------------------------------------------------------ *
 *  Décision
 * ------------------------------------------------------------------ */

// Bandes de confiance, calées sur 70 questions de visiteurs puis validées
// en n'apprenant que sur une moitié du jeu et en mesurant sur l'autre.
const SURE_MIN = 0.85;     // au-dessus : on répond, même si une autre entrée suit de près
const ANSWER_MIN = 0.34;   // au-dessus : on répond si l'écart au second est net
const CLARIFY_MIN = 0.17;  // au-dessus : l'entrée est proposée comme piste
const MARGIN = 1.45;       // écart minimal entre le premier et le second

export type MatchResult =
  | { kind: 'answer'; entry: KnowledgeEntry; ranked: Scored[] }
  | { kind: 'clarify'; options: KnowledgeEntry[]; ranked: Scored[] }
  | { kind: 'none'; ranked: Scored[] };

export type MatchOptions = { sureMin?: number; answerMin?: number; clarifyMin?: number; margin?: number };

export function match(index: KnowledgeIndex, query: string, opts: MatchOptions = {}): MatchResult {
  const sureMin = opts.sureMin ?? SURE_MIN;
  const answerMin = opts.answerMin ?? ANSWER_MIN;
  const clarifyMin = opts.clarifyMin ?? CLARIFY_MIN;
  const margin = opts.margin ?? MARGIN;

  const ranked = scoreAll(index, query);
  const best = ranked[0];
  const second = ranked[1];

  if (!best || best.score < clarifyMin) return { kind: 'none', ranked };
  // Couverture franche : inutile de faire choisir le visiteur parce qu'une
  // seconde entrée suit de près, la première répond déjà bien.
  if (best.score >= sureMin) return { kind: 'answer', entry: best.entry, ranked };

  const tooClose = !!second && second.score >= clarifyMin && best.score / second.score < margin;

  if (best.score < answerMin || tooClose) {
    // Pistes proposées : jamais deux qui mènent au même endroit.
    const options: KnowledgeEntry[] = [];
    const hrefs = new Set<string>();
    for (const r of ranked) {
      if (r.score < clarifyMin || r.score < best.score / (margin * 1.4)) break;
      const href = r.entry.link?.href;
      if (href && hrefs.has(href)) continue;
      if (href) hrefs.add(href);
      options.push(r.entry);
      if (options.length === 3) break;
    }
    if (options.length >= 2) return { kind: 'clarify', options, ranked };
    // Une seule piste après dédoublonnage : les « concurrentes » menaient
    // toutes au même endroit, l'égalité était une illusion. On répond, avec
    // une exigence de score abaissée d'un quart puisqu'il n'y a plus de
    // rivale à départager.
    if (best.score >= answerMin * 0.75) return { kind: 'answer', entry: best.entry, ranked };
    return { kind: 'none', ranked };
  }
  return { kind: 'answer', entry: best.entry, ranked };
}

/* ------------------------------------------------------------------ *
 *  Intentions conversationnelles
 * ------------------------------------------------------------------ */

export type SmallTalk = 'greeting' | 'thanks' | 'bye' | null;

const GREETING = /^(bonjour|bonsoir|salut|hello|hey|hi|coucou|yo|bjr)\b/;
const THANKS = /^(merci|thanks|thank you|nickel|parfait|super|top|ok merci|d accord merci)\b/;
const BYE = /^(au revoir|bye|a bientot|bonne journee|bonne soiree|salut a vous|ciao|goodbye)\b/;

/**
 * « Bonjour » et « merci » ne sont pas des questions. Le moteur précédent les
 * traitait comme des demandes hors périmètre et réclamait une adresse e-mail
 * au visiteur qui venait simplement de dire bonjour.
 */
export function smallTalk(query: string): SmallTalk {
  const q = norm(query);
  if (!q || q.split(' ').length > 4) return null;
  if (GREETING.test(q)) return 'greeting';
  if (THANKS.test(q)) return 'thanks';
  if (BYE.test(q)) return 'bye';
  return null;
}
