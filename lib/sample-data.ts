import type { Datacenter } from './wordpress';
import type { Post } from './wordpress';
import type { WPPost, WPCategory } from './wordpress';
import type { Faq } from './wordpress';
import type { Certification, Membre, Service } from './wordpress';

// Données d'exemple enrichies : utilisées tant que WORDPRESS_GRAPHQL_ENDPOINT n'est pas défini.
export const sampleDatacenters: Datacenter[] = [
  {
    title: 'Rennes 1',
    slug: 'rennes-1',
    datacenterFields: {
      ville: 'Rennes',
      region: 'Bretagne',
      statut: ['livre'],
      latitude: 48.117,
      longitude: -1.677,
      puissance: '4 MW IT',
      accroche:
        "Premier site du réseau NDC, conçu pour un hébergement souverain et décarboné au cœur de la Bretagne.",
      description:
        "Implanté en périphérie rennaise, le site Rennes 1 propose un hébergement en colocation sur mesure, pensé pour les enjeux critiques des entreprises et collectivités du Grand Ouest. Conception Tier III, refroidissement sans eau et alimentation 100 % renouvelable.",
      kpis: [
        { label: 'PUE cible', valeur: '1,2', unite: '' },
        { label: 'Surface IT', valeur: '1 000', unite: 'm²' },
        { label: 'Disponibilité', valeur: '99,982', unite: '%' },
        { label: 'Conception', valeur: 'Tier III', unite: '' },
      ],
      caracteristiques: [
        { categorie: 'securite', intitule: 'SAS biométrique ANSSI', detail: "Accès unipersonnel, double authentification, vidéosurveillance 24/7." },
        { categorie: 'refroidissement', intitule: 'Free cooling N+2', detail: "Zéro consommation d'eau, confinement des allées." },
        { categorie: 'electrique', intitule: 'Double chaîne 2N', detail: "Boucle haute disponibilité, groupes électrogènes redondés." },
        { categorie: 'connectivite', intitule: 'Meet-me-room', detail: "Accès aux opérateurs télécom de votre choix." },
      ],
      benefices: [
        { titre: 'Maîtrise des coûts', texte: "Une efficacité énergétique exemplaire qui réduit vos coûts d'exploitation." },
        { titre: 'Conformité', texte: "Un hébergement souverain aligné avec vos obligations réglementaires." },
        { titre: 'Continuité', texte: "Vos applications critiques restent disponibles en toutes circonstances." },
      ],
    },
  },
  {
    title: 'Vélizy',
    slug: 'velizy',
    datacenterFields: {
      ville: 'Vélizy-Villacoublay',
      region: 'Île-de-France',
      statut: ['construction'],
      latitude: 48.783,
      longitude: 2.196,
      puissance: '6 MW IT',
      accroche: "Site francilien en construction, pensé pour la haute densité et la connectivité maximale.",
      description:
        "Au sud-ouest de Paris, Vélizy viendra renforcer la couverture francilienne du réseau NDC avec une capacité haute densité et une connectivité renforcée vers les principaux points d'échange.",
      kpis: [
        { label: 'PUE cible', valeur: '1,2', unite: '' },
        { label: 'Ouverture', valeur: '2027', unite: '' },
      ],
      caracteristiques: [
        { categorie: 'resilience', intitule: 'Architecture redondée', detail: "Aucune zone à point de défaillance unique." },
        { categorie: 'connectivite', intitule: 'Double meet-me-room', detail: "Redondance des accès opérateurs." },
      ],
      benefices: [
        { titre: 'Proximité Paris', texte: "Un accès rapide depuis la métropole francilienne." },
      ],
    },
  },
  {
    title: 'Normandie',
    slug: 'normandie',
    datacenterFields: {
      ville: 'Rouen',
      region: 'Normandie',
      statut: ['avenir'],
      latitude: 49.443,
      longitude: 1.099,
      puissance: '5 MW IT',
      accroche: "Implantation normande prévue pour densifier la couverture du nord-ouest.",
      description: "Un site pensé pour rapprocher l'hébergement souverain des acteurs économiques normands.",
      kpis: [{ label: 'Horizon', valeur: '2029', unite: '' }],
      caracteristiques: [],
      benefices: [],
    },
  },
  {
    title: 'Lyon Est',
    slug: 'lyon-est',
    datacenterFields: {
      ville: 'Lyon',
      region: 'Auvergne-Rhône-Alpes',
      statut: ['avenir'],
      latitude: 45.764,
      longitude: 4.835,
      puissance: '8 MW IT',
      accroche: "Futur point d'ancrage du réseau dans la vallée du Rhône, à l'horizon du plan 15 sites.",
      description:
        "Le futur site lyonnais étendra le réseau NDC vers le sud-est, au service de l'écosystème économique rhônalpin.",
      kpis: [{ label: 'Horizon', valeur: '2028', unite: '' }],
      caracteristiques: [],
      benefices: [],
    },
  },
];

