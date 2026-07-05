import sanitizeHtml from 'sanitize-html';

// Nettoie le HTML provenant de WordPress AVANT de l'injecter via
// dangerouslySetInnerHTML. Défense contre le XSS stocké : un compte WP
// compromis (ou un contributeur autorisé à publier du HTML) ne peut plus
// faire exécuter de <script>, d'attribut on*=, de javascript: … chez les
// visiteurs. S'exécute uniquement côté serveur (RSC) → aucun coût dans le
// bundle client.
//
// Implémentation : sanitize-html (parseur pur JavaScript, sans jsdom) —
// fonctionne partout, y compris sous StackBlitz/WebContainer où jsdom
// (utilisé par isomorphic-dompurify) faisait planter le rendu serveur.
//
// Liste blanche d'éléments et d'attributs correspondant à ce que l'éditeur
// Gutenberg produit légitimement (paragraphes, titres, listes, liens, images,
// tableaux, citations, iframes d'intégration vidéo restreints).
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'a', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
    'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'cite', 'q', 'code', 'pre', 'hr', 'br',
    'figure', 'figcaption', 'img', 'picture', 'source',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'div', 'span', 'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
    source: ['src', 'srcset', 'sizes', 'type', 'media'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder', 'referrerpolicy', 'loading'],
    // 'id' exclu volontairement (DOM clobbering) ; 'style' exclu (CSS injecté).
    '*': ['class'],
  },
  // Iframes limitées aux intégrations vidéo connues — tout autre domaine est
  // supprimé (défense en profondeur, en plus de la CSP frame-src).
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'youtu.be', 'player.vimeo.com'],
  // Schémas d'URL sûrs : bloque javascript:, data: (hors images), vbscript:…
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  // Les <script>/<style> sont supprimés AVEC leur contenu (pas seulement la balise).
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],
};

export function sanitizeWpHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, OPTIONS);
}
