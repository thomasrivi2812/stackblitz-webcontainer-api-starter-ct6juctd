import { cache } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import { sampleDatacenters } from './sample-data';
import { PERSONAS, type Persona } from './personas';

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;

/** Log toujours l'erreur WordPress (y compris en production) pour le diagnostic via les logs Vercel. */
function logWpError(label: string, error: unknown) {
  console.error(`[NDC] API injoignable — données d'exemple (${label}) :`, error instanceof Error ? error.message : error);
}

// ===========================================================================
// MULTILINGUE (Polylang via wp-graphql-polylang)
// ---------------------------------------------------------------------------
// Locale Next (« fr »/« en ») → code de langue WPGraphQL passé au filtre
// `where: { language: ... }` des connexions, typé `LanguageCodeFilterEnum`.
//
// ⚠️ CONTRAT À VALIDER CONTRE LE SCHÉMA RÉEL : selon la version de
// wp-graphql-polylang, le nom de l'enum (LanguageCodeFilterEnum) et la présence
// du filtre `where.language` sur chaque type de contenu doivent être vérifiés.
// Tout est centralisé ici → un seul point à ajuster si le schéma diffère.
//
// Stratégie de repli (choix produit « Fallback FR ») : si le contenu n'existe
// pas encore dans la langue demandée, on réaffiche le FR plutôt qu'une page
// vide → permet une traduction progressive côté WordPress.
// ===========================================================================
export type WpLocale = 'fr' | 'en';
type WpLangCode = 'FR' | 'EN';

const wpLang = (locale: WpLocale = 'fr'): WpLangCode => (locale === 'en' ? 'EN' : 'FR');

/**
 * Exécute une requête de LISTE pour la langue demandée. Si la liste revient vide
 * en langue secondaire (section pas encore traduite), bascule sur le FR (repli).
 * `pick` extrait le tableau de nodes pour tester s'il est vide.
 */
async function wpList<R>(
  client: GraphQLClient,
  query: string,
  locale: WpLocale,
  pick: (data: R) => readonly unknown[] | null | undefined,
): Promise<R> {
  const primary = await client.request<R>(query, { language: wpLang(locale) });
  if (locale !== 'fr' && (pick(primary)?.length ?? 0) === 0) {
    return client.request<R>(query, { language: 'FR' });
  }
  return primary;
}

/**
 * Exécute une requête d'ÉLÉMENT UNIQUE (par slug) pour la langue demandée, avec
 * repli FR si l'élément n'existe pas dans la langue secondaire. `pick` extrait
 * l'élément (ou null) pour décider du repli.
 */
async function wpSingle<R>(
  client: GraphQLClient,
  query: string,
  variables: Record<string, unknown>,
  locale: WpLocale,
  pick: (data: R) => unknown,
): Promise<R> {
  const primary = await client.request<R>(query, { ...variables, language: wpLang(locale) });
  if (locale !== 'fr' && !pick(primary)) {
    return client.request<R>(query, { ...variables, language: 'FR' });
  }
  return primary;
}

/**
 * Normalise le groupe ACF « document » : ACF renvoie TOUJOURS un objet
 * { url: "", titre: "" } (jamais null) même quand le champ est vide.
 * On ne considère le document présent que si son URL est réellement renseignée,
 * sinon l'encart « Document à télécharger » s'afficherait sur tous les articles.
 */
function cleanDocument(doc?: { url: string | null; titre: string | null } | null): { url: string; titre: string } | null {
  const url = (doc?.url ?? '').trim();
  if (!url) return null;
  return { url, titre: (doc?.titre ?? '').trim() };
}