// Articles d'exemple (repli tant que l'API n'est pas branchée).
export const samplePosts: Post[] = [
  {
    title: 'Data Center Tier 3 : les niveaux de classification des centres de données',
    slug: 'datacenter-tier-3-classification',
    date: '2026-05-12T09:00:00',
    excerpt:
      "Dans un monde de plus en plus numérique, les data centers se placent au cœur des stratégies IT. Comment garantir qu'un data center réponde à ces exigences ?",
    featuredImage: null,
  },
  {
    title: 'Comment refroidir un Data Center ?',
    slug: 'comment-refroidir-un-datacenter',
    date: '2026-04-28T09:00:00',
    excerpt:
      "Les data centers génèrent une chaleur qu'il est nécessaire de réguler. Maintenir une température idéale est un enjeu majeur pour la performance et la durabilité des infrastructures.",
    featuredImage: null,
  },
  {
    title: 'Salle serveur : définition et particularités',
    slug: 'salle-serveur-definition',
    date: '2026-04-10T09:00:00',
    excerpt:
      "La salle serveur est le cœur d'un data center. Elle doit garantir un environnement optimal pour protéger les serveurs tout en maximisant leurs performances.",
    featuredImage: null,
  }, 
  {
    title: 'NDC rejoint le Climate Neutral Data Centre Pact',
    slug: 'ndc-climate-neutral-pact',
    date: '2026-03-20T10:00:00',
    excerpt: 'Nation Data Center s\'engage dans le pacte européen pour des data centers climatiquement neutres d\'ici 2030.',
    featuredImage: null,
  },
  {
    title: 'Géothermie et data centers : le pari de NDC à Rennes',
    slug: 'geothermie-data-center-rennes',
    date: '2026-02-15T10:00:00',
    excerpt: 'Comment la géothermie permet de réduire l\'empreinte énergétique de nos infrastructures bretonnes.',
    featuredImage: null,
  },
];

