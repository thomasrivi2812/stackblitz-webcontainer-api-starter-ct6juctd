import { GraphQLClient, gql } from 'graphql-request';
import { sampleDatacenters } from './sample-data';
import { PERSONAS, type Persona } from './personas';

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

/** Log toujours l'erreur WordPress (y compris en production) pour le diagnostic via les logs Vercel. */
function logWpError(label: string, error: unknown) {
  console.error(`[NDC] API injoignable — données d'exemple (${label}) :`, error instanceof Error ? error.message : error);
}

// --- Types -----------------------------------------------------------------
export type Kpi = { label: string; valeur: string; unite: string };
export type Caracteristique = { categorie: string; intitule: string; detail: string };
export type Benefice = { titre: string; texte: string };

export type Datacenter = {
  title: string;
  slug: string;
  featuredImage?: { node: { sourceUrl: string; altText: string } } | null;
  datacenterFields: {
    ville: string | null;
    region?: string | null;
    statut: string[] | string | null;
    accroche: string | null;
    latitude?: number | null;
    longitude?: number | null;
    puissance?: string | null;
    description?: string | null;
    kpis?: Kpi[] | null;
    caracteristiques?: Caracteristique[] | null;
    benefices?: Benefice[] | null;
    document?: { url: string; titre: string } | null
  };
};

// Type article pour le bandeau accueil (3 articles récents)
export type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string | null;
  featuredImage?: { node: { sourceUrl: string; altText: string } } | null;
};

// Type article complet (page listing + page article individuelle)
export type WPPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  featuredImage: {
    node: { sourceUrl: string; altText: string } | null;
  } | null;
  categories: { nodes: { name: string; slug: string }[] };
  tags: { nodes: { name: string; slug: string }[] };
  author: { node: { name: string } } | null;
  document?: { url: string; titre: string } | null;
};

// Type catégorie
export type WPCategory = { name: string; slug: string; count: number };

// Type FAQ ← NOUVEAU
export type Faq = { question: string; reponse: string };

// Type page personnalisée (Titre / Texte / Image — champs natifs WP) ← NOUVEAU
export type CustomPage = {
  title: string;
  content: string;
  image: { sourceUrl: string; altText: string } | null;
};

// --- Requêtes Datacenters --------------------------------------------------
const DATACENTERS_QUERY = gql`
  query Datacenters {
    datacenters(first: 100, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        slug
        featuredImage { node { sourceUrl altText } }
        datacenterFields {
          ville
          region
          statut
          accroche
          latitude
          longitude
          puissance
        }
      }
    }
  }
`;

const DATACENTER_BY_SLUG_QUERY = gql`
  query Datacenter($slug: ID!) {
    datacenter(id: $slug, idType: SLUG) {
      title
      slug
      featuredImage { node { sourceUrl altText } }
      datacenterFields {
        ville
        region
        statut
        accroche
        latitude
        longitude
        puissance
        description
        kpis { label valeur unite }
        caracteristiques { categorie intitule detail }
        benefices { titre texte }
        document { url titre }
      }
    }
  }
`;

// --- Requêtes Articles (accueil) -------------------------------------------
const RECENT_POSTS_QUERY = gql`
  query RecentPosts {
    posts(first: 5, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        title
        slug
        date
        excerpt
        featuredImage { node { sourceUrl altText } }
      }
    }
  }
`;

// --- Requêtes Articles (page Actualités) ----------------------------------
const ALL_POSTS_QUERY = gql`
  query AllPosts {
    posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        slug
        title
        date
        excerpt
        content
        featuredImage {
          node { sourceUrl altText }
        }
        categories { nodes { name slug } }
        tags { nodes { name slug } }
        author { node { name } }
        articleFields { document { url titre } auteur }
      }
    }
  }
`;

