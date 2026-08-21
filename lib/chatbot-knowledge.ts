// Base de connaissances de l'assistant du site.
// ---------------------------------------------
// L'assistant ne se contente plus de la FAQ : il répond aussi à partir des
// contenus réels du site — data centers, services, certifications — et sait
// renvoyer vers la bonne page. Tout est construit ici, à partir des mêmes
// données que celles affichées aux visiteurs : rien à maintenir en double,
// une fiche ajoutée dans WordPress enrichit l'assistant automatiquement.
//
// Chaque entrée porte des MOTS-DÉCLENCHEURS explicites (`keywords`). C'est ce
// qui fait la différence entre un assistant qui comprend « vous êtes où ? » et
// un assistant qui exige la formulation exacte de la FAQ.

import type { Certification, Datacenter, Faq, Service } from './wordpress';
import { certifStatutInfo, statutInfo, stripHtml } from './wordpress';

export type KnowledgeEntry = {
  id: string;
  /** Libellé court, utilisé comme puce de suggestion. */
  question: string;
  answer: string;
  /** Synonymes et formulations courantes ; pèsent plus que le texte de la réponse. */
  keywords: string[];
  /** Page vers laquelle orienter après la réponse. */
  link?: { label: string; href: string };
  /** Plus le nombre est petit, plus l'entrée est proposée tôt en suggestion. */
  priority?: number;
};

type Locale = 'fr' | 'en';

const isEn = (l: Locale) => l === 'en';

/** Chemin localisé : le français est à la racine, l'anglais sous /en. */
function path(locale: Locale, p: string): string {
  return isEn(locale) ? `/en${p}` : p;
}

