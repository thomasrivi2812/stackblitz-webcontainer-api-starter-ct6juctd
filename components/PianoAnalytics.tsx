'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsEnabled, setAnalyticsConsent, trackPage } from '@/lib/analytics';

// Piano Analytics : une page vue à chaque navigation (les pages sont servies
// depuis le cache, le comptage ne peut se faire que dans le navigateur), et
// passage en mesure complète si le visiteur y consent dans Didomi.
//
// NEXT_PUBLIC_DIDOMI_PIANO_VENDOR_ID : identifiant du fournisseur « Piano
// Analytics » dans la console Didomi. Sans lui, la mesure reste en mode
// exempté (conforme sans consentement), quel que soit le choix du visiteur.
const DIDOMI_VENDOR = process.env.NEXT_PUBLIC_DIDOMI_PIANO_VENDOR_ID;

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
    if (!analyticsEnabled || !DIDOMI_VENDOR) return;
    const sync = () => setAnalyticsConsent(vendorConsent(window.Didomi as DidomiApi | undefined, DIDOMI_VENDOR));
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