/** Décode les noms de catégories/tags WP (renvoyés encodés en HTML par WPGraphQL). */
function decodeTaxonomy(nodes?: { name: string; slug: string }[]): { name: string; slug: string }[] {
  return (nodes ?? []).map((t) => ({ ...t, name: decodeEntities(t.name) }));
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
    document?: { url: string; titre: string } | null;
    // Galerie photos du bas de fiche (repeater WP « dc_photos »).
    photos?: ({ photo: { node: { sourceUrl: string; altText: string } | null } | null } | null)[] | null;
  };
  // Liens Polylang (présents au runtime via DATACENTER_BY_SLUG) → hreflang.
  language?: { code: string | null } | null;
  translations?: ({ slug: string | null; language: { code: string | null } | null } | null)[] | null;
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
  // Liens Polylang vers les traductions (slug propre à chaque langue) —
  // présents au runtime via la requête POST_BY_SLUG ; servent à construire
  // les vraies URLs hreflang/canonical des pages détail.
  language?: { code: string | null } | null;
  translations?: ({ slug: string | null; language: { code: string | null } | null } | null)[] | null;
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
  query Datacenters($language: LanguageCodeFilterEnum) {
    datacenters(first: 100, where: { language: $language, orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        slug
        language { code }
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

// Filtre par slug + langue via une connexion (where.name) plutôt que par
// datacenter(id, idType: SLUG) : permet d'appliquer le filtre de langue Polylang
// et de gérer le repli FR de façon uniforme.
const DATACENTER_BY_SLUG_QUERY = gql`
  query Datacenter($slug: String!, $language: LanguageCodeFilterEnum) {
    datacenters(first: 1, where: { name: $slug, language: $language }) {
      nodes {
        title
        slug
        language { code }
        translations { slug language { code } }
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
          photos { photo { node { sourceUrl altText } } }
        }
      }
    }
  }
`;

// --- Requêtes Articles (accueil) -------------------------------------------
const RECENT_POSTS_QUERY = gql`
  query RecentPosts($language: LanguageCodeFilterEnum) {
    posts(first: 5, where: { language: $language, orderby: { field: DATE, order: DESC } }) {
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
  query AllPosts($language: LanguageCodeFilterEnum) {
    posts(first: 100, where: { language: $language, orderby: { field: DATE, order: DESC } }) {
      nodes {
        slug
        title
        date
        excerpt
        content
        language { code }
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
  query PostBySlug($slug: String!, $language: LanguageCodeFilterEnum) {
    posts(first: 1, where: { name: $slug, language: $language }) {
      nodes {
        slug
        title
        date
        excerpt
        content
        language { code }
        featuredImage {
          node { sourceUrl altText }
        }
        categories { nodes { name slug } }
        tags { nodes { name slug } }
        author { node { name } }
        articleFields { document { url titre } auteur }
        # Liens de traduction Polylang (chaque langue a son propre slug).
        translations { slug language { code } }
      }
    }
  }
`;

const CATEGORIES_QUERY = gql`
  query AllCategories($language: LanguageCodeFilterEnum) {
    categories(first: 50, where: { language: $language }) {
      nodes { name slug count }
    }
  }
`;

// --- Requête FAQ ← NOUVEAU --------------------------------------------------
const FAQS_QUERY = gql`
  query Faqs($language: LanguageCodeFilterEnum) {
    faqs(first: 50, where: { language: $language, orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        faqFields { reponse }
      }
    }
  }
`;

// --- Requête Page personnalisée ← NOUVEAU ----------------------------------
const PAGE_BY_SLUG_QUERY = gql`
  query CustomPage($slug: String!, $language: LanguageCodeFilterEnum) {
    pages(first: 1, where: { name: $slug, language: $language }) {
      nodes {
        title
        content
        featuredImage { node { sourceUrl altText } }
      }
    }
  }
`;

// --- Accès aux données : Datacenters ---------------------------------------
async function _getDatacenters(locale: WpLocale = 'fr'): Promise<Datacenter[]> {
  if (!endpoint) return sampleDatacenters;
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{ datacenters: { nodes: (Datacenter & { language?: { code: string | null } | null })[] } }>(
      client, DATACENTERS_QUERY, locale, (d) => d.datacenters.nodes,
    );
    // Filtre défensif par langue (si le filtre WHERE n'est pas appliqué, la
    // liste mélangerait FR et EN). Si le filtrage vide tout, on garde la liste.
    const want = wpLang(locale);
    const nodes = data.datacenters.nodes;
    const inLang = nodes.filter((d) => !d.language?.code || d.language.code.toUpperCase() === want);
    return inLang.length > 0 ? inLang : nodes;
  } catch (error) {
    logWpError('datacenters', error);
    return sampleDatacenters;
  }
}

async function _getDatacenter(slug: string, locale: WpLocale = 'fr'): Promise<Datacenter | null> {
  if (!endpoint) {
    return sampleDatacenters.find((d) => d.slug === slug) ?? null;
  }
  try {
    const client = new GraphQLClient(endpoint);
    // Même logique que les articles : sous Polylang chaque langue a SON slug.
    // On suit le lien de traduction pour ne jamais servir la fiche de l'autre
    // langue sous une URL FR/EN, et la page redirige vers le bon slug.
    type DcNode = Datacenter & {
      language?: { code: string | null } | null;
      translations?: ({ slug: string | null; language: { code: string | null } | null } | null)[] | null;
    };
    const want = wpLang(locale);
    const other: WpLangCode = want === 'FR' ? 'EN' : 'FR';
    const isLang = (d: DcNode) => (d.language?.code ?? want).toUpperCase() === want;
    const fetchBySlug = async (s: string, lang: WpLangCode): Promise<DcNode | null> => {
      const r = await client.request<{ datacenters: { nodes: DcNode[] } }>(
        DATACENTER_BY_SLUG_QUERY, { slug: s, language: lang },
      );
      return r.datacenters.nodes[0] ?? null;
    };

    let carrier = await fetchBySlug(slug, want);
    if (carrier && isLang(carrier)) return carrier;
    if (!carrier) carrier = await fetchBySlug(slug, other);
    if (!carrier) return null;

    const tr = carrier.translations?.find(
      (t) => (t?.language?.code ?? '').toUpperCase() === want,
    );
    if (tr?.slug) {
      const translated = await fetchBySlug(tr.slug, want);
      if (translated) return translated;
    }
    return carrier; // pas de traduction dans la langue demandée → repli
  } catch (error) {
    logWpError('datacenter', error);
    return sampleDatacenters.find((d) => d.slug === slug) ?? null;
  }
}

// --- Accès aux données : Articles (accueil) --------------------------------
export async function getRecentPosts(locale: WpLocale = 'fr'): Promise<Post[]> {
  if (!endpoint) {
    const { samplePosts } = await import('./sample-data');
    return samplePosts;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{ posts: { nodes: Post[] } }>(
      client, RECENT_POSTS_QUERY, locale, (d) => d.posts.nodes,
    );
    return data.posts.nodes.map((n) => ({ ...n, title: decodeEntities(n.title) }));
  } catch (error) {
    logWpError('articles', error);
    const { samplePosts } = await import('./sample-data');
    return samplePosts;
  }
}

// --- Accès aux données : Articles (page Actualités) ------------------------
async function _getAllPosts(locale: WpLocale = 'fr'): Promise<WPPost[]> {
  if (!endpoint) {
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{
      posts: { nodes: (WPPost & {
        articleFields?: { document: { url: string; titre: string } | null; auteur?: string | null } | null;
        language?: { code: string | null } | null;
      })[] };
    }>(client, ALL_POSTS_QUERY, locale, (d) => d.posts.nodes);
    // Filtre défensif par langue : selon la config, le filtre `language` du
    // WHERE peut ne pas être appliqué → le listing mélangerait FR et EN.
    // Si le filtrage vide la liste (repli FR de wpList déjà appliqué), on la
    // garde telle quelle.
    const want = wpLang(locale);
    const inLang = data.posts.nodes.filter((n) => !n.language?.code || n.language.code.toUpperCase() === want);
    const nodes = inLang.length > 0 ? inLang : data.posts.nodes;
    return nodes.map((n) => ({
      ...n,
      title: decodeEntities(n.title),
      categories: { nodes: decodeTaxonomy(n.categories?.nodes) },
      tags: { nodes: decodeTaxonomy(n.tags?.nodes) },
      document: cleanDocument(n.articleFields?.document),
      author: n.articleFields?.auteur ? { node: { name: n.articleFields.auteur } } : n.author,
    }));
  } catch (error) {
    logWpError('tous les articles', error);
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts;
  }
}

async function _getPostBySlug(slug: string, locale: WpLocale = 'fr'): Promise<WPPost | null> {
  if (!endpoint) {
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts.find((p) => p.slug === slug) ?? null;
  }
  try {
    const client = new GraphQLClient(endpoint);
    type PostNode = WPPost & {
      articleFields?: { document: { url: string; titre: string } | null; auteur?: string | null } | null;
      language?: { code: string | null } | null;
      translations?: ({ slug: string | null; language: { code: string | null } | null } | null)[] | null;
    };
    const mapPost = (post: PostNode): WPPost => ({
      ...post,
      title: decodeEntities(post.title),
      categories: { nodes: decodeTaxonomy(post.categories?.nodes) },
      tags: { nodes: decodeTaxonomy(post.tags?.nodes) },
      document: cleanDocument(post.articleFields?.document),
      author: post.articleFields?.auteur ? { node: { name: post.articleFields.auteur } } : post.author,
    });

    const want = wpLang(locale);                 // 'FR' | 'EN'
    const other: WpLangCode = want === 'FR' ? 'EN' : 'FR';
    const isLang = (p: PostNode) => (p.language?.code ?? want).toUpperCase() === want;
    const fetchBySlug = async (s: string, lang: WpLangCode): Promise<PostNode | null> => {
      const r = await client.request<{ posts: { nodes: PostNode[] } }>(
        POST_BY_SLUG_QUERY, { slug: s, language: lang },
      );
      return r.posts.nodes[0] ?? null;
    };

    // 1) Le post portant ce slug, dans la langue demandée. Sous Polylang chaque
    //    langue a SON slug. Si on obtient bien un post dans la bonne langue → OK.
    let carrier = await fetchBySlug(slug, want);
    if (carrier && isLang(carrier)) return mapPost(carrier);

    // 2) Le slug appartient à l'autre langue (ou le filtre `language` a été
    //    ignoré et a renvoyé le post de l'autre langue). On récupère ce post
    //    porteur du slug pour lire ses liens de traduction Polylang.
    if (!carrier) carrier = await fetchBySlug(slug, other);
    if (!carrier) return null; // slug totalement inconnu → 404

    // 3) On suit le lien de traduction vers la langue demandée, puis on relit
    //    l'article par SON slug. La page article redirige ensuite vers ce slug
    //    (post.slug ≠ slug demandé) pour une URL propre.
    const tr = carrier.translations?.find(
      (t) => (t?.language?.code ?? '').toUpperCase() === want,
    );
    if (tr?.slug) {
      const translated = await fetchBySlug(tr.slug, want);
      if (translated) return mapPost(translated);
    }

    // 4) Pas de traduction dans la langue demandée : on affiche le post trouvé
    //    (repli sur l'autre langue plutôt qu'une 404).
    return mapPost(carrier);
  } catch (error) {
    logWpError('article', error);
    const { sampleAllPosts } = await import('./sample-data');
    return sampleAllPosts.find((p) => p.slug === slug) ?? null;
  }
}

export async function getCategories(locale: WpLocale = 'fr'): Promise<WPCategory[]> {
  if (!endpoint) {
    const { sampleCategories } = await import('./sample-data');
    return sampleCategories;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{ categories: { nodes: WPCategory[] } }>(
      client, CATEGORIES_QUERY, locale, (d) => d.categories.nodes,
    );
    return data.categories.nodes
      // On garde les catégories qui contiennent au moins un article.
      // (count peut être null selon la config WPGraphQL → on le borne à 0.)
      .filter((c) => (c.count ?? 0) > 0)
      // Les noms arrivent encodés en HTML (« Énergie & climat » → « &Eacute;… »).
      .map((c) => ({ ...c, name: decodeEntities(c.name) }));
  } catch (error) {
    logWpError('catégories', error);
    const { sampleCategories } = await import('./sample-data');
    return sampleCategories;
  }
}

// --- Accès aux données : FAQ ← NOUVEAU -------------------------------------
export async function getFaqs(locale: WpLocale = 'fr'): Promise<Faq[]> {
  if (!endpoint) {
    const { sampleFaqs } = await import('./sample-data');
    return sampleFaqs;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{
      faqs: { nodes: { title: string; faqFields: { reponse: string | null } | null }[] };
    }>(client, FAQS_QUERY, locale, (d) => d.faqs.nodes);
    return data.faqs.nodes.map((n) => ({ question: n.title, reponse: n.faqFields?.reponse ?? '' }));
  } catch (error) {
    logWpError('FAQ', error);
    const { sampleFaqs } = await import('./sample-data');
    return sampleFaqs;
  }
}

// --- Accès aux données : Page personnalisée ← NOUVEAU ----------------------
export async function getPage(slug: string, locale: WpLocale = 'fr'): Promise<CustomPage | null> {
  // Repli local pour certaines pages (légales…) tant qu'elles n'existent pas
  // dans WP — dès que la page WP est créée avec le même slug, elle gagne.
  const fallback = async (): Promise<CustomPage | null> => {
    const { samplePages } = await import('./sample-data');
    return samplePages[slug] ?? null;
  };
  if (!endpoint) return fallback();
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpSingle<{
      pages: { nodes: { title: string; content: string | null; featuredImage: { node: { sourceUrl: string; altText: string } } | null }[] };
    }>(client, PAGE_BY_SLUG_QUERY, { slug }, locale, (d) => d.pages.nodes[0]);
    const node = data.pages.nodes[0];
    if (!node) return fallback();
    return {
      title: decodeEntities(node.title),
      content: node.content ?? '',
      image: node.featuredImage?.node
        ? { sourceUrl: node.featuredImage.node.sourceUrl, altText: node.featuredImage.node.altText ?? '' }
        : null,
    };
  } catch (error) {
    logWpError('page', error);
    return fallback();
  }
}

// --- Helpers ---------------------------------------------------------------
const STATUT_LABELS: Record<string, string> = {
  livre: 'Opérationnel',
  construction: 'En cours',
  avenir: 'À venir',
};

export function statutInfo(statut: Datacenter['datacenterFields']['statut']): { key: string; label: string } {
  const key = Array.isArray(statut) ? statut[0] ?? '' : statut ?? '';
  return { key, label: STATUT_LABELS[key] ?? 'Statut inconnu' };
}

// Points pour la carte (uniquement ceux qui ont des coordonnées)
export type MapPoint = { title: string; slug: string; ville: string | null; statut: string; lat: number; lng: number };

// Coordonnées de repli par ville : un site SANS latitude/longitude dans WP
// apparaît quand même sur la carte tant que son champ « Ville » est rempli.
// Les coordonnées exactes saisies dans WP restent prioritaires.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'paris': { lat: 48.8566, lng: 2.3522 },
  'velizy': { lat: 48.7838, lng: 2.1919 },
  'velizy-villacoublay': { lat: 48.7838, lng: 2.1919 },
  'rennes': { lat: 48.1173, lng: -1.6778 },
  'noyal-sur-vilaine': { lat: 48.1119, lng: -1.5219 },
  'mordelles': { lat: 48.0733, lng: -1.8447 },
  'rouen': { lat: 49.4431, lng: 1.0993 },
  'lyon': { lat: 45.764, lng: 4.8357 },
  'marseille': { lat: 43.2965, lng: 5.3698 },
  'lille': { lat: 50.6292, lng: 3.0573 },
  'bordeaux': { lat: 44.8378, lng: -0.5792 },
  'nantes': { lat: 47.2184, lng: -1.5536 },
  'strasbourg': { lat: 48.5734, lng: 7.7521 },
  'toulouse': { lat: 43.6047, lng: 1.4442 },
  'nice': { lat: 43.7102, lng: 7.262 },
  'montpellier': { lat: 43.6108, lng: 3.8767 },
  'grenoble': { lat: 45.1885, lng: 5.7245 },
  'dijon': { lat: 47.322, lng: 5.0415 },
  'tours': { lat: 47.3941, lng: 0.6848 },
  'orleans': { lat: 47.9029, lng: 1.9039 },
  'caen': { lat: 49.1829, lng: -0.3707 },
  'le-havre': { lat: 49.4944, lng: 0.1079 },
  'reims': { lat: 49.2583, lng: 4.0317 },
  'metz': { lat: 49.1193, lng: 6.1757 },
  'nancy': { lat: 48.6921, lng: 6.1844 },
  'clermont-ferrand': { lat: 45.7772, lng: 3.087 },
  'angers': { lat: 47.4784, lng: -0.5632 },
  'brest': { lat: 48.3904, lng: -4.4861 },
  'amiens': { lat: 49.8942, lng: 2.2957 },
  'besancon': { lat: 47.2378, lng: 6.0241 },
};