export const sampleAllPosts: WPPost[] = [
  {
    slug: 'inauguration-ndc-rouen',
    title: 'Inauguration du site NDC Rouen',
    date: '2025-05-15T10:00:00',
    excerpt: "<p>Nation Data Center inaugure son premier site à Rouen, marquant une étape clé dans le déploiement du réseau souverain français.</p>",
    content: `
      <h2>Un jalon historique pour NDC</h2>
      <p>Nation Data Center a officiellement inauguré son premier data center à Rouen. Ce site de dernière génération, conçu selon les standards Tier III (EN 50600), marque le début d'un réseau ambitieux de 15 data centers à horizon 2030.</p>
      <h3>Un site écoresponsable dès sa conception</h3>
      <p>Le data center de Rouen a été conçu avec une approche bas carbone : matériaux biosourcés, free cooling intégral, PUE cible de 1,2 et zéro consommation d'eau pour le refroidissement. La chaleur fatale sera redistribuée vers le réseau de chaleur urbain de la métropole.</p>
      <blockquote>\u00ab Ce data center incarne notre vision : prouver qu'on peut concilier performance IT, souveraineté des données et responsabilité environnementale. \u00bb — Direction NDC</blockquote>
      <h3>Prochaines étapes</h3>
      <p>Après Rouen, les sites de Rennes 1 et Paris 1 sont en cours de construction, avec des livraisons prévues courant 2026.</p>
    `,
    featuredImage: null,
    categories: { nodes: [{ name: 'Réseau', slug: 'reseau' }] },
    tags: { nodes: [{ name: 'Rouen', slug: 'rouen' }, { name: 'Inauguration', slug: 'inauguration' }] },
    author: { node: { name: 'Nation Data Center' } },
    document: {
      url: '/documents/communique-inauguration-rouen.pdf',
      titre: 'Communiqué de presse — Inauguration NDC Rouen',
    },
  },
  {
    slug: 'certification-iso-27001-objectif-2026',
    title: 'Cap sur la certification ISO 27001 en 2026',
    date: '2025-04-22T09:00:00',
    excerpt: "<p>NDC engage sa démarche de certification ISO 27001 pour garantir le plus haut niveau de sécurité de l'information à ses clients.</p>",
    content: `
      <h2>Pourquoi l'ISO 27001 ?</h2>
      <p>La norme ISO 27001 est la référence internationale en matière de management de la sécurité de l'information. Pour un opérateur de data centers souverain, cette certification est un prérequis de confiance vis-à-vis des entreprises et des administrations.</p>
      <h3>Un calendrier ambitieux</h3>
      <p>Les équipes NDC ont lancé un programme structuré :</p>
      <ul>
        <li>Audit initial et analyse des écarts (T1 2025)</li>
        <li>Mise en conformité des processus (T2-T3 2025)</li>
        <li>Audit de certification prévu au T1 2026</li>
      </ul>
      <p>En parallèle, NDC vise également les certifications HDS, ISO 14001 et ISO 50001.</p>
    `,
    featuredImage: null,
    categories: { nodes: [{ name: 'Certifications', slug: 'certifications' }] },
    tags: { nodes: [{ name: 'ISO 27001', slug: 'iso-27001' }, { name: 'Sécurité', slug: 'securite' }] },
    author: { node: { name: 'Nation Data Center' } },
    document: {
      url: '/documents/roadmap-certifications-ndc.pdf',
      titre: 'Roadmap certifications NDC 2025-2026',
    },
  },
  {
    slug: 'free-cooling-zero-eau',
    title: 'Free cooling et zéro eau : notre approche du refroidissement',
    date: '2025-03-10T14:30:00',
    excerpt: "<p>Découvrez comment NDC refroidit ses data centers sans consommer une goutte d'eau, grâce au free cooling et à une conception innovante.</p>",
    content: `
      <h2>Le défi du refroidissement</h2>
      <p>Le refroidissement représente la principale source de consommation énergétique d'un data center après l'IT. Les solutions traditionnelles (tours aéroréfrigérantes) consomment des millions de litres d'eau par an.</p>
      <h3>Notre réponse : le free cooling intégral</h3>
      <p>Tous les sites NDC sont conçus avec un système de free cooling qui exploite l'air extérieur pour refroidir les salles serveurs. Cette approche permet :</p>
      <ul>
        <li>Zéro consommation d'eau pour le refroidissement</li>
        <li>Un PUE cible de 1,2</li>
        <li>Une réduction de 40 % de la consommation énergétique vs refroidissement mécanique</li>
      </ul>
      <h3>Valorisation de la chaleur fatale</h3>
      <p>La chaleur produite par les serveurs est récupérée et redistribuée vers les réseaux de chaleur urbains : chauffage de logements, piscines municipales, serres agricoles.</p>
    `,
    featuredImage: null,
    categories: { nodes: [{ name: 'Engagements RSE', slug: 'engagements-rse' }] },
    tags: { nodes: [{ name: 'Free cooling', slug: 'free-cooling' }, { name: 'Environnement', slug: 'environnement' }] },
    author: { node: { name: 'Nation Data Center' } },
    document: null,
  },
  {
    slug: 'souverainete-donnees-cloud-act',
    title: 'Souveraineté des données : pourquoi le Cloud Act change tout',
    date: '2025-02-18T11:00:00',
    excerpt: "<p>Le Cloud Act américain permet l'accès aux données hébergées par des entreprises US, où qu'elles se trouvent. Décryptage et alternatives souveraines.</p>",
    content: `
      <h2>Qu'est-ce que le Cloud Act ?</h2>
      <p>Adopté en 2018, le Cloud Act (Clarifying Lawful Overseas Use of Data Act) autorise les autorités américaines à exiger l'accès aux données stockées par des entreprises de droit américain, même si ces données sont physiquement hébergées en dehors des États-Unis.</p>
      <h3>Quels risques pour les entreprises françaises ?</h3>
      <p>Toute entreprise utilisant un service cloud opéré par un acteur américain (AWS, Azure, GCP) est potentiellement concernée. Les données de santé, industrielles ou régaliennes sont particulièrement sensibles.</p>
      <h3>L'alternative souveraine</h3>
      <p>Héberger ses données dans un data center français, opéré par une entreprise de droit français non soumise au Cloud Act, garantit que seule la juridiction française et européenne (RGPD) s'applique. C'est la promesse de NDC.</p>
    `,
    featuredImage: null,
    categories: { nodes: [{ name: 'Souveraineté', slug: 'souverainete' }] },
    tags: { nodes: [{ name: 'Cloud Act', slug: 'cloud-act' }, { name: 'RGPD', slug: 'rgpd' }, { name: 'Souveraineté', slug: 'souverainete' }] },
    author: { node: { name: 'Nation Data Center' } },
    document: {
      url: '/documents/livre-blanc-souverainete.pdf',
      titre: 'Livre blanc — Souveraineté numérique en France',
    },
  },
  {
    slug: 'colocation-haute-densite-ia',
    title: "Colocation haute densité : NDC prêt pour l'IA",
    date: '2025-01-25T08:00:00',
    excerpt: "<p>Avec des baies jusqu'à 140 kW en DLC, NDC répond aux besoins des clusters GPU et des charges IA les plus exigeantes.</p>",
    content: `
      <h2>L'explosion de la demande IA</h2>
      <p>L'essor de l'intelligence artificielle génère des besoins en puissance de calcul sans précédent. Les clusters GPU (NVIDIA H100, B200) nécessitent des densités de 30 à 140 kW par baie, là où la colocation traditionnelle plafonne à 6-10 kW.</p>
      <h3>Notre offre haute densité</h3>
      <p>Les data centers NDC intègrent dès leur conception des zones haute densité avec :</p>
      <ul>
        <li>Refroidissement par liquide (DLC — Direct Liquid Cooling) jusqu'à 140 kW/baie</li>
        <li>Alimentation électrique A+B renforcée</li>
        <li>Espaces modulables : cages privatives ou zones dédiées</li>
      </ul>
      <h3>Un accompagnement sur mesure</h3>
      <p>Nos équipes accompagnent chaque projet IA : dimensionnement, installation, interconnexions réseau et suivi de l'exploitation.</p>
    `,
    featuredImage: null,
    categories: { nodes: [{ name: 'Innovation', slug: 'innovation' }] },
    tags: { nodes: [{ name: 'IA', slug: 'ia' }, { name: 'Haute densité', slug: 'haute-densite' }, { name: 'GPU', slug: 'gpu' }] },
    author: { node: { name: 'Nation Data Center' } },
    document: null,
  },
  {
    slug: 'ndc-rejoint-france-datacenter',
    title: "NDC rejoint l'association France Datacenter",
    date: '2024-12-05T16:00:00',
    excerpt: "<p>Nation Data Center devient membre de France Datacenter, l'association de référence de la filière des data centers en France.</p>",
    content: `
      <h2>Un engagement collectif pour la filière</h2>
      <p>En rejoignant France Datacenter, NDC affirme sa volonté de contribuer activement aux réflexions collectives sur l'avenir de la filière : transition énergétique, sobriété numérique, emploi et formation.</p>
      <h3>France Datacenter en bref</h3>
      <p>Créée en 2006, France Datacenter regroupe plus de 100 membres (opérateurs, équipementiers, bureaux d'études) et porte la voix de la filière auprès des pouvoirs publics et des institutions européennes.</p>
      <h3>Les axes de travail de NDC</h3>
      <p>Au sein de l'association, NDC participera aux groupes de travail sur :</p>
      <ul>
        <li>La décarbonation de la filière</li>
        <li>La valorisation des chaleurs fatales</li>
        <li>Les bonnes pratiques de conception Tier III</li>
      </ul>
    `,
    featuredImage: null,
    categories: { nodes: [{ name: 'Réseau', slug: 'reseau' }] },
    tags: { nodes: [{ name: 'France Datacenter', slug: 'france-datacenter' }, { name: 'Partenariat', slug: 'partenariat' }] },
    author: { node: { name: 'Nation Data Center' } },
    document: null,
  },
];

