// Mesure d'audience Piano Analytics — côté client.
// -------------------------------------------------
// Consentement (« consent v2 » du SDK Piano) :
//  - par défaut, mode « essential » = exemption CNIL : mesure d'audience
//    strictement anonyme et limitée, autorisée SANS consentement ;
//  - « opt-in » (mesure complète) seulement si le visiteur accepte Piano dans
//    la bannière Didomi (voir components/PianoAnalytics.tsx).
// En mode essential, Piano ne transmet que ses événements standard
// (page.display, click.action, click.download, click.navigation, click.exit) :
// on n'utilise donc QUE ceux-là, pour ne rien perdre sans consentement.
//
// ENV (facultatives, valeurs NDC par défaut) : NEXT_PUBLIC_PIANO_COLLECT_DOMAIN
// et NEXT_PUBLIC_PIANO_SITE_ID. NEXT_PUBLIC_PIANO_COLLECT_DOMAIN=off coupe la mesure.

type PianoEventData = Record<string, string | number | boolean>;
type PianoSdk = {
  setConfigurations: (c: Record<string, unknown>) => void;
  sendEvent: (name: string, data: PianoEventData) => void;
  consent: { setMode: (mode: 'opt-in' | 'essential' | 'opt-out') => void };
};

declare global {
  interface Window {
    pdl?: Record<string, unknown>;
  }
}

const COLLECT_DOMAIN = process.env.NEXT_PUBLIC_PIANO_COLLECT_DOMAIN || 'https://tjtxkkw.pa-cd.com';
const SITE_ID = Number(process.env.NEXT_PUBLIC_PIANO_SITE_ID || 642163);

export const analyticsEnabled = COLLECT_DOMAIN !== 'off';

let sdk: Promise<PianoSdk | null> | null = null;

function loadSdk(): Promise<PianoSdk | null> {
  if (!analyticsEnabled || typeof window === 'undefined') return Promise.resolve(null);
  if (!sdk) {
    // Doit être posé AVANT le chargement du SDK, qui le lit à l'initialisation.
    window.pdl = {
      requireConsent: 'v2',
      consent: { products: ['PA'], defaultPreset: { PA: 'essential' } },
      migration: { browserId: { source: 'PA' } },
      cookies: { storageMode: 'fixed' },
    };
    sdk = import('piano-analytics-js')
      .then(({ pianoAnalytics }: { pianoAnalytics: PianoSdk }) => {
        pianoAnalytics.setConfigurations({ site: SITE_ID, collectDomain: COLLECT_DOMAIN });
        return pianoAnalytics;
      })
      .catch(() => null);
  }
  return sdk;
}

/** Envoie un événement standard Piano (sans effet si la mesure est désactivée). */
export function track(
  name: 'page.display' | 'click.action' | 'click.download' | 'click.navigation' | 'click.exit',
  data: PianoEventData,
): void {
  loadSdk().then((pa) => pa?.sendEvent(name, data));
}

/** Bascule mesure complète (consentement donné) / exemptée (refus ou pas de choix). */
export function setAnalyticsConsent(granted: boolean): void {
  loadSdk().then((pa) => pa?.consent.setMode(granted ? 'opt-in' : 'essential'));
}

/**
 * Page vue. Nom de page et chapitres déduits de l'URL, sans le préfixe de
 * langue (FR et EN se regroupent par rubrique) ; la langue est en chapitre 1 :
 *   /en/datacenters/velizy → page « datacenters::velizy »,
 *   chapitres « en » › « datacenters » › « velizy ».
 */
export function trackPage(pathname: string): void {
  const parts = pathname.split('/').filter(Boolean);
  const lang = parts[0] === 'en' ? 'en' : 'fr';
  if (parts[0] === 'en' || parts[0] === 'fr') parts.shift();
  const data: PianoEventData = {
    page: parts.length ? parts.join('::') : 'accueil',
    page_chapter1: lang,
  };
  if (parts[0]) data.page_chapter2 = parts[0];
  if (parts[1]) data.page_chapter3 = parts[1];
  track('page.display', data);
}
