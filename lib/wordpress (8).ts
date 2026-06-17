import { GraphQLClient, gql } from 'graphql-request';
import { sampleDatacenters } from './sample-data';
import { PERSONAS, type Persona } from './personas';

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

// --- Types -----------------------------------------------------------------
export type Kpi = { label: string; valeur: string; unite: string };
export type Caracteristique = { categorie: string; intitule: string; detail: string };
export type Benefice = { titre: string; texte: string };

export type Datacenter = {
  title: string;
  slug: string;
  datacenterFields: {
    ville: string | null;
    statut: string[] | string | null;
    accroche: string | null;
    latitude?: number | null;
    longitude?: number | null;
    puissance?: string | null;
    description?: string | null;
    kpis?: Kpi[] | null;
    caracteristiques?: Caracteristique[] | null;
    benefices?: Benefice[] | null;
    document: { url: string; titre: string } | null
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
    datacenters(first: 100) {
      nodes {
        title
        slug
        datacenterFields {
          ville
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
      datacenterFields {
        ville
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable — données d\'exemple (datacenters).');
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable — données d\'exemple (datacenter).');
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable — données d\'exemple (articles).');
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable — données d\'exemple (tous les articles).');
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable — données d\'exemple (article).');
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable — données d\'exemple (catégories).');
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable — données d\'exemple (FAQ).');
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
    if (process.env.NODE_ENV !== 'production') console.warn('[NDC] API injoignable (page).');
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

// Convertit un hex de charte (#1E7BF5) en rgba douce pour les fonds.
// → accentSoft n'est JAMAIS éditable dans WP : on le dérive pour garantir
//   qu'il reste toujours cohérent avec l'accent choisi.
function hexToSoft(hex: string | null | undefined, alpha = 0.1): string {
  const fallback = `rgba(30,123,245,${alpha})`;
  if (!hex) return fallback;
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
    accent: string | null;
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
  const accent = f?.accent || '#1E7BF5';
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
    accentWord: (f?.accentWords || '')
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean),
    faqTitre: f?.faqTitre || '',
    faq: (f?.faq ?? []).map((item) => ({ q: item.question || '', a: item.reponse || '' })),
  };
}

// Requête GraphQL en GET « simple » : aucun en-tête déclencheur de préflight
// (Accept est safelisted) → contourne le blocage CORS/OPTIONS de StackBlitz.
// WPGraphQL accepte les queries en GET et renvoie déjà Access-Control-Allow-Origin: *.
async function wpGet<T>(query: string): Promise<T> {
  const url = `${endpoint}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store', // données fraîches à chaque chargement pendant le dev
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(' | '));
  if (!json.data) throw new Error('Réponse GraphQL sans data');
  return json.data;
}

export async function getPersonas(): Promise<Persona[]> {
  if (!endpoint) return PERSONAS;
  try {
    const data = await wpGet<{ personas: { nodes: WpPersonaNode[] } }>(PERSONAS_QUERY);
    const nodes = data.personas?.nodes ?? [];
    // WP vide (CPT pas encore peuplé) → on garde la maquette de référence.
    if (nodes.length === 0) return PERSONAS;
    return nodes.map(mapWpPersona);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        "[NDC] API injoignable — données d'exemple (personas) :",
        error instanceof Error ? error.message : error
      );
    }
    return PERSONAS;
  }
}