export const sampleCategories: WPCategory[] = [
  { name: 'Réseau', slug: 'reseau', count: 2 },
  { name: 'Certifications', slug: 'certifications', count: 1 },
  { name: 'Engagements RSE', slug: 'engagements-rse', count: 1 },
  { name: 'Souveraineté', slug: 'souverainete', count: 1 },
  { name: 'Innovation', slug: 'innovation', count: 1 },
];

export const sampleFaqs: Faq[] = [
  { question: 'Qu’est-ce que la colocation en data center ?', reponse: 'La colocation consiste à héberger vos serveurs dans un data center professionnel : infrastructure électrique, réseau et climatisation mutualisée, avec un niveau de sécurité et de disponibilité impossible à reproduire en interne.' },
  { question: 'Pourquoi choisir un data center souverain français ?', reponse: 'Un data center souverain garantit que vos données restent en France, sous juridiction française et européenne (RGPD). Aucune loi extraterritoriale (Cloud Act, FISA) ne peut en contraindre l’accès.' },
  { question: 'Quelle différence entre colocation et cloud public ?', reponse: 'En colocation, vous possédez et maîtrisez vos serveurs physiques : contrôle total, coût prévisible à long terme et souveraineté complète sur vos données.' },
  { question: 'Quelles certifications visez-vous ?', reponse: 'ISO 27001, ISO 14001, ISO 50001, HDS (Hébergement de Données de Santé) et European Code of Conduct. Conception Tier III (EN 50600).' },
  { question: 'Quel est le PUE de vos data centers ?', reponse: 'PUE cible de 1,2 grâce au free cooling et à une conception écoresponsable. Zéro consommation d’eau, chaleur fatale valorisée via réseau de chaleur urbain.' },
  { question: 'Comment demander un devis ?', reponse: 'Remplissez le formulaire de contact ou contactez-nous directement. Réponse sous 24 heures, sans engagement.' },
];

// --- Certifications (LISTE TYPE À CONFIRMER avec les vraies certifs NDC) ----
export const sampleCertifications: Certification[] = [
  {
    nom: 'ISO 27001',
    categorie: 'securite',
    description: 'Norme internationale de référence pour le management de la sécurité de l’information (SMSI).',
    garantie: 'Gestion rigoureuse des risques, confidentialité, intégrité et disponibilité de vos données.',
    statut: 'vise',
    souverainete: false,
    logo: null,
  },
  {
    nom: 'HDS — Hébergement de Données de Santé',
    categorie: 'sante',
    description: 'Certification française obligatoire pour héberger des données de santé à caractère personnel.',
    garantie: 'Hébergement conforme au référentiel HDS, sous juridiction française, pour les acteurs de la santé.',
    statut: 'vise',
    souverainete: true,
    logo: null,
  },
  {
    nom: 'SecNumCloud',
    categorie: 'souverainete',
    description: 'Visa de sécurité de l’ANSSI qualifiant les offres cloud de confiance, immunes aux lois extraterritoriales.',
    garantie: 'Souveraineté juridique et technique : vos données restent hors de portée du Cloud Act et de FISA.',
    statut: 'vise',
    souverainete: true,
    logo: null,
  },
  {
    nom: 'ISO 50001',
    categorie: 'energie',
    description: 'Norme de management de l’énergie pour optimiser en continu la performance énergétique.',
    garantie: 'Pilotage de l’efficacité énergétique, PUE maîtrisé et réduction de l’empreinte carbone.',
    statut: 'vise',
    souverainete: false,
    logo: null,
  },
  {
    nom: 'ISO 14001',
    categorie: 'energie',
    description: 'Norme internationale de management environnemental.',
    garantie: 'Maîtrise des impacts environnementaux : eau, énergie, valorisation de la chaleur fatale.',
    statut: 'vise',
    souverainete: false,
    logo: null,
  },
  {
    nom: 'ISO 9001',
    categorie: 'qualite',
    description: 'Norme de management de la qualité orientée satisfaction client et amélioration continue.',
    garantie: 'Processus maîtrisés et engagement de qualité de service sur l’ensemble des prestations.',
    statut: 'vise',
    souverainete: false,
    logo: null,
  },
  {
    nom: 'PCI-DSS',
    categorie: 'securite',
    description: 'Standard de sécurité des données pour les environnements traitant des paiements par carte.',
    garantie: 'Niveau de sécurité requis pour héberger des applications financières et de paiement.',
    statut: 'vise',
    souverainete: false,
    logo: null,
  },
  {
    nom: 'Tier III / EN 50600',
    categorie: 'conception',
    description: 'Conception data center maintenable sans interruption (Uptime Institute / norme européenne EN 50600).',
    garantie: 'Disponibilité de 99,982 %, redondance N+1 et maintenance concurrente sans coupure de service.',
    statut: 'conforme',
    souverainete: false,
    logo: null,
  },
];

