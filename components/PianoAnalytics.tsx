'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsEnabled, setAnalyticsConsent, trackPage } from '@/lib/analytics';

// Piano Analytics : une page vue à chaque navigation (les pages sont servies
// depuis le cache, le comptage ne peut se faire que dans le navigateur), et
// passage en mesure complète si le visiteur y consent dans Didomi.
//
// Fournisseurs Didomi qui couvrent Piano (« SDK ID » de la console Didomi) :
// « Piano Analytics » et son ancien nom « AT Internet ». Le consentement à
// l'un des deux suffit. Surchargeable par NEXT_PUBLIC_DIDOMI_PIANO_VENDOR_ID
// (liste séparée par des virgules).
const DIDOMI_VENDORS = (process.env.NEXT_PUBLIC_DIDOMI_PIANO_VENDOR_ID || 'c:pianohybr-R3VKC2r4,c:atinterne-biiwHkMQ')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

type DidomiApi = {
  getCurrentUserStatus?: () => { vendors?: Record<string, { enabled?: boolean }> };
  getUserConsentStatusForVendor?: (id: string) => boolean | undefined;
};

declare global {
  interface Window {
    didomiOnReady?: ((d: DidomiApi) => void)[];
    didomiEventListeners?: { event: string; listener: () => void }[];
  }
}

function vendorConsent(d: DidomiApi | undefined, id: string): boolean {
  try {
    const v = d?.getCurrentUserStatus?.().vendors?.[id];
    if (v) return v.enabled === true;
    return d?.getUserConsentStatusForVendor?.(id) === true;
  } catch {
    return false;
  }
}

export function PianoAnalytics() {
  const pathname = usePathname();

  // Consentement Didomi → mode Piano (au chargement, puis à chaque changement).
  useEffect(() => {
    if (!analyticsEnabled || !DIDOMI_VENDORS.length) return;
    const sync = () => {
      const d = window.Didomi as DidomiApi | undefined;
      setAnalyticsConsent(DIDOMI_VENDORS.some((id) => vendorConsent(d, id)));
    };
    window.didomiOnReady = window.didomiOnReady || [];
    window.didomiOnReady.push(sync);
    window.didomiEventListeners = window.didomiEventListeners || [];
    window.didomiEventListeners.push({ event: 'consent.changed', listener: sync });
  }, []);

  useEffect(() => {
    if (analyticsEnabled && pathname) trackPage(pathname);
  }, [pathname]);

  return null;
}