const POST_BY_SLUG_QUERY = gql`
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      slug
      title
      date
      excerpt
      content
      featuredImage {
        node { sourceUrl altText }
      }
      categories { nodes { name slug } }
      tags { nodes { name slug } }
      author { node { name } }
      articleFields { document { url titre } auteur }
    }
  }
`;

const CATEGORIES_QUERY = gql`
  query AllCategories {
    categories(first: 50) {
      nodes { name slug count }
    }
  }
`;

// --- Requête FAQ ← NOUVEAU --------------------------------------------------
const FAQS_QUERY = gql`
  query Faqs {
    faqs(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        faqFields { reponse }
      }
    }
  }
`;

// --- Requête Page personnalisée ← NOUVEAU ----------------------------------
const PAGE_BY_SLUG_QUERY = gql`
  query CustomPage($slug: String!) {
    pages(first: 1, where: { name: $slug }) {
      nodes {
        title
        content
        featuredImage { node { sourceUrl altText } }
      }
    }
  }
`;

// --- Accès aux données : Datacenters ---------------------------------------
export async function getDatacenters(): Promise<Datacenter[]> {
  if (!endpoint) return sampleDatacenters;
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ datacenters: { nodes: Datacenter[] } }>(DATACENTERS_QUERY);
    return data.datacenters.nodes;
  } catch (error) {
    logWpError('datacenters', error);
    return sampleDatacenters;
  }
}

export async function getDatacenter(slug: string): Promise<Datacenter | null> {
  if (!endpoint) {
    return sampleDatacenters.find((d) => d.slug === slug) ?? null;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ datacenter: Datacenter | null }>(DATACENTER_BY_SLUG_QUERY, { slug });
    return data.datacenter;
  } catch (error) {
    logWpError('datacenter', error);
    return sampleDatacenters.find((d) => d.slug === slug) ?? null;
  }
}

// --- Accès aux données : Articles (accueil) --------------------------------
export async function getRecentPosts(): Promise<Post[]> {
  if (!endpoint) {
    const { samplePosts } = await import('./sample-data');
    return samplePosts;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ posts: { nodes: Post[] } }>(RECENT_POSTS_QUERY);
    return data.posts.nodes.map((n) => ({ ...n, title: decodeEntities(n.title) }));
  } catch (error) {
    logWpError('articles', error);
    const { samplePosts } = await import('./sample-data');
    return samplePosts;
  }
}

// --- Accès aux données : Articles (page Actualités) ------------------------
export async function getAllPosts(): Promise<WPPost[]> {
  if (!endpoint) {
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{
      posts: { nodes: (WPPost & { articleFields?: { document: { url: string; titre: string } | null; auteur?: string | null } | null })[] };
    }>(ALL_POSTS_QUERY);
    return data.posts.nodes.map((n) => ({
      ...n,
      title: decodeEntities(n.title),
      document: n.articleFields?.document ?? null,
      author: n.articleFields?.auteur ? { node: { name: n.articleFields.auteur } } : n.author,
    }));
  } catch (error) {
    logWpError('tous les articles', error);
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts;
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  if (!endpoint) {
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts.find((p) => p.slug === slug) ?? null;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{
      post: (WPPost & { articleFields?: { document: { url: string; titre: string } | null; auteur?: string | null } | null }) | null;
    }>(POST_BY_SLUG_QUERY, { slug });
    if (!data.post) return null;
    return {
      ...data.post,
      title: decodeEntities(data.post.title),
      document: data.post.articleFields?.document ?? null,
      author: data.post.articleFields?.auteur ? { node: { name: data.post.articleFields.auteur } } : data.post.author,
    };
  } catch (error) {
    logWpError('article', error);
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts.find((p) => p.slug === slug) ?? null;
  }
}

export async function getCategories(): Promise<WPCategory[]> {
  if (!endpoint) {
    const { sampleCategories } = await import('./sample-data');
    return sampleCategories;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ categories: { nodes: WPCategory[] } }>(CATEGORIES_QUERY);
    return data.categories.nodes.filter((c) => c.count > 0);
  } catch (error) {
    logWpError('catégories', error);
    const { sampleCategories } = await import('./sample-data');
    return sampleCategories;
  }
}

