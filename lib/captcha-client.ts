// Captcha ALTCHA — côté client.
// ------------------------------
// Invisible : pas de case à cocher ni d'image. Le navigateur récupère un défi
// sur /api/altcha et le résout par calcul (~1 s), puis la solution est jointe
// au formulaire. Auto-hébergé : aucun script ni cookie tiers.
//
// Pour que le visiteur n'attende pas, la résolution démarre dès qu'il entre
// dans un champ de saisie ; à l'envoi, la solution est en général déjà prête.

import type { Challenge, Solution } from 'altcha-lib';

const TIMEOUT_MS = 20_000;
/** Une solution préparée est jetée au-delà (le défi expire à 10 min côté serveur). */
const MAX_AGE_MS = 8 * 60_000;

let pending: { promise: Promise<string | null>; at: number } | null = null;

async function fetchAndSolve(): Promise<string | null> {
  try {
    const res = await fetch('/api/altcha', { cache: 'no-store' });
    if (!res.ok) return null;
    const challenge = (await res.json()) as Challenge;
    // Bibliothèque chargée à la demande : rien sur les pages sans formulaire utilisé.
    const [{ solveChallenge }, { deriveKey }] = await Promise.all([
      import('altcha-lib'),
      import('altcha-lib/algorithms/web/pbkdf2'),
    ]);
    const solution: Solution | null = await solveChallenge({ challenge, deriveKey, timeout: TIMEOUT_MS });
    if (!solution) return null;
    return btoa(JSON.stringify({ challenge, solution }));
  } catch {
    return null;
  }
}

/** Lance la résolution en avance (sans effet si une solution récente est en cours/prête). */
export function prepareCaptcha(): void {
  if (typeof window === 'undefined') return;
  if (pending && Date.now() - pending.at < MAX_AGE_MS) return;
  const promise = fetchAndSolve();
  pending = { promise, at: Date.now() };
  // Échec : on oublie, pour retenter au prochain appel.
  promise.then((t) => {
    if (!t && pending?.promise === promise) pending = null;
  });
}

/**
 * Renvoie la solution du captcha (à joindre au formulaire), ou null si
 * indisponible : le serveur refusera alors l'envoi et le visiteur pourra
 * réessayer. Chaque solution ne sert qu'une fois.
 */
export async function getCaptchaToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  prepareCaptcha();
  const current = pending;
  pending = null; // usage unique
  return current ? current.promise : null;
}

// Démarrage anticipé : premier focus dans un champ de saisie (formulaire,
// modale « question », téléchargement…), hors champs de recherche.
if (typeof window !== 'undefined') {
  document.addEventListener(
    'focusin',
    (e) => {
      const el = e.target as HTMLElement | null;
      if (el?.matches('input:not([type=search]):not([type=hidden]), textarea') && !el.closest('[role=search]')) {
        prepareCaptcha();
      }
    },
    { passive: true },
  );
}
