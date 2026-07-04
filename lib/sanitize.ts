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
  // 'id' retiré volontairement : évite le DOM clobbering (un id injecté peut
  // écraser des références globales window.<id> / document.<id>).
  'class', 'colspan', 'rowspan', 'scope',
  // iframes d'intégration (YouTube/Vimeo) — le domaine est verrouillé par le hook.
  'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy',
];

// Domaines d'iframe autorisés (intégrations vidéo). Tout autre <iframe> est
// supprimé — défense en profondeur au niveau du sanitizer, en plus de la CSP
// frame-src. Le hook est enregistré une seule fois au chargement du module.
const IFRAME_ALLOWED_HOSTS = /^(www\.)?(youtube(-nocookie)?\.com|youtu\.be|player\.vimeo\.com)$/i;

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') return;
  const src = (node as Element).getAttribute?.('src') || '';
  let ok = false;
  try {
    ok = IFRAME_ALLOWED_HOSTS.test(new URL(src).hostname);
  } catch {
    ok = false;
  }
  if (!ok) (node as Element).parentNode?.removeChild(node as Element);
});

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