// --- Accès aux données : FAQ ← NOUVEAU -------------------------------------
export async function getFaqs(): Promise<Faq[]> {
  if (!endpoint) {
    const { sampleFaqs } = await import('./sample-data');
    return sampleFaqs;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{
      faqs: { nodes: { title: string; faqFields: { reponse: string | null } | null }[] };
    }>(FAQS_QUERY);
    return data.faqs.nodes.map((n) => ({ question: n.title, reponse: n.faqFields?.reponse ?? '' }));
  } catch (error) {
    logWpError('FAQ', error);
    const { sampleFaqs } = await import('./sample-data');
    return sampleFaqs;
  }
}

// --- Accès aux données : Page personnalisée ← NOUVEAU ----------------------
export async function getPage(slug: string): Promise<CustomPage | null> {
  if (!endpoint) return null;
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{
      pages: { nodes: { title: string; content: string | null; featuredImage: { node: { sourceUrl: string; altText: string } } | null }[] };
    }>(PAGE_BY_SLUG_QUERY, { slug });
    const node = data.pages.nodes[0];
    if (!node) return null;
    return {
      title: decodeEntities(node.title),
      content: node.content ?? '',
      image: node.featuredImage?.node
        ? { sourceUrl: node.featuredImage.node.sourceUrl, altText: node.featuredImage.node.altText ?? '' }
        : null,
    };
  } catch (error) {
    logWpError('page', error);
    return null;
  }
}

// --- Helpers ---------------------------------------------------------------
const STATUT_LABELS: Record<string, string> = {
  livre: 'Livré',
  construction: 'En construction',
  avenir: 'À venir',
};

export function statutInfo(statut: Datacenter['datacenterFields']['statut']): { key: string; label: string } {
  const key = Array.isArray(statut) ? statut[0] ?? '' : statut ?? '';
  return { key, label: STATUT_LABELS[key] ?? 'Statut inconnu' };
}

// Points pour la carte (uniquement ceux qui ont des coordonnées)
export type MapPoint = { title: string; slug: string; ville: string | null; statut: string; lat: number; lng: number };

export function toMapPoints(datacenters: Datacenter[]): MapPoint[] {
  return datacenters
    .filter((d) => d.datacenterFields.latitude != null && d.datacenterFields.longitude != null)
    .map((d) => ({
      title: d.title,
      slug: d.slug,
      ville: d.datacenterFields.ville,
      statut: statutInfo(d.datacenterFields.statut).key,
      lat: d.datacenterFields.latitude as number,
      lng: d.datacenterFields.longitude as number,
    }));
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201D', ldquo: '\u201C',
  hellip: '\u2026', ndash: '\u2013', mdash: '\u2014',
  laquo: '\u00AB', raquo: '\u00BB',
};

// Décode les entités HTML (&rsquo; &amp; &#8217; …) renvoyées par les champs
// natifs WP (title, excerpt), qui sinon s'affichent en clair dans du texte React.
export function decodeEntities(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return decodeEntities(html.replace(/<[^>]*>/g, '')).trim();
}

