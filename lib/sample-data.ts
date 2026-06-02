import type { Datacenter } from './wordpress';

// Données d'exemple enrichies : utilisées tant que WORDPRESS_GRAPHQL_ENDPOINT n'est pas défini.
// Elles incluent coordonnées + contenu riche pour faire vivre la carte et les pages de détail.
export const sampleDatacenters: Datacenter[] = [
  {
    title: 'Rennes 1',
    slug: 'rennes-1',
    datacenterFields: {
      ville: 'Rennes',
      statut: ['livre'],
      latitude: 48.117,
      longitude: -1.677,
      puissance: '4 MW IT',
      accroche:
        'Premier site du réseau NDC, conçu pour un hébergement souverain et décarboné au cœur de la Bretagne.',
      description:
        'Implanté en périphérie rennaise, le site Rennes 1 propose un hébergement en colocation sur mesure, pensé pour les enjeux critiques des entreprises et collectivités du Grand Ouest. Conception Tier III, refroidissement sans eau et alimentation 100 % renouvelable.',
      kpis: [
        { label: 'PUE cible', valeur: '1,2', unite: '' },
        { label: 'Surface IT', valeur: '1 000', unite: 'm²' },
        { label: 'Disponibilité', valeur: '99,982', unite: '%' },
        { label: 'Conception', valeur: 'Tier III', unite: '' },
      ],
      caracteristiques: [
        { categorie: 'securite', intitule: 'SAS biométrique ANSSI', detail: 'Accès unipersonnel, double authentification, vidéosurveillance 24/7.' },
        { categorie: 'refroidissement', intitule: 'Free cooling N+2', detail: 'Zéro consommation d’eau, confinement des allées.' },
        { categorie: 'electrique', intitule: 'Double chaîne 2N', detail: 'Boucle haute disponibilité, groupes électrogènes redondés.' },
        { categorie: 'connectivite', intitule: 'Meet-me-room', detail: 'Accès aux opérateurs télécom de votre choix.' },
      ],
      benefices: [
        { titre: 'Maîtrise des coûts', texte: 'Une efficacité énergétique exemplaire qui réduit vos coûts d’exploitation.' },
        { titre: 'Conformité', texte: 'Un hébergement souverain aligné avec vos obligations réglementaires.' },
        { titre: 'Continuité', texte: 'Vos applications critiques restent disponibles en toutes circonstances.' },
      ],
    },
  },
  {
    title: 'Vélizy',
    slug: 'velizy',
    datacenterFields: {
      ville: 'Vélizy-Villacoublay',
      statut: ['construction'],
      latitude: 48.783,
      longitude: 2.196,
      puissance: '6 MW IT',
      accroche: 'Site francilien en construction, pensé pour la haute densité et la connectivité maximale.',
      description:
        'Au sud-ouest de Paris, Vélizy viendra renforcer la couverture francilienne du réseau NDC avec une capacité haute densité et une connectivité renforcée vers les principaux points d’échange.',
      kpis: [
        { label: 'PUE cible', valeur: '1,2', unite: '' },
        { label: 'Ouverture', valeur: '2027', unite: '' },
      ],
      caracteristiques: [
        { categorie: 'resilience', intitule: 'Architecture redondée', detail: 'Aucune zone à point de défaillance unique.' },
        { categorie: 'connectivite', intitule: 'Double meet-me-room', detail: 'Redondance des accès opérateurs.' },
      ],
      benefices: [
        { titre: 'Proximité Paris', texte: 'Un accès rapide depuis la métropole francilienne.' },
      ],
    },
  },
  {
    title: 'Lyon Est',
    slug: 'lyon-est',
    datacenterFields: {
      ville: 'Lyon',
      statut: ['avenir'],
      latitude: 45.764,
      longitude: 4.835,
      puissance: '8 MW IT',
      accroche: 'Futur point d’ancrage du réseau dans la vallée du Rhône, à l’horizon du plan 15 sites.',
      description:
        'Le futur site lyonnais étendra le réseau NDC vers le sud-est, au service de l’écosystème économique rhônalpin.',
      kpis: [{ label: 'Horizon', valeur: '2028', unite: '' }],
      caracteristiques: [],
      benefices: [],
    },
  },
  {
    title: 'Normandie',
    slug: 'normandie',
    datacenterFields: {
      ville: 'Rouen',
      statut: ['avenir'],
      latitude: 49.443,
      longitude: 1.099,
      puissance: '5 MW IT',
      accroche: 'Implantation normande prévue pour densifier la couverture du nord-ouest.',
      description: 'Un site pensé pour rapprocher l’hébergement souverain des acteurs économiques normands.',
      kpis: [{ label: 'Horizon', valeur: '2029', unite: '' }],
      caracteristiques: [],
      benefices: [],
    },
  },
];

import type { Post } from './wordpress';

// Articles d'exemple (repli tant que l'API n'est pas branchée).
export const samplePosts: Post[] = [
  {
    title: 'Data Center Tier 3 : les niveaux de classification des centres de données',
    slug: 'datacenter-tier-3-classification',
    date: '2026-05-12T09:00:00',
    excerpt:
      'Dans un monde de plus en plus numérique, les data centers se placent au cœur des stratégies IT. Comment garantir qu’un data center réponde à ces exigences ?',
    featuredImage: null,
  },
  {
    title: 'Comment refroidir un Data Center ?',
    slug: 'comment-refroidir-un-datacenter',
    date: '2026-04-28T09:00:00',
    excerpt:
      'Les data centers génèrent une chaleur qu’il est nécessaire de réguler. Maintenir une température idéale est un enjeu majeur pour la performance et la durabilité des infrastructures.',
    featuredImage: null,
  },
  {
    title: 'Salle serveur : définition et particularités',
    slug: 'salle-serveur-definition',
    date: '2026-04-10T09:00:00',
    excerpt:
      'La salle serveur est le cœur d’un data center. Elle doit garantir un environnement optimal pour protéger les serveurs tout en maximisant leurs performances.',
    featuredImage: null,
  },
];