// --- Équipe (exemple — à remplacer par les vrais membres dans WordPress) ----
export const sampleMembres: Membre[] = [
  {
    nom: 'Direction Générale',
    poste: 'Direction générale',
    pole: 'directionGenerale',
    bio: 'Pilote la stratégie de Nation Data Center et le déploiement du réseau souverain à horizon 2030.',
    linkedin: null,
    photo: null,
  },
  {
    nom: 'Direction Technique',
    poste: 'Directeur·rice technique',
    pole: 'directionTechnique',
    bio: 'Conçoit des infrastructures Tier III écoresponsables : électricité, refroidissement, connectivité.',
    linkedin: null,
    photo: null,
  },
  {
    nom: 'Exploitation & Sécurité',
    poste: 'Responsable exploitation',
    pole: 'exploitation',
    bio: 'Garantit la disponibilité, la supervision 24/7 et la sécurité physique des sites.',
    linkedin: null,
    photo: null,
  },
  {
    nom: 'Direction Commerciale',
    poste: 'Directeur·rice commercial·e',
    pole: 'commerce',
    bio: 'Accompagne les organisations dans leurs projets d’hébergement souverain et de colocation.',
    linkedin: null,
    photo: null,
  },
];

// --- Services (CPT `service`) ----------------------------------------------
// Ordre = ordre d'affichage (menu_order). Les 5 premiers (home: true) alimentent
// le carrousel d'accueil ; les 8 alimentent la page /services.
export const sampleServices: Service[] = [
  {
    titre: 'Proximité',
    slug: 'proximite',
    accroche: 'Services de proximité',
    description:
      "Au-delà de l'hébergement, nos équipes d'exploitation interviennent directement sur vos équipements : installation, remplacement de composants, gestion des accès et reporting. Un guichet unique, réactif et local, pour une exploitation sans friction.",
    benefice: 'Des gestes techniques réalisés sur site, par nos équipes.',
    icone: 'proximite',
    image: { sourceUrl: '/services-proximite.jpg', altText: 'Intervention de proximité sur les serveurs dans un data center NDC' },
    lienLabel: 'Découvrir le catalogue de proximité',
    lienUrl: '/contact',
    home: true,
  },
  {
    titre: 'Haute densité & IA',
    slug: 'haute-densite-ia',
    accroche: 'Calcul intensif',
    description:
      "Jusqu'à 140 kW par baie en refroidissement liquide (DLC). Une infrastructure conçue pour l'IA, le HPC et les charges les plus intensives, sans compromis thermique.",
    benefice: 'Hébergez vos clusters GPU sans contrainte de densité.',
    icone: 'ia',
    image: null,
    lienLabel: 'En savoir plus',
    lienUrl: '/contact',
    home: true,
  },
  {
    titre: 'Hébergement en colocation',
    slug: 'colocation',
    accroche: 'Colocation',
    description:
      'Baies sécurisées, alimentation et refroidissement mutualisés, conception Tier III. Vous gardez la maîtrise de vos équipements, nous opérons l\u2019infrastructure.',
    benefice: 'Réduisez vos coûts IT de 30 à 50 % vs salle interne.',
    icone: 'colocation',
    image: null,
    lienLabel: 'En savoir plus',
    lienUrl: '/contact',
    home: true,
  },
  {
    titre: 'Accompagnement personnalisé',
    slug: 'accompagnement',
    accroche: 'Relation client',
    description:
      'Un interlocuteur dédié qui connaît votre dossier, des interventions de proximité, un suivi et une optimisation continue de votre dispositif. Un partenaire, pas un simple fournisseur.',
    benefice: 'Un contact unique, réactif, qui connaît votre contexte.',
    icone: 'accompagnement',
    image: null,
    lienLabel: 'Échanger avec nos équipes',
    lienUrl: '/contact',
    home: true,
  },
  {
    titre: 'Espaces bureau et salles de réunion',
    slug: 'espaces-bureau',
    accroche: 'Espaces de travail',
    description:
      "Des bureaux et salles de réunion disponibles sur site pour vos équipes : préparez vos déploiements, pilotez vos interventions et travaillez au plus près de vos infrastructures.",
    benefice: 'Travaillez sur place, au plus près de vos équipements.',
    icone: 'bureau',
    image: null,
    lienLabel: 'En savoir plus',
    lienUrl: '/contact',
    home: true,
  },
  {
    titre: 'Connectivité carrier-neutral',
    slug: 'connectivite',
    accroche: 'Réseau',
    description:
      'Meet-me-room ouverte, opérateurs au choix, interconnexions cloud. Aucun verrouillage : vous choisissez et faites concurrencer vos fournisseurs de connectivité.',
    benefice: 'Choisissez librement vos opérateurs, sans lock-in.',
    icone: 'connectivite',
    image: null,
    lienLabel: 'En savoir plus',
    lienUrl: '/contact',
    home: false,
  },
  {
    titre: 'Espaces modulables',
    slug: 'espaces-modulables',
    accroche: 'Flexibilité',
    description:
      'Cages privatives, zones dédiées, configurations sur mesure selon vos enjeux. Votre infrastructure évolue avec vos besoins, sans investissement lourd.',
    benefice: 'Adaptez votre infrastructure à la demande.',
    icone: 'modulable',
    image: null,
    lienLabel: 'En savoir plus',
    lienUrl: '/contact',
    home: false,
  },
  {
    titre: 'Continuité de service',
    slug: 'continuite',
    accroche: 'Disponibilité',
    description:
      'Réseau redondé, alimentation A+B, groupes électrogènes N+1. Une architecture pensée pour la disponibilité de vos applications critiques.',
    benefice: '99,982 % de disponibilité visée.',
    icone: 'continuite',
    image: null,
    lienLabel: 'En savoir plus',
    lienUrl: '/contact',
    home: false,
  },
];