export function formatDateFr(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

// --- KPI réseau (agrégés pour le bandeau d'accueil) -----------------------
export type NetworkKpi = { valeur: string; unite: string; label: string };

export function networkKpis(datacenters: Datacenter[]): NetworkKpi[] {
  const livres = datacenters.filter((d) => statutInfo(d.datacenterFields.statut).key === 'livre').length;
  return [
    { valeur: '1,2', unite: '', label: 'PUE cible' },
    { valeur: 'Tier III', unite: '', label: 'Conception EN 50600' },
    { valeur: '15', unite: 'sites', label: 'Réseau à horizon 2030' },
    { valeur: '99,982', unite: '%', label: 'Disponibilité' },
  ];
}
// --- Accès aux données : Personas (page Offres) ← NOUVEAU ------------------
// Modèle WP attendu : CPT `persona` + groupe ACF `personaFields`.
// Toute la structure/charte reste pilotée par le code ; WP ne porte que du
// contenu. Les champs « sensibles au design » sont soit dérivés (accentSoft),
// soit auto-générés (numéros de réponses), soit contraints côté ACF (accent).

const PERSONAS_QUERY = gql`
  query Personas {
    personas(first: 20, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        slug
        personaFields {
          label
          accent
          tag
          h1
          accentWords
          lead
          ctaPrimary
          proofs { texte }
          enjeux { icon titre texte }
          problemesTitre
          problemes { icon titre texte }
          reponsesTitre
          reponses { titre texte }
          stats { num label }
          faqTitre
          faq { question reponse }
        }
      }
    }
  }
`;

// Normalise la valeur d'accent renvoyée par ACF (quelle que soit sa forme)
// vers un hex « #rrggbb » utilisable en CSS. Gère :
//   - string hex  : "#1E7BF5", "1E7BF5", "#abc"
//   - string rgb  : "rgb(30,123,245)" / "rgba(30,123,245,1)"
//   - tableau     : [30,123,245] (return format ACF « rgba »)
//   - objet       : { red, green, blue } / { r, g, b } / { hex }
// Retourne null si rien d'exploitable → l'appelant choisit alors un fallback.
function normalizeAccent(raw: unknown): string | null {
  const toHex = (r: number, g: number, b: number) =>
    '#' +
    [r, g, b]
      .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
      .join('');

  if (typeof raw === 'string') {
    const s = raw.trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(s)) return '#' + s.replace('#', '');
    if (/^#?[0-9a-fA-F]{3}$/.test(s)) {
      const h = s.replace('#', '');
      return '#' + h.split('').map((c) => c + c).join('');
    }
    const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return toHex(+m[1], +m[2], +m[3]);
    return null;
  }
  if (Array.isArray(raw)) {
    // [r,g,b] numérique (return format ACF « rgba »)
    if (raw.length >= 3 && [raw[0], raw[1], raw[2]].every((n) => typeof n === 'number')) {
      return toHex(raw[0], raw[1], raw[2]);
    }
    // ["#F5820D"] : WPGraphQL expose le color picker comme tableau à 1 élément
    if (raw.length >= 1) return normalizeAccent(raw[0]);
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (typeof o.hex === 'string') return normalizeAccent(o.hex);
    const r = o.red ?? o.r;
    const g = o.green ?? o.g;
    const b = o.blue ?? o.b;
    if ([r, g, b].every((n) => typeof n === 'number')) return toHex(r as number, g as number, b as number);
  }
  return null;
}

