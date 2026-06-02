import { GraphQLClient, gql } from 'graphql-request';
import { sampleDatacenters } from './sample-data';

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
    // Champs riches (ACF Pro) — présents en données d'exemple ;
    // à ajouter à la requête live une fois l'environnement passé sur ACF Pro.
    description?: string | null;
    kpis?: Kpi[] | null;
    caracteristiques?: Caracteristique[] | null;
    benefices?: Benefice[] | null;
  };
};

// --- Requêtes --------------------------------------------------------------
// On ne demande que les champs garantis par le modèle actuel (ACF gratuit) :
// latitude/longitude (number) et accroche (textarea) existent ; les repeater (Pro) non.
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
      }
    }
  }
`;

// --- Accès aux données -----------------------------------------------------
export async function getDatacenters(): Promise<Datacenter[]> {
  if (!endpoint) return sampleDatacenters;
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ datacenters: { nodes: Datacenter[] } }>(DATACENTERS_QUERY);
    return data.datacenters.nodes;
  } catch (error) {
    console.error('[NDC] Échec requête datacenters, repli données d’exemple.', error);
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
    console.error('[NDC] Échec requête datacenter, repli données d’exemple.', error);
    return sampleDatacenters.find((d) => d.slug === slug) ?? null;
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

// --- Articles / Actualités -------------------------------------------------
export type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string | null;
  featuredImage?: { node: { sourceUrl: string; altText: string } } | null;
};

const RECENT_POSTS_QUERY = gql`
  query RecentPosts {
    posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
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

export async function getRecentPosts(): Promise<Post[]> {
  if (!endpoint) {
    const { samplePosts } = await import('./sample-data');
    return samplePosts;
  }
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ posts: { nodes: Post[] } }>(RECENT_POSTS_QUERY);
    return data.posts.nodes;
  } catch (error) {
    console.error('[NDC] Échec requête articles, repli données d’exemple.', error);
    const { samplePosts } = await import('./sample-data');
    return samplePosts;
  }
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\[(\u2026|\.\.\.|&hellip;)\]/g, '…').trim();
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
