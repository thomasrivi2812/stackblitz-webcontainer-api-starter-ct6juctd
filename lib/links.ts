// Liens et libellés de bouton saisis dans WordPress, adaptés à la langue.
// -----------------------------------------------------------------------
// Les liens internes saisis dans WP (« /contact », « /services »…) pointent
// vers la version française ; sur le site anglais ils doivent mener à
// « /en/contact ». Utilisable côté serveur et côté navigateur.

const SITE_HOSTS = /^https?:\/\/(www\.)?nationdatacenter\.fr(?=\/|$)/i;

/** Lien WordPress → lien de la langue courante (internes seulement). */
export function localizeHref(href: string, locale: string): string {
  if (locale !== 'en' || !href) return href;
  let path = href.replace(SITE_HOSTS, '');
  if (!path.startsWith('/') || path.startsWith('//')) return href; // externe, ancre, mailto…
  if (/^\/en(\/|$|[?#])/.test(path)) return path;
  // Fichiers et routes techniques : jamais préfixés.
  if (/^\/(wp-content|wp-json|api|_next)\//.test(path) || /\.[a-z0-9]{2,5}(\?|#|$)/i.test(path)) return href;
  // « / », « /#ancre », « /?q » → « /en », « /en#ancre », « /en?q ».
  if (path === '/' || path.startsWith('/#') || path.startsWith('/?')) return `/en${path.slice(1)}`;
  return `/en${path}`;
}

// Libellés de bouton courants saisis en français dans WordPress, affichés
// en anglais tant que la traduction WP n'est pas faite.
const CTA_EN: Record<string, string> = {
  'en savoir plus': 'Learn more',
  'lire la suite': 'Read more',
  'lire l’article': 'Read the article',
  "lire l'article": 'Read the article',
  'découvrir': 'Discover',
  'voir plus': 'See more',
  'voir tout': 'See all',
  'tout voir': 'See all',
  'nous contacter': 'Contact us',
  'contactez-nous': 'Contact us',
  'contactez nous': 'Contact us',
  'demander un devis': 'Request a quote',
  'demander une visite': 'Request a visit',
  'demander un audit': 'Request an audit',
  'télécharger': 'Download',
  'découvrir nos offres': 'Discover our offerings',
  'découvrir nos data centers': 'Discover our data centers',
  'nos data centers': 'Our data centers',
  'voir le communiqué': 'See the press release',
  "s'inscrire": 'Sign up',
  'je m’inscris': 'Sign up',
};

/** Libellé de bouton WordPress, traduit en anglais s'il s'agit d'une formule courante. */
export function localizeCta(label: string | null | undefined, locale: string): string | null | undefined {
  if (locale !== 'en' || !label) return label;
  return CTA_EN[label.trim().toLowerCase()] ?? label;
}

// Régions françaises saisies dans WordPress : nom anglais usuel sur le site
// anglais (les autres régions gardent leur nom, identique en anglais).
const REGION_EN: Record<string, string> = {
  'bretagne': 'Brittany',
  'normandie': 'Normandy',
  'corse': 'Corsica',
  'ile-de-france': 'Île-de-France',
  'île-de-france': 'Île-de-France',
  "provence-alpes-côte d'azur": "Provence-Alpes-Côte d'Azur",
};

/** Région WordPress, en anglais sur le site anglais. */
export function localizeRegion(region: string | null | undefined, locale: string): string | null | undefined {
  if (locale !== 'en' || !region) return region;
  return REGION_EN[region.trim().toLowerCase()] ?? region;
}