// Convertit un hex de charte (#1E7BF5) en rgba douce pour les fonds.
// → accentSoft n'est JAMAIS éditable dans WP : on le dérive pour garantir
//   qu'il reste toujours cohérent avec l'accent choisi.
function hexToSoft(hex: string | null | undefined, alpha = 0.1): string {
  const fallback = `rgba(30,123,245,${alpha})`;
  // ACF peut renvoyer autre chose qu'une string (objet couleur, number…) :
  // on ne tente .replace que sur une vraie chaîne.
  if (typeof hex !== 'string' || !hex) return fallback;
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return fallback;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return fallback;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Forme brute renvoyée par WPGraphQL (sous-champs de repeaters tolérants au null).
type WpPersonaNode = {
  title: string | null;
  slug: string | null;
  personaFields: {
    label: string | null;
    accent: unknown; // ACF color : string hex, tableau rgba ou objet selon le réglage
    tag: string | null;
    h1: string | null;
    accentWords: string | null;
    lead: string | null;
    ctaPrimary: string | null;
    proofs: { texte: string | null }[] | null;
    enjeux: { icon: string | null; titre: string | null; texte: string | null }[] | null;
    problemesTitre: string | null;
    problemes: { icon: string | null; titre: string | null; texte: string | null }[] | null;
    reponsesTitre: string | null;
    reponses: { titre: string | null; texte: string | null }[] | null;
    stats: { num: string | null; label: string | null }[] | null;
    faqTitre: string | null;
    faq: { question: string | null; reponse: string | null }[] | null;
  } | null;
};

// Normalise un node WP → type Persona attendu par le rendu.
// C'est ici qu'on protège le design : numérotation auto des réponses,
// dérivation de accentSoft, parsing des mots à colorer.
function mapWpPersona(node: WpPersonaNode): Persona {
  const f = node.personaFields;
  // Palette de secours par profil : si WP ne renvoie pas de couleur d'accent
  // (champ ACF vide), on garde des couleurs distinctes par slug plutôt que
  // de tout afficher en bleu.
  const ACCENT_BY_SLUG: Record<string, string> = {
    dsi: '#1E7BF5',
    pme: '#00C48C',
    pub: '#7B5FF5',
    tel: '#F5820D',
  };
  // 1) couleur WordPress si exploitable, 2) palette par profil, 3) bleu charte.
  const accent =
    normalizeAccent(f?.accent) || ACCENT_BY_SLUG[node.slug || ''] || '#1E7BF5';
  return {
    id: node.slug || 'persona',
    label: f?.label || node.title || 'Profil',
    accent,
    accentSoft: hexToSoft(accent, 0.1),
    tag: f?.tag || '',
    h1: f?.h1 || node.title || '',
    lead: f?.lead || '',
    ctaPrimary: f?.ctaPrimary || 'Nous contacter',
    proofs: (f?.proofs ?? []).map((p) => p.texte || '').filter(Boolean),
    enjeux: (f?.enjeux ?? []).map((e) => ({
      icon: e.icon || '',
      titre: e.titre || '',
      texte: e.texte || '',
    })),
    problemesTitre: f?.problemesTitre || '',
    problemes: (f?.problemes ?? []).map((p) => ({
      icon: p.icon || '',
      titre: p.titre || '',
      texte: p.texte || '',
    })),
    reponsesTitre: f?.reponsesTitre || '',
    // Numéro auto (01, 02, …) : un rédacteur peut ajouter/supprimer/réordonner
    // une réponse sans jamais casser la numérotation affichée.
    reponses: (f?.reponses ?? []).map((r, i) => ({
      num: String(i + 1).padStart(2, '0'),
      titre: r.titre || '',
      texte: r.texte || '',
    })),
    stats: (f?.stats ?? []).map((s) => ({ num: s.num || '', label: s.label || '' })),
    // Mots à colorer : champ texte WP « DSI, IT » → string[].
    accentWord: (typeof f?.accentWords === 'string' ? f.accentWords : '')
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean),
    faqTitre: f?.faqTitre || '',
    faq: (f?.faq ?? []).map((item) => ({ q: item.question || '', a: item.reponse || '' })),
  };
}

export async function getPersonas(): Promise<Persona[]> {
  if (!endpoint) return PERSONAS;
  try {
    // POST via GraphQLClient, comme toutes les autres requêtes du fichier.
    // (Le GET « simple » échouait sur certains WPGraphQL qui n'acceptent pas
    //  les queries en GET → « fetch failed ».)
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ personas: { nodes: WpPersonaNode[] } }>(PERSONAS_QUERY);
    const nodes = data.personas?.nodes ?? [];
    // WP vide (CPT pas encore peuplé) → on garde la maquette de référence.
    if (nodes.length === 0) return PERSONAS;
    return nodes.map(mapWpPersona);
  } catch (error) {
    logWpError('personas', error);
    return PERSONAS;
  }
}