/* ------------------------------------------------------------------ *
 *  Pages légales — repli tant que les pages n'existent pas dans WP.
 *  Squelettes structurés : les mentions exactes (RCS, capital, DPO…)
 *  sont à compléter dans WordPress (Pages → même slug), qui prend le
 *  dessus dès que la page y est créée.
 * ------------------------------------------------------------------ */
import type { CustomPage } from './wordpress';

// Liens d'action utilisables dans le contenu WordPress des pages légales :
//   href="#gerer-mes-cookies"           → rouvre les préférences Didomi
//   href="#opposition-mesure-audience"  → opposition à la mesure d'audience
// (gérés par components/LegalActions.tsx).
export const samplePages: Record<string, CustomPage> = {
  'mentions-legales': {
    title: 'Mentions légales',
    image: null,
    content: `
<h2>Éditeur du site</h2>
<p>Le site nationdatacenter.fr est édité par <strong>Nation Data Center</strong>, filiale du groupe Altarea.<br/>
[Forme juridique, capital social, RCS, SIREN, numéro de TVA et adresse du siège : à compléter.]</p>
<h2>Directeur de la publication</h2>
<p>[Nom et qualité du directeur de la publication : à compléter.]</p>
<h2>Hébergement</h2>
<p>Le site est hébergé sur l'infrastructure de Nation Data Center, en France. [Raison sociale, adresse et téléphone de l'hébergeur : à compléter.]</p>
<h2>Propriété intellectuelle</h2>
<p>L'ensemble des contenus du site (textes, images, logos, vidéos, structure) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable est interdite.</p>
<h2>Responsabilité</h2>
<p>Nation Data Center s'efforce d'assurer l'exactitude des informations publiées sur ce site, sans toutefois pouvoir garantir qu'elles soient exemptes d'erreurs ou d'omissions. Les informations sont fournies à titre indicatif et sont susceptibles d'évoluer.</p>
<h2>Données personnelles et cookies</h2>
<p>Voir la <a href="/politique-de-protection-des-donnees-personnelles">politique de protection des données personnelles</a> et la <a href="/politique-de-cookies">politique de cookies</a>.</p>
<h2>Contact</h2>
<p>Pour toute question relative au site, utilisez la <a href="/contact">page contact</a>.</p>
`,
  },
  'politique-de-protection-des-donnees-personnelles': {
    title: 'Politique de protection des données personnelles',
    image: null,
    content: `
<h2>Responsable de traitement</h2>
<p><strong>Nation Data Center</strong>, filiale du groupe Altarea, est responsable des traitements de données personnelles réalisés sur ce site. [Adresse et coordonnées complètes : à compléter.]</p>
<h2>Données collectées</h2>
<p>Les formulaires du site (contact, question, téléchargement de brochure ou de document) et l'assistant en ligne collectent uniquement les données que vous renseignez : adresse e-mail, et le cas échéant nom, prénom, téléphone, entreprise et message. La page d'origine de la demande est également enregistrée.</p>
<h2>Finalités et bases légales</h2>
<ul>
<li>Répondre à vos demandes de contact et de renseignement (mesures précontractuelles / intérêt légitime) ;</li>
<li>Vous transmettre la documentation demandée (consentement) ;</li>
<li>Assurer le suivi commercial des demandes (intérêt légitime) ;</li>
<li>Mesurer l'audience du site (exemption de consentement pour la mesure strictement anonyme, consentement pour la mesure complète — voir la <a href="/politique-de-cookies">politique de cookies</a>).</li>
</ul>
<h2>Durées de conservation</h2>
<p>[Durées de conservation par finalité : à compléter — usuellement 3 ans après le dernier contact pour les prospects.]</p>
<h2>Destinataires et sous-traitants</h2>
<p>Les données sont destinées aux équipes commerciales et marketing de Nation Data Center. Elles sont hébergées en France sur l'infrastructure de Nation Data Center. Sous-traitants : Piano (mesure d'audience, France), Didomi (gestion du consentement, France). [Autres sous-traitants éventuels (CRM, e-mailing…) : à compléter.]</p>
<p>La protection anti-robots des formulaires est hébergée sur nos propres serveurs et ne transmet aucune donnée à un tiers.</p>
<h2>Vos droits</h2>
<p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez de droits d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité sur vos données. Pour les exercer : [adresse e-mail du référent données personnelles / DPO : à compléter]. Vous pouvez également saisir la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).</p>
`,
  },
  'politique-de-cookies': {
    title: 'Politique de cookies',
    image: null,
    content: `
<h2>Qu'est-ce qu'un cookie&nbsp;?</h2>
<p>Un cookie est un petit fichier déposé sur votre appareil lors de la consultation d'un site, permettant notamment de mémoriser des préférences de navigation ou de mesurer l'audience.</p>
<h2>Cookies et traceurs utilisés sur ce site</h2>
<p>Ce site n'utilise <strong>aucun cookie publicitaire</strong>.</p>
<h3>Strictement nécessaires (sans consentement)</h3>
<ul>
<li><strong>NEXT_LOCALE</strong> (nationdatacenter.fr) — mémorise la langue d'affichage. Durée : session.</li>
<li><strong>didomi_token</strong> et cookies associés (Didomi) — mémorisent vos choix en matière de cookies. Durée : [à vérifier dans la console Didomi].</li>
<li>Assistant en ligne — la conversation est conservée dans le navigateur (stockage de session) pendant 30 minutes d'inactivité.</li>
</ul>
<h3>Mesure d'audience (Piano Analytics)</h3>
<ul>
<li><strong>_pcid</strong>, <strong>_pctx</strong>, <strong>_pprv</strong> (nationdatacenter.fr) — Durée : 13 mois.</li>
</ul>
<p>Sans votre consentement, la mesure fonctionne en mode <strong>exempté</strong> conformément aux recommandations de la CNIL : statistiques strictement anonymes, sans recoupement avec d'autres traitements ni transmission à des tiers. Si vous acceptez Piano dans le gestionnaire de cookies, la mesure devient complète.</p>
<p>Vous pouvez à tout moment <a href="#opposition-mesure-audience">vous opposer à la mesure d'audience</a> sur ce navigateur.</p>
<h3>Contenus tiers (avec votre consentement)</h3>
<ul>
<li><strong>YouTube</strong> et <strong>Vimeo</strong> — les vidéos de la page Documentation ne sont chargées qu'après votre accord (dans le gestionnaire de cookies ou au moment de lancer la vidéo). Ces plateformes peuvent alors déposer leurs propres cookies.</li>
</ul>
<p>La protection anti-robots des formulaires est hébergée sur nos propres serveurs : elle ne dépose aucun cookie et ne transmet aucune donnée à un tiers.</p>
<h2>Gérer vos choix</h2>
<p>Vous pouvez modifier vos choix à tout moment : <a href="#gerer-mes-cookies">gérer mes cookies</a> (également accessible en bas de chaque page). Vous pouvez aussi supprimer les cookies depuis les réglages de votre navigateur.</p>
<h2>Contact</h2>
<p>Pour toute question : voir la <a href="/politique-de-protection-des-donnees-personnelles">politique de protection des données personnelles</a>.</p>
`,
  },
};

