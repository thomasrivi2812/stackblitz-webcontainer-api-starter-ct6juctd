// Configuration Didomi (CMP / bannière cookies) du site NDC. Clé API et
// notice sont publiques (visibles dans la page) : valeurs intégrées par
// défaut, surchargeables par NEXT_PUBLIC_DIDOMI_API_KEY / _NOTICE_ID.
// NEXT_PUBLIC_DIDOMI_API_KEY=off désactive la bannière (ex. recette).
const key = process.env.NEXT_PUBLIC_DIDOMI_API_KEY || '4bca7c81-5aa2-4ca6-b67d-ae08ed69325b';

export const DIDOMI_API_KEY = key === 'off' ? '' : key;
export const DIDOMI_NOTICE_ID = process.env.NEXT_PUBLIC_DIDOMI_NOTICE_ID || 'UChTekHy';
export const DIDOMI_ENABLED = Boolean(DIDOMI_API_KEY);

// Fournisseurs déclarés dans la console Didomi (« SDK ID »).
export const DIDOMI_VENDORS = {
  youtube: 'c:youtube-CmNh9p6x',
  vimeo: 'c:vimeo-bFFbqHWa',
} as const;

type DidomiApi = {
  preferences?: { show?: (view?: string) => void };
  getCurrentUserStatus?: () => { vendors?: Record<string, { enabled?: boolean }> };
  getUserConsentStatusForVendor?: (id: string) => boolean | undefined;
  on?: (event: string, cb: () => void) => void;
};

declare global {
  interface Window {
    Didomi?: DidomiApi;
    didomiOnReady?: ((d: DidomiApi) => void)[];
    didomiEventListeners?: { event: string; listener: () => void }[];
  }
}

/** Le visiteur a-t-il accepté ce fournisseur dans Didomi ? (false si pas encore de choix) */
export function didomiVendorConsent(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const d = window.Didomi;
    const v = d?.getCurrentUserStatus?.().vendors?.[id];
    if (v) return v.enabled === true;
    return d?.getUserConsentStatusForVendor?.(id) === true;
  } catch {
    return false;
  }
}

/**
 * Appelle `cb` quand Didomi est prêt puis à chaque changement de
 * consentement. Fonctionne que le SDK soit déjà chargé ou non.
 */
export function onDidomiConsent(cb: () => void): void {
  if (typeof window === 'undefined' || !DIDOMI_ENABLED) return;
  window.didomiOnReady = window.didomiOnReady || [];
  window.didomiOnReady.push(() => cb());
  if (window.Didomi?.on) {
    window.Didomi.on('consent.changed', cb);
  } else {
    window.didomiEventListeners = window.didomiEventListeners || [];
    window.didomiEventListeners.push({ event: 'consent.changed', listener: cb });
  }
}

/** Rouvre la fenêtre de préférences Didomi. */
export function showDidomiPreferences(): void {
  window.Didomi?.preferences?.show?.();
}