// ===========================================================================
// CERTIFICATIONS — CPT `certification` (titre = nom de la certif) ← NOUVEAU
// ===========================================================================
export type Certification = {
  nom: string;            // = titre du post
  categorie: string;      // securite | sante | souverainete | energie | qualite | conception
  description: string;
  garantie: string;
  statut: string;         // conforme | en-cours | vise
  souverainete: boolean;
  logo?: { sourceUrl: string; altText: string } | null;
};

const CERTIFICATIONS_QUERY = gql`
  query Certifications {
    certifications(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        certificationFields {
          categorie
          description
          garantie
          statut
          souverainete
          logo { node { sourceUrl altText } }
        }
      }
    }
  }
`;

type WpCertificationNode = {
  title: string | null;
  certificationFields: {
    categorie: string | null;
    description: string | null;
    garantie: string | null;
    statut: string | null;
    souverainete: boolean | null;
    logo: { node: { sourceUrl: string; altText: string } | null } | null;
  } | null;
};

export async function getCertifications(): Promise<Certification[]> {
  if (!endpoint) {
    const { sampleCertifications } = await import('./sample-data');
    return sampleCertifications;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ certifications: { nodes: WpCertificationNode[] } }>(CERTIFICATIONS_QUERY);
    const nodes = data.certifications?.nodes ?? [];
    if (nodes.length === 0) {
      const { sampleCertifications } = await import('./sample-data');
      return sampleCertifications;
    }
    return nodes.map((n) => ({
      nom: decodeEntities(n.title) || 'Certification',
      categorie: n.certificationFields?.categorie ?? '',
      description: n.certificationFields?.description ?? '',
      garantie: n.certificationFields?.garantie ?? '',
      statut: n.certificationFields?.statut ?? 'vise',
      souverainete: Boolean(n.certificationFields?.souverainete),
      logo: n.certificationFields?.logo?.node
        ? { sourceUrl: n.certificationFields.logo.node.sourceUrl, altText: n.certificationFields.logo.node.altText ?? '' }
        : null,
    }));
  } catch (error) {
    logWpError('certifications', error);
    const { sampleCertifications } = await import('./sample-data');
    return sampleCertifications;
  }
}

const CERTIF_CATEGORIE_LABELS: Record<string, string> = {
  securite: 'Sécurité de l’information',
  sante: 'Santé',
  souverainete: 'Souveraineté',
  energie: 'Énergie & environnement',
  qualite: 'Qualité',
  conception: 'Conception & Tier',
};
const CERTIF_STATUT_LABELS: Record<string, string> = {
  conforme: 'Conforme',
  'en-cours': 'En cours',
  vise: 'Visé',
};
export function certifCategorieLabel(key: string): string {
  return CERTIF_CATEGORIE_LABELS[key] ?? 'Certification';
}
export function certifStatutInfo(statut: string): { key: string; label: string } {
  return { key: statut || 'vise', label: CERTIF_STATUT_LABELS[statut] ?? 'Visé' };
}

// ===========================================================================
// ÉQUIPE — CPT `membre` (titre = nom ; photo = featuredImage) ← NOUVEAU
// ===========================================================================
export type Membre = {
  nom: string;            // = titre du post
  poste: string;
  pole: string;           // direction | technique | commercial | exploitation | support
  bio: string;
  linkedin: string | null;
  photo: { sourceUrl: string; altText: string } | null;
};

const MEMBRES_QUERY = gql`
  query Membres {
    membres(first: 100, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        featuredImage { node { sourceUrl altText } }
        membreFields {
          poste
          pole
          bio
          linkedin
        }
      }
    }
  }
`;

type WpMembreNode = {
  title: string | null;
  featuredImage: { node: { sourceUrl: string; altText: string } | null } | null;
  membreFields: {
    poste: string | null;
    pole: string | null;
    bio: string | null;
    linkedin: string | null;
  } | null;
};

