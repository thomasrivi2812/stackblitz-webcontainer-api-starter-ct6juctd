import DOMPurify from 'isomorphic-dompurify';

// Nettoie le HTML provenant de WordPress AVANT de l'injecter via
// dangerouslySetInnerHTML. Défense contre le XSS stocké : un compte WP
// compromis (ou un contributeur autorisé à publier du HTML) ne peut plus
// faire exécuter de <script>, d'attribut on*=, de javascript: … chez les
// visiteurs. S'exécute uniquement côté serveur (RSC) → aucun coût dans le
// bundle client.
//
// Liste blanche d'éléments et d'attributs correspondant à ce que l'éditeur
// Gutenberg produit légitimement (paragraphes, titres, listes, liens, images,
// tableaux, citations, iframes d'intégration vidéo restreints).
const ALLOWED_TAGS = [
  'p', 'a', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'cite', 'q', 'code', 'pre', 'hr', 'br',
  'figure', 'figcaption', 'img', 'picture', 'source',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'div', 'span', 'iframe',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'title',
  'src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding',
  'class', 'id', 'colspan', 'rowspan', 'scope',
  // iframes d'intégration (YouTube/Vimeo) — le domaine est verrouillé plus bas.
  'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy',
];

export function sanitizeWpHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // N'autorise que http(s) et les chemins relatifs/ancres pour href/src :
    // bloque javascript:, data: (hors images), vbscript:…
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    ADD_ATTR: ['target'],
    // Les iframes restent possibles mais purifiées ; on force l'ouverture
    // externe sécurisée des liens en post-traitement côté rendu si besoin.
    FORBID_TAGS: ['script', 'style', 'form', 'input', 'button', 'object', 'embed', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  });
}
