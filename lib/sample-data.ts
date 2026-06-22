import type { Datacenter } from './wordpress';
import type { Post } from './wordpress';
import type { WPPost, WPCategory } from './wordpress';
import type { Faq } from './wordpress';
import type { Certification, Membre, Groupe } from './wordpress';

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
    pole: 'direction',
    bio: 'Pilote la stratégie de Nation Data Center et le déploiement du réseau souverain à horizon 2030.',
    linkedin: null,
    photo: null,
  },
  {
    nom: 'Direction Technique',
    poste: 'Directeur·rice technique',
    pole: 'technique',
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
    pole: 'commercial',
    bio: 'Accompagne les organisations dans leurs projets d’hébergement souverain et de colocation.',
    linkedin: null,
    photo: null,
  },
];

// --- Groupe Altarea (contenu éditorial de référence) ------------------------
export const sampleGroupe: Groupe = {
  introTitre: 'Nation Data Center, une filiale du Groupe Altarea',
  introTexte:
    'Nation Data Center est une filiale à 100 % du Groupe Altarea, leader français de la transformation urbaine bas carbone. Cet adossement à un acteur industriel de premier plan donne à NDC la solidité financière, l’expertise foncière et l’ancrage territorial nécessaires pour bâtir un réseau de data centers souverains et écoresponsables sur l’ensemble du territoire national.',
  chiffres: [
    { valeur: '3', unite: 'Md€', label: 'de chiffre d’affaires' },
    { valeur: '1 700', unite: '', label: 'collaborateurs' },
    { valeur: '1994', unite: '', label: 'année de création' },
    { valeur: '100', unite: '%', label: 'capital français' },
  ],
  valeurs: [
    { titre: 'Ancrage territorial', texte: 'Une présence nationale et une connaissance fine des territoires pour implanter nos sites au plus près des besoins.' },
    { titre: 'Bas carbone', texte: 'La transformation urbaine décarbonée au cœur de l’ADN du groupe, prolongée par des data centers écoresponsables.' },
    { titre: 'Solidité financière', texte: 'Un actionnariat industriel solide et engagé sur le long terme, au service de projets critiques.' },
    { titre: 'Souveraineté', texte: 'Un capital 100 % français qui garantit l’indépendance juridique et technologique de nos infrastructures.' },
  ],
  articulationTitre: 'NDC ↔ Altarea : une cohérence souveraine',
  articulationTexte:
    'Là où Altarea transforme la ville de manière durable, Nation Data Center prolonge cette ambition dans le numérique : des infrastructures critiques conçues, financées et opérées en France, pour rendre aux organisations la maîtrise de leurs données. La même exigence environnementale, le même engagement bas carbone, la même souveraineté.',
  timeline: [
    { annee: '1994', evenement: 'Création du Groupe Altarea.' },
    { annee: '2020', evenement: 'Renforcement de la stratégie bas carbone et de transformation urbaine.' },
    { annee: '2024', evenement: 'Lancement de Nation Data Center, opérateur de data centers souverains.' },
    { annee: '2030', evenement: 'Objectif d’un réseau de 15 sites Tier III écoresponsables en France.' },
  ],
};