export async function getMembres(): Promise<Membre[]> {
  if (!endpoint) {
    const { sampleMembres } = await import('./sample-data');
    return sampleMembres;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ membres: { nodes: WpMembreNode[] } }>(MEMBRES_QUERY);
    const nodes = data.membres?.nodes ?? [];
    if (nodes.length === 0) {
      const { sampleMembres } = await import('./sample-data');
      return sampleMembres;
    }
    return nodes.map((n) => ({
      nom: decodeEntities(n.title) || 'Membre',
      poste: n.membreFields?.poste ?? '',
      pole: n.membreFields?.pole ?? 'support',
      bio: n.membreFields?.bio ?? '',
      linkedin: n.membreFields?.linkedin ?? null,
      photo: n.featuredImage?.node
        ? { sourceUrl: n.featuredImage.node.sourceUrl, altText: n.featuredImage.node.altText ?? '' }
        : null,
    }));
  } catch (error) {
    logWpError('équipe', error);
    const { sampleMembres } = await import('./sample-data');
    return sampleMembres;
  }
}

export const POLE_LABELS: Record<string, string> = {
  direction: 'Direction',
  technique: 'Technique & Ingénierie',
  commercial: 'Commercial & Marketing',
  exploitation: 'Exploitation & Sécurité',
  support: 'Support & Fonctions transverses',
};
// Ordre d'affichage des pôles sur la page Équipes.
export const POLE_ORDER = ['direction', 'technique', 'exploitation', 'commercial', 'support'];

// ===========================================================================
// GROUPE ALTAREA — champs ACF sur la Page de slug « groupe » ← NOUVEAU
// ===========================================================================
export type GroupeChiffre = { valeur: string; unite: string; label: string };
export type GroupeValeur = { titre: string; texte: string };
export type GroupeJalon = { annee: string; evenement: string };
export type Groupe = {
  introTitre: string;
  introTexte: string;
  chiffres: GroupeChiffre[];
  valeurs: GroupeValeur[];
  articulationTitre: string;
  articulationTexte: string;
  timeline: GroupeJalon[];
};

const GROUPE_QUERY = gql`
  query GroupePage {
    pages(first: 1, where: { name: "groupe" }) {
      nodes {
        groupeFields {
          introTitre
          introTexte
          chiffres { valeur unite label }
          valeurs { titre texte }
          articulationTitre
          articulationTexte
          timeline { annee evenement }
        }
      }
    }
  }
`;

type WpGroupeFields = {
  introTitre: string | null;
  introTexte: string | null;
  chiffres: { valeur: string | null; unite: string | null; label: string | null }[] | null;
  valeurs: { titre: string | null; texte: string | null }[] | null;
  articulationTitre: string | null;
  articulationTexte: string | null;
  timeline: { annee: string | null; evenement: string | null }[] | null;
};

export async function getGroupe(): Promise<Groupe> {
  const { sampleGroupe } = await import('./sample-data');
  if (!endpoint) return sampleGroupe;
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ pages: { nodes: { groupeFields: WpGroupeFields | null }[] } }>(GROUPE_QUERY);
    const f = data.pages?.nodes?.[0]?.groupeFields;
    // Page « groupe » absente ou champs vides → contenu de référence.
    if (!f || (!f.introTexte && !(f.chiffres?.length))) return sampleGroupe;
    return {
      introTitre: f.introTitre || sampleGroupe.introTitre,
      introTexte: f.introTexte || sampleGroupe.introTexte,
      chiffres: (f.chiffres ?? []).map((c) => ({ valeur: c.valeur ?? '', unite: c.unite ?? '', label: c.label ?? '' })),
      valeurs: (f.valeurs ?? []).map((v) => ({ titre: v.titre ?? '', texte: v.texte ?? '' })),
      articulationTitre: f.articulationTitre || sampleGroupe.articulationTitre,
      articulationTexte: f.articulationTexte || sampleGroupe.articulationTexte,
      timeline: (f.timeline ?? []).map((t) => ({ annee: t.annee ?? '', evenement: t.evenement ?? '' })),
    };
  } catch (error) {
    logWpError('groupe', error);
    return sampleGroupe;
  }
}