// « Vélizy-Villacoublay » → « velizy-villacoublay » (accents/casse/espaces neutralisés)
function normalizeVille(v: string): string {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toMapPoints(datacenters: Datacenter[]): MapPoint[] {
  const seen = new Map<string, number>(); // décale légèrement les doublons de ville
  const points: MapPoint[] = [];
  for (const d of datacenters) {
    const f = d.datacenterFields;
    let lat = f.latitude ?? null;
    let lng = f.longitude ?? null;
    // Repli : coordonnées de la ville si les champs exacts sont vides.
    if ((lat == null || lng == null) && f.ville) {
      const c = CITY_COORDS[normalizeVille(f.ville)];
      if (c) {
        const n = seen.get(normalizeVille(f.ville)) ?? 0;
        seen.set(normalizeVille(f.ville), n + 1);
        // Deux sites repliés sur la même ville : léger décalage pour que
        // les deux marqueurs restent cliquables.
        lat = c.lat + n * 0.02;
        lng = c.lng + n * 0.02;
      }
    }
    if (lat == null || lng == null) continue; // ni coordonnées ni ville connue
    points.push({
      title: d.title,
      slug: d.slug,
      ville: f.ville,
      statut: statutInfo(f.statut).key,
      lat,
      lng,
    });
  }
  return points;
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
  query Personas($language: LanguageCodeFilterEnum) {
    personas(first: 20, where: { language: $language, orderby: { field: MENU_ORDER, order: ASC } }) {
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

async function _getPersonas(locale: WpLocale = 'fr'): Promise<Persona[]> {
  if (!endpoint) return PERSONAS;
  try {
    // POST via GraphQLClient, comme toutes les autres requêtes du fichier.
    // (Le GET « simple » échouait sur certains WPGraphQL qui n'acceptent pas
    //  les queries en GET → « fetch failed ».)
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{ personas: { nodes: WpPersonaNode[] } }>(
      client, PERSONAS_QUERY, locale, (d) => d.personas?.nodes ?? [],
    );
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
  query Certifications($language: LanguageCodeFilterEnum) {
    certifications(first: 50, where: { language: $language, orderby: { field: MENU_ORDER, order: ASC } }) {
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

export async function getCertifications(locale: WpLocale = 'fr'): Promise<Certification[]> {
  if (!endpoint) {
    const { sampleCertifications } = await import('./sample-data');
    return sampleCertifications;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{ certifications: { nodes: WpCertificationNode[] } }>(
      client, CERTIFICATIONS_QUERY, locale, (d) => d.certifications?.nodes ?? [],
    );
    const nodes = data.certifications?.nodes ?? [];
    if (nodes.length === 0) {
      const { sampleCertifications } = await import('./sample-data');
      return sampleCertifications;
    }
    // Coercition systématique en chaîne : selon la config ACF/WPGraphQL, un
    // champ peut revenir sous une forme inattendue (tableau, nombre…). On force
    // des strings pour éviter tout crash de rendu React (« Objects are not valid
    // as a React child ») ou d'appel à .normalize() sur un non-string.
    const asText = (v: unknown): string => (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v));
    return nodes.map((n) => ({
      nom: decodeEntities(n.title) || 'Certification',
      categorie: asText(n.certificationFields?.categorie),
      description: asText(n.certificationFields?.description),
      garantie: asText(n.certificationFields?.garantie),
      statut: asText(n.certificationFields?.statut) || 'vise',
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
  // Rétro-compat : d'anciennes données WP stockaient le statut « obtenu ».
  // On le normalise en « conforme » pour qu'il s'affiche « Conforme ».
  const key = statut === 'obtenu' ? 'conforme' : statut || 'vise';
  return { key, label: CERTIF_STATUT_LABELS[key] ?? 'Visé' };
}

// Macro-groupes d'affichage de la page Certifications, dans l'ordre voulu.
// Chaque groupe rassemble une ou plusieurs catégories WP (champ `categorie`).
// Tout ce qui n'entre dans aucun groupe défini tombe dans « Autres certifications ».
export type CertifGroup = { key: string; label: string; items: Certification[] };

const CERTIF_GROUP_ORDER: { key: string; label: string; categories: string[] }[] = [
  { key: 'environnement', label: 'Environnement', categories: ['energie'] },
  { key: 'securite',      label: 'Sécurité',      categories: ['securite', 'souverainete'] },
];

// Normalise une catégorie reçue (minuscules, sans accents, espaces réduits) afin
// de matcher quel que soit le format renvoyé par WPGraphQL : valeur (« securite »)
// OU libellé (« Sécurité de l'information »). Tolère aussi les valeurs non-string
// (tableau, null…) que certaines configs ACF renvoient → évite tout crash serveur.
function normalizeCertCategorie(raw: unknown): string {
  const str = Array.isArray(raw) ? raw.join(' ') : raw == null ? '' : String(raw);
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Pour chaque clé de catégorie (valeur ACF), on accepte aussi son libellé d'affichage.
// → si WP renvoie le libellé au lieu de la valeur, le regroupement fonctionne quand même.
const CERTIF_CATEGORIE_ALIASES: Record<string, string[]> = Object.fromEntries(
  Object.entries(CERTIF_CATEGORIE_LABELS).map(([value, label]) => [
    value,
    [normalizeCertCategorie(value), normalizeCertCategorie(label)],
  ]),
);

/** Vrai si la catégorie d'une certif correspond à l'une des clés de catégorie attendues. */
function certMatchesCategorie(certCategorie: string, wantedKeys: string[]): boolean {
  const c = normalizeCertCategorie(certCategorie);
  return wantedKeys.some((key) => (CERTIF_CATEGORIE_ALIASES[key] ?? [key]).includes(c));
}

/** Regroupe les certifications par macro-groupe, dans l'ordre Environnement → Sécurité → Autres. */
export function groupCertifications(certifs: Certification[]): CertifGroup[] {
  const assignedKeys = CERTIF_GROUP_ORDER.flatMap((g) => g.categories);
  const groups: CertifGroup[] = CERTIF_GROUP_ORDER.map((g) => ({
    key: g.key,
    label: g.label,
    items: certifs.filter((c) => certMatchesCategorie(c.categorie, g.categories)),
  }));
  const autres = certifs.filter((c) => !certMatchesCategorie(c.categorie, assignedKeys));
  if (autres.length) groups.push({ key: 'autres', label: 'Autres', items: autres });
  return groups.filter((g) => g.items.length > 0);
}

// ===========================================================================
// ÉQUIPE — CPT `membre` (titre = nom ; photo = featuredImage) ← NOUVEAU
// ===========================================================================
export type Membre = {
  nom: string;            // = titre du post
  poste: string;
  pole: string;           // directionTechnique | directionGenerale | operations | commerce | exploitation | developpement | transverse
  bio: string;
  linkedin: string | null;
  photo: { sourceUrl: string; altText: string } | null;
};

// Rétro-compat : anciennes clés de pôle encore présentes dans les données WP.
const POLE_LEGACY: Record<string, string> = {
  direction: 'directionGenerale',
  technique: 'directionTechnique',
  commercial: 'commerce',
  support: 'transverse',
};

/**
 * Normalise le pôle renvoyé par WPGraphQL : le select ACF peut revenir en
 * TABLEAU (["direction"]) selon la config — c'était la cause du bug où tous
 * les membres tombaient dans « Support ». On aplatit, puis on traduit les
 * anciennes clés vers les nouvelles.
 */
function normalizePole(v: unknown): string {
  const raw = Array.isArray(v) ? String(v[0] ?? '') : v == null ? '' : String(v);
  const key = raw.trim();
  if (!key) return 'transverse';
  return POLE_LEGACY[key] ?? key;
}

const MEMBRES_QUERY = gql`
  query Membres($language: LanguageCodeFilterEnum) {
    membres(first: 100, where: { language: $language, orderby: { field: MENU_ORDER, order: ASC } }) {
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

export async function getMembres(locale: WpLocale = 'fr'): Promise<Membre[]> {
  if (!endpoint) {
    const { sampleMembres } = await import('./sample-data');
    return sampleMembres;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{ membres: { nodes: WpMembreNode[] } }>(
      client, MEMBRES_QUERY, locale, (d) => d.membres?.nodes ?? [],
    );
    const nodes = data.membres?.nodes ?? [];
    if (nodes.length === 0) {
      const { sampleMembres } = await import('./sample-data');
      return sampleMembres;
    }
    return nodes.map((n) => ({
      nom: decodeEntities(n.title) || 'Membre',
      poste: n.membreFields?.poste ?? '',
      pole: normalizePole(n.membreFields?.pole),
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
  directionTechnique: 'Direction Technique',
  directionGenerale: 'Direction Générale',
  operations: 'Opérations',
  commerce: 'Commerce',
  exploitation: 'Exploitation',
  developpement: 'Développement',
  transverse: 'Transverse',
};
// Ordre d'affichage des pôles sur la page Équipes.
export const POLE_ORDER = [
  'directionTechnique',
  'directionGenerale',
  'operations',
  'commerce',
  'exploitation',
  'developpement',
  'transverse',
];

// ===========================================================================
// SERVICES — CPT `service` (titre = nom du service) ← NOUVEAU
// Branché WPGraphQL : champs ACF/SCF dans le groupe `serviceFields`.
// Retombe sur les données d'exemple si WP est absent ou le CPT vide.
// ===========================================================================
export type Service = {
  titre: string;        // = titre du post WP
  slug: string;         // sert d'ancre sur la page /services
  accroche: string;     // sur-titre court (eyebrow contextuel)
  description: string;  // paragraphe principal
  benefice: string;     // bénéfice client (optionnel)
  icone: string;        // clé d'icône (proximite, ia, colocation, …)
  image: { sourceUrl: string; altText: string } | null;
  lienLabel: string;    // libellé du bouton
  lienUrl: string;      // url du bouton
  home: boolean;        // afficher dans le carrousel d'accueil
};

const SERVICES_QUERY = gql`
  query Services($language: LanguageCodeFilterEnum) {
    services(first: 50, where: { language: $language, orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        slug
        featuredImage { node { sourceUrl altText } }
        serviceFields {
          accroche
          description
          benefice
          icone
          lienLabel
          lienUrl
          home
        }
      }
    }
  }
`;

type WpServiceNode = {
  title: string | null;
  slug: string | null;
  featuredImage: { node: { sourceUrl: string; altText: string } | null } | null;
  serviceFields: {
    accroche: string | null;
    description: string | null;
    benefice: string | null;
    icone: string | null;
    lienLabel: string | null;
    lienUrl: string | null;
    home: boolean | null;
  } | null;
};

async function _getServices(locale: WpLocale = 'fr'): Promise<Service[]> {
  if (!endpoint) {
    const { sampleServices } = await import('./sample-data');
    return sampleServices;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await wpList<{ services: { nodes: WpServiceNode[] } }>(
      client, SERVICES_QUERY, locale, (d) => d.services?.nodes ?? [],
    );
    const nodes = data.services?.nodes ?? [];
    if (nodes.length === 0) {
      const { sampleServices } = await import('./sample-data');
      return sampleServices;
    }
    // Coercition systématique en chaîne (cf. getCertifications) : selon la config
    // ACF/WPGraphQL un champ peut revenir sous une forme inattendue.
    const asText = (v: unknown): string => (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v));
    return nodes.map((n) => ({
      titre: decodeEntities(n.title) || 'Service',
      slug: asText(n.slug),
      accroche: asText(n.serviceFields?.accroche),
      description: asText(n.serviceFields?.description),
      benefice: asText(n.serviceFields?.benefice),
      icone: asText(n.serviceFields?.icone) || 'default',
      // Illustration = image mise en avant WordPress (panneau « Image mise en
      // avant » du service). Toujours dispo dans le schéma → aucune dépendance
      // à un champ ACF (sinon la requête casse et on retombe sur l'exemple).
      // Sinon null → placeholder icône.
      image: n.featuredImage?.node
        ? { sourceUrl: n.featuredImage.node.sourceUrl, altText: n.featuredImage.node.altText ?? '' }
        : null,
      lienLabel: asText(n.serviceFields?.lienLabel) || 'En savoir plus',
      lienUrl: asText(n.serviceFields?.lienUrl) || '/contact',
      home: Boolean(n.serviceFields?.home),
    }));
  } catch (error) {
    logWpError('services', error);
    const { sampleServices } = await import('./sample-data');
    return sampleServices;
  }
}

/** Services à afficher dans le carrousel d'accueil (flag `home`), avec repli sur les 5 premiers. */
export function homeServices(services: Service[], max = 5): Service[] {
  const flagged = services.filter((s) => s.home);
  return (flagged.length ? flagged : services).slice(0, max);
}

// ===========================================================================
// CONTENU DE L'ACCUEIL — champs ACF/SCF `homeFields` sur la Page « accueil »
// (éditable + traduisible via Polylang). Tout est optionnel : chaque champ vide
// retombe sur le texte codé dans la page (repli). Couvre TOUTES les sections :
// Hero, KPIs, Réseau NDC, Services, Engagements, Raison d'être, FAQ, Actualités,
// bandeau certifications / groupe Altarea.
// ===========================================================================
export type HomeKpi = { valeur: string; unite: string; label: string };
export type HomeEngagement = { icon: string; titre: string; desc: string };
export type HomeFigure = { valeur: string; label: string };
export type HomeContent = {
  // Hero
  heroEyebrow: string | null;
  heroTitle: string | null;
  heroLead: string | null;
  heroCtaPrimaryLabel: string | null;
  heroCtaPrimaryUrl: string | null;
  heroCtaSecondaryLabel: string | null;
  heroCtaSecondaryUrl: string | null;
  heroImage: { sourceUrl: string; altText: string } | null;
  heroCaptionTitle: string | null;
  heroCaptionSub: string | null;
  // Bandeau KPI
  kpiTitle: string | null;
  kpis: HomeKpi[];
  // Section « Réseau NDC » (data centers)
  dcEyebrow: string | null;
  dcTitle: string | null;
  dcSub: string | null;
  dcSeeAll: string | null;
  // Section « Nos services »
  servicesEyebrow: string | null;
  servicesTitle1: string | null;
  servicesTitle2: string | null;
  servicesSub: string | null;
  servicesCta: string | null;
  // Section « Nos engagements »
  engEyebrow: string | null;
  engTitle: string | null;
  engSeeAll: string | null;
  engagements: HomeEngagement[];
  engImage: { sourceUrl: string; altText: string } | null; // illustration à côté des cartes
  // Section « Notre raison d'être » (Ambition / Mission / Vision)
  amvEyebrow: string | null;
  amvTitle1: string | null;
  amvTitleAccent: string | null;
  amvTitle2: string | null;
  amvIntro1: string | null;
  amvIntroStrong: string | null;
  amvIntro2: string | null;
  amvFigures: HomeFigure[];
  ambitionTitle: string | null;
  ambitionText: string | null;
  missionTitle: string | null;
  missionText: string | null;
  visionTitle: string | null;
  visionText: string | null;
  // Section « FAQ »
  faqEyebrow: string | null;
  faqTitle: string | null;
  faqImage: { sourceUrl: string; altText: string } | null; // illustrations à côté de la FAQ
  faqImage2: { sourceUrl: string; altText: string } | null;
  // Section « Actualités »
  newsEyebrow: string | null;
  newsTitle: string | null;
  newsSeeAll: string | null;
  // Bandeau certifications / groupe Altarea
  certBannerCertTitle: string | null;
  certBannerCertSub: string | null;
  certBannerCertUrl: string | null;
  certBannerAltareaTitle: string | null;
  certBannerAltareaSub: string | null;
  certBannerAltareaUrl: string | null;
  // Brochure téléchargeable (modale « Télécharger la brochure »)
  brochureUrl: string | null;
};

// Sélection commune des champs `homeFields` (réutilisée par la requête classique
// et par la requête de repli sur les traductions Polylang).
const HOME_FIELDS_SELECTION = `
  heroEyebrow
  heroTitle
  heroLead
  heroCtaPrimaryLabel
  heroCtaPrimaryUrl
  heroCtaSecondaryLabel
  heroCtaSecondaryUrl
  heroImage { node { sourceUrl altText } }
  heroCaptionTitle
  heroCaptionSub
  kpiTitle
  kpis { valeur unite label }
  dcEyebrow
  dcTitle
  dcSub
  dcSeeAll
  servicesEyebrow
  servicesTitle1
  servicesTitle2
  servicesSub
  servicesCta
  engEyebrow
  engTitle
  engSeeAll
  engagements { icon titre desc }
  engImage { node { sourceUrl altText } }
  amvEyebrow
  amvTitle1
  amvTitleAccent
  amvTitle2
  amvIntro1
  amvIntroStrong
  amvIntro2
  amvFigures { valeur label }
  ambitionTitle
  ambitionText
  missionTitle
  missionText
  visionTitle
  visionText
  faqEyebrow
  faqTitle
  faqImage { node { sourceUrl altText } }
  faqImage2 { node { sourceUrl altText } }
  newsEyebrow
  newsTitle
  newsSeeAll
  certBannerCertTitle
  certBannerCertSub
  certBannerCertUrl
  certBannerAltareaTitle
  certBannerAltareaSub
  certBannerAltareaUrl
  brochure { node { mediaItemUrl } }
`;

const HOME_QUERY = gql`
  query HomeContent($language: LanguageCodeFilterEnum) {
    pages(first: 1, where: { name: "accueil", language: $language }) {
      nodes {
        language { code }
        homeFields { ${HOME_FIELDS_SELECTION} }
      }
    }
  }
`;

// Repli Polylang : page FR « accueil » + ses traductions (avec leurs homeFields).
// Sert quand la page traduite porte un slug différent (ex. « accueil-2 ») et n'est
// donc pas trouvée par name:"accueil". Appelée dans un try/catch isolé : si le
// schéma WPGraphQL n'expose pas `translations`, on retombe sans casse sur le FR.
const HOME_TRANSLATIONS_QUERY = gql`
  query HomeContentTranslations {
    pages(first: 1, where: { name: "accueil", language: FR }) {
      nodes {
        homeFields { ${HOME_FIELDS_SELECTION} }
        translations {
          ... on Page {
            language { code }
            homeFields { ${HOME_FIELDS_SELECTION} }
          }
        }
      }
    }
  }
`;

type WpHomeFields = {
  heroEyebrow: string | null;
  heroTitle: string | null;
  heroLead: string | null;
  heroCtaPrimaryLabel: string | null;
  heroCtaPrimaryUrl: string | null;
  heroCtaSecondaryLabel: string | null;
  heroCtaSecondaryUrl: string | null;
  heroImage: { node: { sourceUrl: string; altText: string } | null } | null;
  heroCaptionTitle: string | null;
  heroCaptionSub: string | null;
  kpiTitle: string | null;
  kpis: { valeur: string | null; unite: string | null; label: string | null }[] | null;
  dcEyebrow: string | null;
  dcTitle: string | null;
  dcSub: string | null;
  dcSeeAll: string | null;
  servicesEyebrow: string | null;
  servicesTitle1: string | null;
  servicesTitle2: string | null;
  servicesSub: string | null;
  servicesCta: string | null;
  engEyebrow: string | null;
  engTitle: string | null;
  engSeeAll: string | null;
  engagements: { icon: string | string[] | null; titre: string | null; desc: string | null }[] | null;
  engImage: { node: { sourceUrl: string; altText: string } | null } | null;
  amvEyebrow: string | null;
  amvTitle1: string | null;
  amvTitleAccent: string | null;
  amvTitle2: string | null;
  amvIntro1: string | null;
  amvIntroStrong: string | null;
  amvIntro2: string | null;
  amvFigures: { valeur: string | null; label: string | null }[] | null;
  ambitionTitle: string | null;
  ambitionText: string | null;
  missionTitle: string | null;
  missionText: string | null;
  visionTitle: string | null;
  visionText: string | null;
  faqEyebrow: string | null;
  faqTitle: string | null;
  faqImage: { node: { sourceUrl: string; altText: string } | null } | null;
  faqImage2: { node: { sourceUrl: string; altText: string } | null } | null;
  newsEyebrow: string | null;
  newsTitle: string | null;
  newsSeeAll: string | null;
  certBannerCertTitle: string | null;
  certBannerCertSub: string | null;
  certBannerCertUrl: string | null;
  certBannerAltareaTitle: string | null;
  certBannerAltareaSub: string | null;
  certBannerAltareaUrl: string | null;
  brochure: { node: { mediaItemUrl: string | null } | null } | null;
} | null;

/** Convertit les champs WordPress bruts (`homeFields`) en contenu normalisé. */
function mapHome(f: NonNullable<WpHomeFields>): HomeContent {
  return {
    heroEyebrow: f.heroEyebrow || null,
    heroTitle: f.heroTitle || null,
    heroLead: f.heroLead || null,
    heroCtaPrimaryLabel: f.heroCtaPrimaryLabel || null,
    heroCtaPrimaryUrl: f.heroCtaPrimaryUrl || null,
    heroCtaSecondaryLabel: f.heroCtaSecondaryLabel || null,
    heroCtaSecondaryUrl: f.heroCtaSecondaryUrl || null,
    heroImage: f.heroImage?.node
      ? { sourceUrl: f.heroImage.node.sourceUrl, altText: f.heroImage.node.altText ?? '' }
      : null,
    heroCaptionTitle: f.heroCaptionTitle || null,
    heroCaptionSub: f.heroCaptionSub || null,
    kpiTitle: f.kpiTitle || null,
    kpis: (f.kpis ?? [])
      .map((k) => ({ valeur: k.valeur ?? '', unite: k.unite ?? '', label: k.label ?? '' }))
      .filter((k) => k.valeur || k.label),
    dcEyebrow: f.dcEyebrow || null,
    dcTitle: f.dcTitle || null,
    dcSub: f.dcSub || null,
    dcSeeAll: f.dcSeeAll || null,
    servicesEyebrow: f.servicesEyebrow || null,
    servicesTitle1: f.servicesTitle1 || null,
    servicesTitle2: f.servicesTitle2 || null,
    servicesSub: f.servicesSub || null,
    servicesCta: f.servicesCta || null,
    engEyebrow: f.engEyebrow || null,
    engTitle: f.engTitle || null,
    engSeeAll: f.engSeeAll || null,
    engagements: (f.engagements ?? [])
      // ACF/SCF select via WPGraphQL peut renvoyer l'icône en tableau (["decarbon"])
      // ou en chaîne : on normalise toujours vers une chaîne.
      .map((e) => ({
        icon: Array.isArray(e.icon) ? (e.icon[0] ?? '') : (e.icon ?? ''),
        titre: e.titre ?? '',
        desc: e.desc ?? '',
      }))
      .filter((e) => e.titre || e.desc),
    engImage: f.engImage?.node
      ? { sourceUrl: f.engImage.node.sourceUrl, altText: f.engImage.node.altText ?? '' }
      : null,
    amvEyebrow: f.amvEyebrow || null,
    amvTitle1: f.amvTitle1 || null,
    amvTitleAccent: f.amvTitleAccent || null,
    amvTitle2: f.amvTitle2 || null,
    amvIntro1: f.amvIntro1 || null,
    amvIntroStrong: f.amvIntroStrong || null,
    amvIntro2: f.amvIntro2 || null,
    amvFigures: (f.amvFigures ?? [])
      .map((v) => ({ valeur: v.valeur ?? '', label: v.label ?? '' }))
      .filter((v) => v.valeur || v.label),
    ambitionTitle: f.ambitionTitle || null,
    ambitionText: f.ambitionText || null,
    missionTitle: f.missionTitle || null,
    missionText: f.missionText || null,
    visionTitle: f.visionTitle || null,
    visionText: f.visionText || null,
    faqEyebrow: f.faqEyebrow || null,
    faqTitle: f.faqTitle || null,
    faqImage: f.faqImage?.node
      ? { sourceUrl: f.faqImage.node.sourceUrl, altText: f.faqImage.node.altText ?? '' }
      : null,
    faqImage2: f.faqImage2?.node
      ? { sourceUrl: f.faqImage2.node.sourceUrl, altText: f.faqImage2.node.altText ?? '' }
      : null,
    newsEyebrow: f.newsEyebrow || null,
    newsTitle: f.newsTitle || null,
    newsSeeAll: f.newsSeeAll || null,
    certBannerCertTitle: f.certBannerCertTitle || null,
    certBannerCertSub: f.certBannerCertSub || null,
    certBannerCertUrl: f.certBannerCertUrl || null,
    certBannerAltareaTitle: f.certBannerAltareaTitle || null,
    certBannerAltareaSub: f.certBannerAltareaSub || null,
    certBannerAltareaUrl: f.certBannerAltareaUrl || null,
    brochureUrl: f.brochure?.node?.mediaItemUrl || null,
  };
}

/**
 * Contenu éditorial de l'accueil depuis WordPress (page « accueil », champs
 * `homeFields`). Stratégie :
 *   1) lookup classique par slug + langue (name:"accueil") ;
 *   2) pour une langue secondaire dont la page traduite a un slug différent
 *      (ex. « accueil-2 »), repli via le lien de traduction Polylang ;
 *   3) sinon repli sur le contenu FR, puis sur les textes par défaut du site.
 */
async function _getHome(locale: WpLocale = 'fr'): Promise<HomeContent | null> {
  if (!endpoint) return null;
  const client = new GraphQLClient(endpoint);

  // 1) Lookup classique : page de slug « accueil » dans la langue demandée.
  //    On n'accepte la page QUE si sa langue correspond vraiment à la locale :
  //    WPGraphQL/Polylang peut renvoyer la page FR pour une requête EN quand le
  //    slug traduit diffère (ex. « accueil-2 ») → on la rejette pour passer au
  //    repli traduction (étape 2), qui ramène le bon contenu traduit.
  try {
    const data = await client.request<{ pages: { nodes: { language: { code: string | null } | null; homeFields: WpHomeFields }[] } }>(
      HOME_QUERY, { language: wpLang(locale) },
    );
    const node = data.pages?.nodes?.[0];
    const code = (node?.language?.code ?? '').toUpperCase();
    // Accepte si la langue correspond, OU si le schéma n'expose pas `language`
    // (code vide) → on ne casse pas le comportement pour un schéma sans Polylang.
    if (node?.homeFields && (code === wpLang(locale) || code === '')) {
      return mapHome(node.homeFields);
    }
  } catch (error) {
    logWpError('accueil', error);
  }

  // FR : la page principale ; pas de repli traduction possible.
  if (locale === 'fr') return null;

  // 2) Langue secondaire introuvable par slug (slug traduit différent, ex.
  //    « accueil-2 ») → on récupère la page FR et sa traduction via Polylang.
  try {
    const data = await client.request<{
      pages: { nodes: {
        homeFields: WpHomeFields;
        translations: ({ language: { code: string | null } | null; homeFields: WpHomeFields } | null)[] | null;
      }[] };
    }>(HOME_TRANSLATIONS_QUERY, {});
    const node = data.pages?.nodes?.[0];
    const want = wpLang(locale);
    const tr = node?.translations?.find(
      (t) => (t?.language?.code ?? '').toUpperCase() === want,
    );
    if (tr?.homeFields) return mapHome(tr.homeFields);
    // 3) Repli final : contenu FR de la page principale.
    if (node?.homeFields) return mapHome(node.homeFields);
  } catch (error) {
    logWpError('accueil (traductions Polylang)', error);
  }

  return null;
}

// ===========================================================================
// BRANDING GLOBAL — logo du site (header + footer), éditable dans WP.
// Champs `siteLogo` / `siteLogoWhite` (images) du groupe homeFields de la page
// « accueil ». Requête volontairement légère (appelée sur chaque page via le
// layout). Retour { logo, logoWhite } avec null quand non défini → repli sur
// la marque N|D|C dessinée.
// ===========================================================================
export type SiteBranding = {
  logo: string | null;
  logoWhite: string | null;
  // Images des cartes promo des menus déroulants (éditables dans WP,
  // onglet Marque de l'accueil). Null = image par défaut du site.
  equipeImage: string | null;   // carte « Découvrir notre équipe » (Nos services)
  offresImage: string | null;   // carte « Découvrir nos engagements » (Nos offres)
};

const SITE_BRANDING_QUERY = gql`
  query SiteBranding {
    pages(first: 1, where: { name: "accueil", language: FR }) {
      nodes {
        homeFields {
          siteLogo { node { sourceUrl } }
          siteLogoWhite { node { sourceUrl } }
          headerEquipeImage { node { sourceUrl } }
          headerOffresImage { node { sourceUrl } }
        }
      }
    }
  }
`;

// Variante SANS headerEquipeImage : si le champ n'existe pas encore dans le
// schéma WP (groupe non mis à jour), la requête complète échoue — on retombe
// sur celle-ci pour ne pas perdre le logo.
const SITE_BRANDING_QUERY_LEGACY = gql`
  query SiteBrandingLegacy {
    pages(first: 1, where: { name: "accueil", language: FR }) {
      nodes {
        homeFields {
          siteLogo { node { sourceUrl } }
          siteLogoWhite { node { sourceUrl } }
        }
      }
    }
  }
`;

async function _getSiteBranding(): Promise<SiteBranding> {
  const empty: SiteBranding = { logo: null, logoWhite: null, equipeImage: null, offresImage: null };
  if (!endpoint) return empty;
  type F = {
    siteLogo: { node: { sourceUrl: string | null } | null } | null;
    siteLogoWhite: { node: { sourceUrl: string | null } | null } | null;
    headerEquipeImage?: { node: { sourceUrl: string | null } | null } | null;
    headerOffresImage?: { node: { sourceUrl: string | null } | null } | null;
  };
  const client = new GraphQLClient(endpoint);
  const run = async (query: string) => {
    const data = await client.request<{ pages: { nodes: { homeFields: F | null }[] } }>(query, {});
    return data.pages?.nodes?.[0]?.homeFields ?? null;
  };
  try {
    // 1) Requête complète ; 2) repli sans headerEquipeImage si le champ
    //    n'existe pas encore côté WP (le logo reste servi).
    let f: F | null = null;
    try {
      f = await run(SITE_BRANDING_QUERY);
    } catch {
      f = await run(SITE_BRANDING_QUERY_LEGACY);
    }
    return {
      logo: f?.siteLogo?.node?.sourceUrl || null,
      logoWhite: f?.siteLogoWhite?.node?.sourceUrl || null,
      equipeImage: f?.headerEquipeImage?.node?.sourceUrl || null,
      offresImage: f?.headerOffresImage?.node?.sourceUrl || null,
    };
  } catch (error) {
    logWpError('branding (logo du site)', error);
    return empty;
  }
}

// ===========================================================================
// PAGES ÉDITORIALES — Groupe Altarea & Notre équipe (100 % éditables dans WP)
// ---------------------------------------------------------------------------
// Même modèle que la home (`homeFields`) : un groupe ACF attaché à la page
// (slug « groupe » / « equipes »), lu en GraphQL, avec repli sur les
// traductions Polylang (slug traduit différent) puis sur les textes par
// défaut du site (messages/*.json) champ par champ.
// ===========================================================================

/**
 * Récupère le groupe de champs ACF `graphqlField` de la page de slug `slug`,
 * pour la langue demandée. Repli 1 : traductions Polylang de la page FR.
 * Repli 2 : champs FR. Retour null si WP absent / page absente / erreur.
 */
async function getPageFields<F>(
  slug: string,
  graphqlField: string,
  selection: string,
  locale: WpLocale,
): Promise<F | null> {
  if (!endpoint) return null;
  const client = new GraphQLClient(endpoint);
  type PageNode = Record<string, unknown> & {
    translations?: ({ language: { code: string | null } | null } & Record<string, unknown>)[] | null;
  };

  // 1) Page dans la langue demandée (fonctionne si le slug traduit est identique).
  try {
    const QUERY = gql`
      query PageFields($language: LanguageCodeFilterEnum) {
        pages(first: 1, where: { name: "${slug}", language: $language }) {
          nodes { ${graphqlField} { ${selection} } }
        }
      }
    `;
    const data = await client.request<{ pages: { nodes: PageNode[] } }>(QUERY, { language: wpLang(locale) });
    const f = data.pages?.nodes?.[0]?.[graphqlField] as F | null | undefined;
    if (f) return f;
  } catch (error) {
    logWpError(`page ${slug}`, error);
    return null;
  }
  if (locale === 'fr') return null;

  // 2) Repli Polylang : page FR + ses traductions (slug traduit ≠ slug FR).
  try {
    const TR_QUERY = gql`
      query PageFieldsTranslations {
        pages(first: 1, where: { name: "${slug}", language: FR }) {
          nodes {
            ${graphqlField} { ${selection} }
            translations {
              ... on Page {
                language { code }
                ${graphqlField} { ${selection} }
              }
            }
          }
        }
      }
    `;
    const data = await client.request<{ pages: { nodes: PageNode[] } }>(TR_QUERY, {});
    const node = data.pages?.nodes?.[0];
    const want = wpLang(locale);
    const tr = node?.translations?.find((t) => (t?.language?.code ?? '').toUpperCase() === want);
    if (tr?.[graphqlField]) return tr[graphqlField] as F;
    if (node?.[graphqlField]) return node[graphqlField] as F;
  } catch (error) {
    logWpError(`page ${slug} (traductions Polylang)`, error);
  }
  return null;
}

// --- Page Groupe Altarea -----------------------------------------------------
export type GroupeMetier = { titre: string; desc: string };
export type GroupeContent = {
  heroEyebrow: string | null;
  heroTitle: string | null;
  heroLead: string | null;
  heroCta1Label: string | null;
  heroCta1Url: string | null;
  heroCta2Label: string | null;
  heroCta2Url: string | null;
  heroImage: { sourceUrl: string; altText: string } | null;
  heroCaptionTitle: string | null;
  heroCaptionSub: string | null;
  kpiTitle: string | null;
  kpiMeta: string | null;
  chiffres: HomeKpi[];
  metiersEyebrow: string | null;
  metiersTitle: string | null;
  metiersLead: string | null;
  metiers: GroupeMetier[];
  engEyebrow: string | null;
  engTitle: string | null;
  engLead: string | null;
  engStatValue: string | null;
  engStatLabel: string | null;
  engagements: GroupeMetier[];
  finalTitle: string | null;
  finalLead: string | null;
  finalCtaLabel: string | null;
  finalCtaUrl: string | null;
};

const GROUPE_FIELDS_SELECTION = `
  heroEyebrow
  heroTitle
  heroLead
  heroCta1Label
  heroCta1Url
  heroCta2Label
  heroCta2Url
  heroImage { node { sourceUrl altText } }
  heroCaptionTitle
  heroCaptionSub
  kpiTitle
  kpiMeta
  chiffres { valeur unite label }
  metiersEyebrow
  metiersTitle
  metiersLead
  metiers { titre desc }
  engEyebrow
  engTitle
  engLead
  engStatValue
  engStatLabel
  engagements { titre desc }
  finalTitle
  finalLead
  finalCtaLabel
  finalCtaUrl
`;

type WpGroupeFields = {
  heroEyebrow: string | null;
  heroTitle: string | null;
  heroLead: string | null;
  heroCta1Label: string | null;
  heroCta1Url: string | null;
  heroCta2Label: string | null;
  heroCta2Url: string | null;
  heroImage: { node: { sourceUrl: string; altText: string } | null } | null;
  heroCaptionTitle: string | null;
  heroCaptionSub: string | null;
  kpiTitle: string | null;
  kpiMeta: string | null;
  chiffres: { valeur: string | null; unite: string | null; label: string | null }[] | null;
  metiersEyebrow: string | null;
  metiersTitle: string | null;
  metiersLead: string | null;
  metiers: { titre: string | null; desc: string | null }[] | null;
  engEyebrow: string | null;
  engTitle: string | null;
  engLead: string | null;
  engStatValue: string | null;
  engStatLabel: string | null;
  engagements: { titre: string | null; desc: string | null }[] | null;
  finalTitle: string | null;
  finalLead: string | null;
  finalCtaLabel: string | null;
  finalCtaUrl: string | null;
};

export async function getGroupe(locale: WpLocale = 'fr'): Promise<GroupeContent | null> {
  const f = await getPageFields<WpGroupeFields>('groupe', 'groupeFields', GROUPE_FIELDS_SELECTION, locale);
  if (!f) return null;
  const cards = (list: { titre: string | null; desc: string | null }[] | null) =>
    (list ?? [])
      .map((m) => ({ titre: m.titre ?? '', desc: m.desc ?? '' }))
      .filter((m) => m.titre || m.desc);
  return {
    heroEyebrow: f.heroEyebrow || null,
    heroTitle: f.heroTitle || null,
    heroLead: f.heroLead || null,
    heroCta1Label: f.heroCta1Label || null,
    heroCta1Url: f.heroCta1Url || null,
    heroCta2Label: f.heroCta2Label || null,
    heroCta2Url: f.heroCta2Url || null,
    heroImage: f.heroImage?.node
      ? { sourceUrl: f.heroImage.node.sourceUrl, altText: f.heroImage.node.altText ?? '' }
      : null,
    heroCaptionTitle: f.heroCaptionTitle || null,
    heroCaptionSub: f.heroCaptionSub || null,
    kpiTitle: f.kpiTitle || null,
    kpiMeta: f.kpiMeta || null,
    chiffres: (f.chiffres ?? [])
      .map((k) => ({ valeur: k.valeur ?? '', unite: k.unite ?? '', label: k.label ?? '' }))
      .filter((k) => k.valeur || k.label),
    metiersEyebrow: f.metiersEyebrow || null,
    metiersTitle: f.metiersTitle || null,
    metiersLead: f.metiersLead || null,
    metiers: cards(f.metiers),
    engEyebrow: f.engEyebrow || null,
    engTitle: f.engTitle || null,
    engLead: f.engLead || null,
    engStatValue: f.engStatValue || null,
    engStatLabel: f.engStatLabel || null,
    engagements: cards(f.engagements),
    finalTitle: f.finalTitle || null,
    finalLead: f.finalLead || null,
    finalCtaLabel: f.finalCtaLabel || null,
    finalCtaUrl: f.finalCtaUrl || null,
  };
}

// --- Page Notre équipe (en-tête + ordre des pôles) ---------------------------
export type EquipesHead = {
  eyebrow: string | null;
  titre: string | null;
  intro: string | null;
  // Ordre d'affichage des pôles choisi dans WP (repeater glisser-déposer).
  // Vide = ordre par défaut du site (POLE_ORDER).
  polesOrdre: string[];
};

// Slugs possibles de la page « équipe » : WP suffixe les slugs dupliqués
// (« equipes-2 »…) quand une page du même nom a existé — on les tente tous.
const EQUIPES_SLUGS = ['equipes', 'equipes-2', 'nos-equipes', 'notre-equipe'];

export async function getEquipesHead(locale: WpLocale = 'fr'): Promise<EquipesHead | null> {
  type F = {
    eyebrow: string | null;
    titre: string | null;
    intro: string | null;
    polesOrdre?: ({ pole: string | string[] | { value?: string } | null } | null)[] | null;
  };
  // 1) Requête complète sur chaque variante de slug. 2) Si tout échoue
  //    (champ polesOrdre pas encore créé côté WP → erreur de schéma), on
  //    retente SANS lui : l'en-tête reste éditable même si WP n'est pas à jour.
  let f: F | null = null;
  for (const slug of EQUIPES_SLUGS) {
    f = await getPageFields<F>(
      slug, 'equipesFields', 'eyebrow titre intro polesOrdre { pole }', locale,
    );
    if (f) break;
  }
  if (!f) {
    for (const slug of EQUIPES_SLUGS) {
      f = await getPageFields<F>(slug, 'equipesFields', 'eyebrow titre intro', locale);
      if (f) break;
    }
  }
  if (!f) return null;
  // Normalisation : la valeur du select peut arriver en chaîne, tableau ou
  // objet {value} selon le réglage du champ — on ramène tout à une chaîne.
  const poleValue = (v: unknown): string => {
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return poleValue(v[0]);
    if (v && typeof v === 'object' && 'value' in v) return String((v as { value?: unknown }).value ?? '');
    return '';
  };
  // Nettoyage : lignes vides filtrées, doublons retirés (le premier gagne).
  const seen = new Set<string>();
  const polesOrdre = (f.polesOrdre ?? [])
    .map((r) => poleValue(r?.pole))
    .filter((p) => p && !seen.has(p) && (seen.add(p), true));
  return {
    eyebrow: f.eyebrow || null,
    titre: f.titre || null,
    intro: f.intro || null,
    polesOrdre,
  };
}

// --- Documentation (livrets téléchargeables) ----------------------------------
// CPT WP « livret » : couverture (image à la une), description, fichier PDF.
// Affichés sur /documentation ; téléchargement contre e-mail (lead « download »).
export type Livret = {
  titre: string;
  slug: string;
  description: string;
  fichierUrl: string | null;
  cover: { sourceUrl: string; altText: string } | null;
};

const LIVRETS_SELECTION = `
      nodes {
        title
        slug
        featuredImage { node { sourceUrl altText } }
        livretFields {
          description
          fichier { node { mediaItemUrl } }
        }
      }
`;

const LIVRETS_QUERY = gql`
  query Livrets($language: LanguageCodeFilterEnum) {
    livrets(first: 50, where: { language: $language, orderby: { field: MENU_ORDER, order: ASC } }) {
      ${LIVRETS_SELECTION}
    }
  }
`;

// Variante SANS filtre de langue : si Polylang ne gère pas (encore) le type
// « Livrets » (Langues → Réglages), l'argument `language` n'existe pas sur
// cette connexion et la requête filtrée échoue entièrement. On retombe alors
// sur cette version pour afficher quand même les livrets.
const LIVRETS_QUERY_NOLANG = gql`
  query LivretsAll {
    livrets(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      ${LIVRETS_SELECTION}
    }
  }
`;

export async function getLivrets(locale: WpLocale = 'fr'): Promise<Livret[]> {
  const fallback = async (): Promise<Livret[]> => {
    const { sampleLivrets } = await import('./sample-data');
    return sampleLivrets;
  };
  if (!endpoint) return fallback();
  type Node = {
    title: string;
    slug: string;
    featuredImage: { node: { sourceUrl: string; altText: string } | null } | null;
    livretFields: {
      description: string | null;
      fichier: { node: { mediaItemUrl: string | null } | null } | null;
    } | null;
  };
  const map = (nodes: Node[]): Livret[] =>
    nodes.map((n) => ({
      titre: decodeEntities(n.title),
      slug: n.slug,
      description: n.livretFields?.description ?? '',
      fichierUrl: n.livretFields?.fichier?.node?.mediaItemUrl ?? null,
      cover: n.featuredImage?.node
        ? { sourceUrl: n.featuredImage.node.sourceUrl, altText: n.featuredImage.node.altText ?? '' }
        : null,
    }));

  const client = new GraphQLClient(endpoint);
  // 1) Requête filtrée par langue (Polylang actif sur le CPT livret).
  try {
    const data = await wpList<{ livrets: { nodes: Node[] } }>(
      client, LIVRETS_QUERY, locale, (d) => d.livrets.nodes,
    );
    const nodes = data.livrets?.nodes ?? [];
    if (nodes.length) return map(nodes);
  } catch (error) {
    logWpError('livrets (filtre langue)', error);
  }
  // 2) Repli sans filtre de langue (CPT non géré par Polylang, ou aucun
  //    livret dans la langue demandée).
  try {
    const data = await client.request<{ livrets: { nodes: Node[] } }>(LIVRETS_QUERY_NOLANG);
    const nodes = data.livrets?.nodes ?? [];
    if (nodes.length) return map(nodes);
  } catch (error) {
    logWpError('livrets', error);
  }
  return fallback();
}

// --- Page Contact ------------------------------------------------------------
// Tout le contenu éditorial de la page contact (en-tête, coordonnées,
// arguments de réassurance) est éditable dans WP : page « contact »,
// groupe ACF « contactFields ». Chaque champ vide retombe sur le texte
// par défaut du site (messages/*.json ou valeur codée).
export type ContactContent = {
  eyebrow: string | null;
  titre: string | null;
  intro: string | null;
  subsidiary: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  horaires: string | null;
  linkedin: string | null;
  whyTitle: string | null;
  whys: string[]; // arguments de réassurance (vides filtrés)
};

export async function getContact(locale: WpLocale = 'fr'): Promise<ContactContent | null> {
  type F = {
    eyebrow: string | null; titre: string | null; intro: string | null;
    subsidiary: string | null; email: string | null; telephone: string | null;
    adresse: string | null; horaires: string | null; linkedin: string | null;
    whyTitle: string | null; why1: string | null; why2: string | null;
    why3: string | null; why4: string | null;
  };
  const f = await getPageFields<F>(
    'contact', 'contactFields',
    'eyebrow titre intro subsidiary email telephone adresse horaires linkedin whyTitle why1 why2 why3 why4',
    locale,
  );
  if (!f) return null;
  return {
    eyebrow: f.eyebrow || null,
    titre: f.titre || null,
    intro: f.intro || null,
    subsidiary: f.subsidiary || null,
    email: f.email || null,
    telephone: f.telephone || null,
    adresse: f.adresse || null,
    horaires: f.horaires || null,
    linkedin: f.linkedin || null,
    whyTitle: f.whyTitle || null,
    whys: [f.why1, f.why2, f.why3, f.why4].filter((w): w is string => !!w && w.trim() !== ''),
  };
}


// Déduplication par rendu (React.cache) : layout + page + generateMetadata
// partagent le même résultat dans une même requête, au lieu de refetcher WP.
export const getDatacenters = cache(_getDatacenters);
export const getDatacenter = cache(_getDatacenter);
export const getPersonas = cache(_getPersonas);
export const getSiteBranding = cache(_getSiteBranding);
export const getPostBySlug = cache(_getPostBySlug);
export const getAllPosts = cache(_getAllPosts);
export const getHome = cache(_getHome);
export const getServices = cache(_getServices);