// Versions anglaises (affichées sur /en/… tant que la traduction n'existe pas
// dans WordPress ; servent aussi à pré-remplir les pages EN créées par le snippet).
export const samplePagesEn: Record<string, CustomPage> = {
  'mentions-legales': {
    title: 'Legal notice',
    image: null,
    content: `
<h2>Publisher</h2>
<p>The website nationdatacenter.fr is published by <strong>Nation Data Center</strong>, a subsidiary of the Altarea group.<br/>
[Legal form, share capital, trade register (RCS), SIREN, VAT number and registered office address: to be completed.]</p>
<h2>Publication director</h2>
<p>[Name and position of the publication director: to be completed.]</p>
<h2>Hosting</h2>
<p>The website is hosted on Nation Data Center's infrastructure, in France. [Host's company name, address and phone number: to be completed.]</p>
<h2>Intellectual property</h2>
<p>All content on this website (texts, images, logos, videos, structure) is protected by intellectual property law. Any reproduction or representation, in whole or in part, without prior written authorisation is prohibited.</p>
<h2>Liability</h2>
<p>Nation Data Center strives to ensure the accuracy of the information published on this website but cannot guarantee that it is free of errors or omissions. Information is provided for guidance only and may change.</p>
<h2>Personal data and cookies</h2>
<p>See the <a href="/en/politique-de-protection-des-donnees-personnelles">privacy policy</a> and the <a href="/en/politique-de-cookies">cookie policy</a>.</p>
<h2>Contact</h2>
<p>For any question about the website, please use the <a href="/en/contact">contact page</a>.</p>
`,
  },
  'politique-de-protection-des-donnees-personnelles': {
    title: 'Privacy policy',
    image: null,
    content: `
<h2>Data controller</h2>
<p><strong>Nation Data Center</strong>, a subsidiary of the Altarea group, is the controller of the personal data processed on this website. [Full address and contact details: to be completed.]</p>
<h2>Data collected</h2>
<p>The website's forms (contact, question, brochure or document download) and the online assistant only collect the data you provide: e-mail address and, where applicable, first name, last name, phone number, company and message. The page from which the request was sent is also recorded.</p>
<h2>Purposes and legal bases</h2>
<ul>
<li>Answering your contact and information requests (pre-contractual measures / legitimate interest);</li>
<li>Sending you the documents you requested (consent);</li>
<li>Following up on requests commercially (legitimate interest);</li>
<li>Measuring website audience (consent exemption for strictly anonymous measurement, consent for full measurement — see the <a href="/en/politique-de-cookies">cookie policy</a>).</li>
</ul>
<h2>Retention periods</h2>
<p>[Retention periods per purpose: to be completed — usually 3 years after the last contact for prospects.]</p>
<h2>Recipients and processors</h2>
<p>Data is intended for Nation Data Center's sales and marketing teams. It is hosted in France on Nation Data Center's infrastructure. Processors: Piano (audience measurement, France), Didomi (consent management, France). [Other processors, if any (CRM, e-mailing…): to be completed.]</p>
<p>The forms' anti-bot protection is hosted on our own servers and does not send any data to third parties.</p>
<h2>Your rights</h2>
<p>Under the GDPR and the French Data Protection Act, you have the rights of access, rectification, erasure, objection, restriction and portability. To exercise them: [e-mail address of the data protection officer / contact: to be completed]. You may also lodge a complaint with the CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).</p>
`,
  },
  'politique-de-cookies': {
    title: 'Cookie policy',
    image: null,
    content: `
<h2>What is a cookie?</h2>
<p>A cookie is a small file stored on your device when you visit a website, used for example to remember browsing preferences or to measure audience.</p>
<h2>Cookies and trackers used on this website</h2>
<p>This website uses <strong>no advertising cookies</strong>.</p>
<h3>Strictly necessary (no consent required)</h3>
<ul>
<li><strong>NEXT_LOCALE</strong> (nationdatacenter.fr) — remembers the display language. Duration: session.</li>
<li><strong>didomi_token</strong> and related cookies (Didomi) — remember your cookie choices. Duration: [to be checked in the Didomi console].</li>
<li>Online assistant — the conversation is kept in the browser (session storage) for 30 minutes of inactivity.</li>
</ul>
<h3>Audience measurement (Piano Analytics)</h3>
<ul>
<li><strong>_pcid</strong>, <strong>_pctx</strong>, <strong>_pprv</strong> (nationdatacenter.fr) — Duration: 13 months.</li>
</ul>
<p>Without your consent, measurement runs in <strong>exempt</strong> mode, in line with the CNIL's recommendations: strictly anonymous statistics, with no cross-referencing with other processing and no transfer to third parties. If you accept Piano in the cookie manager, full measurement is enabled.</p>
<p>You can <a href="#opposition-mesure-audience">opt out of audience measurement</a> on this browser at any time.</p>
<h3>Third-party content (with your consent)</h3>
<ul>
<li><strong>YouTube</strong> and <strong>Vimeo</strong> — videos on the Documentation page are only loaded once you agree (in the cookie manager or when starting the video). These platforms may then set their own cookies.</li>
</ul>
<p>The forms' anti-bot protection is hosted on our own servers: it sets no cookies and sends no data to third parties.</p>
<h2>Managing your choices</h2>
<p>You can change your choices at any time: <a href="#gerer-mes-cookies">manage my cookies</a> (also available at the bottom of every page). You can also delete cookies in your browser settings.</p>
<h2>Contact</h2>
<p>For any question, see the <a href="/en/politique-de-protection-des-donnees-personnelles">privacy policy</a>.</p>
`,
  },
};