/** Coupe un texte trop long sans casser un mot. */
function clip(text: string, max = 320): string {
  const t = stripHtml(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Statut d'un data center en clair (le champ peut arriver en tableau). */
function statutLabel(statut: Datacenter['datacenterFields']['statut']): string {
  return statutInfo(statut).label;
}

/* ------------------------------------------------------------------ *
 *  Data centers — « où êtes-vous ? », « Rennes ? », « quelle puissance ? »
 * ------------------------------------------------------------------ */

function datacenterEntries(datacenters: Datacenter[], locale: Locale): KnowledgeEntry[] {
  if (!datacenters.length) return [];
  const entries: KnowledgeEntry[] = [];

  // Une entrée de synthèse : la question la plus posée sur un réseau de sites.
  const resume = datacenters
    .map((d) => {
      const f = d.datacenterFields;
      const lieu = f.ville ? ` (${f.ville})` : '';
      return `• ${d.title}${lieu} — ${statutLabel(f.statut)}${f.puissance ? ` · ${f.puissance}` : ''}`;
    })
    .join('\n');

  entries.push({
    id: 'dc-reseau',
    question: isEn(locale) ? 'Where are your data centers?' : 'Où sont vos data centers ?',
    answer: isEn(locale)
      ? `Our network currently counts ${datacenters.length} site(s) in France:\n${resume}`
      : `Notre réseau compte actuellement ${datacenters.length} site(s) en France :\n${resume}`,
    keywords: [
      // Expressions : elles emportent la décision quand elles sont présentes.
      'ou sont', 'ou se trouve', 'ou se trouvent', 'ou est', 'vous etes ou',
      'etes vous ou', 'data center', 'data centers', 'combien de sites',
      'quels sites', 'vos sites', 'en france', 'sur le territoire',
      'where are', 'your sites', 'your data centers',
      // Mots isolés.
      'localisation', 'localises', 'situes', 'situe', 'implantation', 'implantes',
      'sites', 'site', 'reseau', 'ville', 'villes', 'region', 'regions',
      'geographie', 'carte', 'adresse', 'france', 'datacenter', 'datacenters',
      'where', 'location', 'locations', 'network', 'city', 'cities', 'map',
    ],
    link: {
      label: isEn(locale) ? 'See the network' : 'Voir le réseau',
      href: path(locale, '/datacenters'),
    },
    priority: 1,
  });

  // Une entrée par site : le visiteur cite souvent une ville directement.
  for (const d of datacenters) {
    const f = d.datacenterFields;
    const details: string[] = [];
    if (f.ville) details.push(isEn(locale) ? `Location: ${f.ville}` : `Localisation : ${f.ville}`);
    if (f.puissance) details.push(isEn(locale) ? `Capacity: ${f.puissance}` : `Puissance : ${f.puissance}`);
    details.push(isEn(locale) ? `Status: ${statutLabel(f.statut)}` : `Statut : ${statutLabel(f.statut)}`);
    for (const k of (f.kpis ?? []).slice(0, 3)) {
      if (k?.label && k?.valeur) details.push(`${k.label} : ${k.valeur}${k.unite ? ` ${k.unite}` : ''}`);
    }

    const intro = f.accroche || f.description || '';
    entries.push({
      id: `dc-${d.slug}`,
      question: d.title,
      answer: [intro && clip(intro, 240), details.join(' · ')].filter(Boolean).join('\n\n'),
      keywords: [
        d.title,
        f.ville ?? '',
        f.region ?? '',
        ...d.title.split(/\s+/),
      ].filter(Boolean),
      link: {
        label: isEn(locale) ? `See ${d.title}` : `Voir ${d.title}`,
        href: path(locale, `/datacenters/${d.slug}`),
      },
    });
  }

  return entries;
}

/* ------------------------------------------------------------------ *
 *  Services
 * ------------------------------------------------------------------ */

function serviceEntries(services: Service[], locale: Locale): KnowledgeEntry[] {
  if (!services.length) return [];
  const entries: KnowledgeEntry[] = [];

  entries.push({
    id: 'services-tous',
    question: isEn(locale) ? 'What services do you offer?' : 'Quels services proposez-vous ?',
    answer:
      (isEn(locale) ? 'Our services:\n' : 'Nos services :\n') +
      services.map((s) => `• ${s.titre}${s.accroche ? ` — ${clip(s.accroche, 80)}` : ''}`).join('\n'),
    keywords: [
      'service', 'services', 'prestation', 'prestations', 'offre', 'offres', 'proposez',
      'faites', 'accompagnement', 'infogerance', 'exploitation', 'supervision',
      'what do you do', 'offering', 'offerings',
    ],
    link: { label: isEn(locale) ? 'All services' : 'Tous nos services', href: path(locale, '/services') },
    priority: 2,
  });

  for (const s of services) {
    entries.push({
      id: `service-${s.slug}`,
      question: s.titre,
      answer: clip([s.description, s.benefice].filter(Boolean).join('\n\n'), 360) || s.accroche,
      keywords: [s.titre, s.accroche, ...s.titre.split(/\s+/)].filter(Boolean),
      link: {
        label: isEn(locale) ? 'Learn more' : 'En savoir plus',
        href: path(locale, `/services#${s.slug}`),
      },
    });
  }

  return entries;
}

/* ------------------------------------------------------------------ *
 *  Certifications — « êtes-vous ISO 27001 ? », « HDS ? »
 * ------------------------------------------------------------------ */

function certificationEntries(certifications: Certification[], locale: Locale): KnowledgeEntry[] {
  if (!certifications.length) return [];
  const entries: KnowledgeEntry[] = [];

  entries.push({
    id: 'certifs-toutes',
    question: isEn(locale) ? 'Which certifications do you hold?' : 'Quelles sont vos certifications ?',
    answer:
      (isEn(locale) ? 'Our certifications and standards:\n' : 'Nos certifications et référentiels :\n') +
      certifications
        .map((c) => `• ${c.nom} — ${certifStatutInfo(c.statut).label}`)
        .join('\n'),
    keywords: [
      'certification', 'certifications', 'certifie', 'certifiee', 'norme', 'normes',
      'label', 'labels', 'referentiel', 'conformite', 'iso', 'hds', 'secnumcloud',
      'tier', 'agrement', 'certified', 'standards', 'compliance',
    ],
    link: {
      label: isEn(locale) ? 'All certifications' : 'Toutes nos certifications',
      href: path(locale, '/certifications'),
    },
    priority: 3,
  });

  for (const c of certifications) {
    entries.push({
      id: `certif-${c.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      question: c.nom,
      answer: [
        `${c.nom} — ${certifStatutInfo(c.statut).label}.`,
        c.description && clip(c.description, 220),
        c.garantie && (isEn(locale) ? `What it guarantees: ${c.garantie}` : `Ce que ça garantit : ${c.garantie}`),
      ]
        .filter(Boolean)
        .join('\n\n'),
      keywords: [c.nom, ...c.nom.split(/\s+/)].filter(Boolean),
      link: {
        label: isEn(locale) ? 'All certifications' : 'Toutes nos certifications',
        href: path(locale, '/certifications'),
      },
    });
  }

  return entries;
}

/* ------------------------------------------------------------------ *
 *  Entrées permanentes : contact, visite, documentation, offres, groupe.
 *  Ce sont les intentions à forte valeur commerciale — celles qui doivent
 *  mener quelque part, pas seulement informer.
 * ------------------------------------------------------------------ */

function staticEntries(locale: Locale): KnowledgeEntry[] {
  const en = isEn(locale);
  return [
    {
      id: 'contact',
      question: en ? 'How can I get in touch?' : 'Comment vous contacter ?',
      answer: en
        ? 'The contact form is the fastest way: our teams reply within 24 hours, with no commitment. You can also ask your question right here and leave your e-mail.'
        : 'Le formulaire de contact est le plus rapide : nos équipes répondent sous 24 heures, sans engagement. Vous pouvez aussi poser votre question ici et laisser votre e-mail.',
      keywords: [
        'combien ca coute', 'combien coute', 'ca coute', 'quel prix', 'a quel prix',
        'demander un devis', 'etre rappele', 'vous joindre', 'vous contacter',
        'parler a quelqu un', 'how much', 'get in touch', 'contact you',
        'contact', 'contacter', 'joindre', 'appeler', 'telephone', 'mail', 'email',
        'devis', 'tarif', 'tarifs', 'tarification', 'prix', 'cout', 'couts', 'coute',
        'couter', 'budget', 'commercial', 'rendez-vous', 'parler', 'echanger',
        'quote', 'pricing', 'price', 'sales', 'cost',
      ],
      link: { label: en ? 'Contact us' : 'Nous contacter', href: path(locale, '/contact') },
      priority: 4,
    },
    {
      id: 'visite',
      question: en ? 'Can I visit a data center?' : 'Peut-on visiter un data center ?',
      answer: en
        ? 'Yes. Site visits are arranged on request — it is the best way to assess our infrastructure. Ask through the contact form and we will organise it.'
        : 'Oui. Les visites de site s\'organisent sur demande — c\'est le meilleur moyen d\'évaluer notre infrastructure. Faites-en la demande via le formulaire de contact et nous nous en occupons.',
      keywords: [
        'visite', 'visiter', 'voir', 'venir', 'sur place', 'rendez vous', 'decouvrir le site',
        'visit', 'tour', 'come and see',
      ],
      link: { label: en ? 'Request a visit' : 'Demander une visite', href: path(locale, '/contact') },
      priority: 5,
    },
    {
      id: 'documentation',
      question: en ? 'Do you have a brochure?' : 'Avez-vous une brochure ?',
      answer: en
        ? 'Yes — the Documentation page gathers our brochure, technical sheets and site booklets, all downloadable.'
        : 'Oui — la page Documentation rassemble notre brochure, les fiches techniques et les livrets de nos sites, tous téléchargeables.',
      keywords: [
        'brochure', 'plaquette', 'documentation', 'document', 'documents', 'livret', 'livrets',
        'fiche', 'fiches', 'pdf', 'telecharger', 'telechargement', 'ressources',
        'download', 'datasheet', 'resources',
      ],
      link: { label: en ? 'Documentation' : 'Voir la documentation', href: path(locale, '/documentation') },
      priority: 6,
    },
    {
      id: 'offres',
      question: en ? 'Which offer fits my profile?' : 'Quelle offre pour mon profil ?',
      answer: en
        ? 'Our offers are laid out by profile — IT departments, SMEs, public sector and operators — each with its own challenges, answers and figures.'
        : 'Nos offres sont déclinées par profil — DSI, PME/ETI, secteur public et opérateurs — chacune avec ses enjeux, ses réponses et ses chiffres.',
      keywords: [
        'offre', 'offres', 'profil', 'dsi', 'pme', 'eti', 'secteur public', 'operateur',
        'operateurs', 'colocation', 'hebergement', 'baie', 'baies', 'rack', 'racks',
        'offer', 'offers', 'hosting', 'colocation', 'profile',
      ],
      link: { label: en ? 'See the offers' : 'Voir les offres', href: path(locale, '/offres') },
      priority: 7,
    },
    {
      id: 'groupe',
      question: en ? 'Who is behind Nation Data Center?' : 'Qui est derrière Nation Data Center ?',
      answer: en
        ? 'Nation Data Center is a brand of the Altarea Group, a French multi-business player committed to low-carbon development.'
        : 'Nation Data Center est une marque du Groupe Altarea, acteur français multi-métiers engagé dans le bas carbone.',
      keywords: [
        'altarea', 'groupe', 'actionnaire', 'maison mere', 'qui etes vous', 'entreprise',
        'societe', 'histoire', 'group', 'parent company', 'who are you',
      ],
      link: { label: en ? 'The Altarea Group' : 'Le groupe Altarea', href: path(locale, '/groupe') },
    },
    {
      id: 'equipe',
      question: en ? 'Who will I be dealing with?' : 'Avec qui vais-je échanger ?',
      answer: en
        ? 'Our sites are operated by our own teams — technical management, operations, sales and development. You can see who they are on the team page.'
        : 'Nos sites sont exploités par nos propres équipes — direction technique, opérations, commerce et développement. La page équipe vous dit qui elles sont.',
      keywords: [
        'equipe', 'equipes', 'qui', 'interlocuteur', 'contact technique', 'personne',
        'collaborateurs', 'team', 'staff', 'people',
      ],
      link: { label: en ? 'Our team' : 'Notre équipe', href: path(locale, '/equipes') },
    },
  ];
}

/* ------------------------------------------------------------------ *
 *  Assemblage
 * ------------------------------------------------------------------ */

export type KnowledgeInput = {
  faqs?: Faq[];
  datacenters?: Datacenter[];
  services?: Service[];
  certifications?: Certification[];
};

/**
 * Construit la base de connaissances de l'assistant pour une langue donnée.
 * L'ordre compte : la FAQ passe en premier, c'est le contenu rédigé
 * expressément pour répondre aux visiteurs.
 */
export function buildKnowledge(
  { faqs = [], datacenters = [], services = [], certifications = [] }: KnowledgeInput,
  locale: Locale = 'fr',
): KnowledgeEntry[] {
  const faqEntries: KnowledgeEntry[] = faqs
    .filter((f) => f.question && f.reponse)
    .map((f, i) => ({
      id: `faq-${i}`,
      question: f.question,
      answer: stripHtml(f.reponse),
      keywords: [],
      priority: 10 + i,
    }));

  return [
    ...faqEntries,
    ...datacenterEntries(datacenters, locale),
    ...serviceEntries(services, locale),
    ...certificationEntries(certifications, locale),
    ...staticEntries(locale),
  ];
}

/**
 * Les quelques sujets proposés d'emblée sous le message d'accueil.
 * On privilégie les entrées à `priority` basse (réseau, services,
 * certifications, contact), puis on complète avec la FAQ.
 */
export function starterEntries(entries: KnowledgeEntry[], max = 4): KnowledgeEntry[] {
  return [...entries]
    .filter((e) => e.priority !== undefined)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    .slice(0, max);
}
