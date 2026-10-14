// Paramètres de campagne (UTM) du visiteur, joints aux leads (spécification
// formulaires V1 : « Source ou paramètres UTM, si disponibles »).
// Mémorisés pour la session dès la page d'arrivée : le formulaire est souvent
// rempli plusieurs pages plus loin, après que l'URL a perdu ses paramètres.

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const STORE = 'ndc-utm';

export type Utm = Partial<Record<(typeof KEYS)[number], string>>;

function capture(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    const found: Utm = {};
    for (const k of KEYS) {
      const v = q.get(k);
      if (v) found[k] = v.slice(0, 100);
    }
    if (Object.keys(found).length) sessionStorage.setItem(STORE, JSON.stringify(found));
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

/** UTM de la session (vide si aucun). */
export function getUtm(): Utm {
  if (typeof window === 'undefined') return {};
  capture();
  try {
    return JSON.parse(sessionStorage.getItem(STORE) || '{}') as Utm;
  } catch {
    return {};
  }
}

if (typeof window !== 'undefined') capture();
