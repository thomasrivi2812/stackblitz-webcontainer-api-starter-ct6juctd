// Captcha Google reCAPTCHA v3 — côté client.
// --------------------------------------------
// v3 = invisible : pas de case à cocher ni d'image à sélectionner, Google
// attribue un score au visiteur et le serveur rejette les envois suspects.
//
// Fonctionnement : le script Google n'est chargé QU'AU MOMENT de l'envoi
// d'un formulaire (aucun impact sur le chargement des pages, et pas de
// cookie Google déposé tant qu'on n'envoie rien). Le badge reCAPTCHA
// apparaît en bas à droite une fois le script chargé (exigence Google).
//
// Activation : poser NEXT_PUBLIC_RECAPTCHA_SITE_KEY (et RECAPTCHA_SECRET_KEY
// côté serveur). Sans clé, ce module ne fait rien : les formulaires
// fonctionnent comme avant (honeypot + rate-limit + origine restent actifs).
//
// Note cookies : reCAPTCHA dépose le cookie _GRECAPTCHA (google.com) —
// mentionné dans la politique de cookies du site.

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const TIMEOUT_MS = 12_000;

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.grecaptcha) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY ?? '')}`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null; // permet une nouvelle tentative au prochain envoi
        reject(new Error('recaptcha script'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * Obtient un jeton reCAPTCHA v3 (action « lead »), ou null si le captcha
 * n'est pas configuré / indisponible. Le serveur décide quoi faire d'un
 * jeton absent.
 */
export async function getCaptchaToken(): Promise<string | null> {
  if (!SITE_KEY || typeof window === 'undefined') return null;
  try {
    await loadScript();
  } catch {
    return null;
  }
  const g = window.grecaptcha;
  if (!g) return null;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(token);
    };
    const timer = setTimeout(() => finish(null), TIMEOUT_MS);
    try {
      g.ready(() => {
        g.execute(SITE_KEY, { action: 'lead' })
          .then((token) => finish(token))
          .catch(() => finish(null));
      });
    } catch {
      finish(null);
    }
  });
}