/* ------------------------------------------------------------------ *
 *  Livrets de documentation — repli tant que le CPT « livret » n'est
 *  pas alimenté dans WP. Couverture null = vignette stylisée du site.
 * ------------------------------------------------------------------ */
import type { Livret } from './wordpress';

export const sampleLivrets: Livret[] = [
  {
    titre: 'Brochure Nation Data Center',
    slug: 'brochure-ndc',
    description:
      "Présentation du réseau NDC : notre vision de l'hébergement souverain, les sites, les offres de colocation et nos engagements écoresponsables.",
    fichierUrl: '/brochure-ndc.pdf',
    cover: null,
    format: 'portrait',
    meta: 'PDF · FR',
  },
  {
    titre: 'Fiche réseau — sites & capacités',
    slug: 'fiche-reseau',
    description:
      "L'essentiel du réseau en une fiche : implantations, puissances IT, niveaux de disponibilité et échéances d'ouverture.",
    fichierUrl: '/brochure-ndc.pdf',
    cover: null,
    format: 'paysage',
    meta: 'PDF · FR',
  },
  {
    titre: 'Présentation Nation Data Center',
    slug: 'presentation-ndc',
    description:
      'Le support de présentation du réseau NDC : chiffres clés, offres et feuille de route, au format slides.',
    fichierUrl: '/brochure-ndc.pdf',
    cover: null,
    format: 'paysage',
    meta: 'PDF · FR',
  },
];
