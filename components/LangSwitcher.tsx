'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

// Sélecteur de langue FR/EN du header.
// Navigue réellement vers la version traduite de la PAGE COURANTE : usePathname()
// de next-intl renvoie le chemin sans préfixe de locale, et router.replace(...,
// { locale }) reconstruit l'URL dans la langue cible (FR à la racine, EN sous /en).
// La navigation est enveloppée dans useTransition → on affiche un spinner sur le
// bouton cible tant que la nouvelle page se charge (utile si le réseau est lent).
export function LangSwitcher() {
  const t = useTranslations('langSwitcher');
  const active = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<Locale | null>(null);

  const switchTo = (locale: Locale) => {
    if (locale === active || isPending) return;
    // IMPORTANT : on fixe le cookie de langue AVANT de naviguer. Sans ça,
    // revenir vers le FR (URL sans préfixe avec localePrefix "as-needed")
    // fait re-détecter la langue par le middleware via l'ancien cookie
    // (NEXT_LOCALE=en) → redirection immédiate vers /en/... : l'interface
    // semblait ne pas changer de langue tant qu'on ne rechargeait pas.
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    // On conserve la query string courante (ex. ?profil=dsi sur /offres) pour
    // rester sur le même état après le changement de langue. On lit
    // window.location.search (autoritaire, capte aussi les maj via
    // history.replaceState) plutôt que useSearchParams.
    const query: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      new URLSearchParams(window.location.search).forEach((v, k) => { query[k] = v; });
    }
    setTarget(locale);
    // startTransition garde isPending=true le temps du chargement RSC de la
    // page traduite → on peut afficher un indicateur de chargement.
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params dynamiques typés de façon générique
        { pathname, params, query },
        { locale },
      );
    });
  };

  const renderOpt = (locale: Locale, label: string, full: string) => {
    const loading = isPending && target === locale;
    return (
      <button
        type="button"
        className={`ndc-lang-opt${active === locale ? ' is-active' : ''}${loading ? ' is-loading' : ''}`}
        aria-pressed={active === locale}
        aria-busy={loading}
        disabled={isPending}
        lang={locale}
        title={full}
        onClick={() => switchTo(locale)}
      >
        {loading ? <span className="ndc-lang-spin" aria-hidden="true" /> : label}
        {loading && <span className="ndc-lang-sr">{t('loading')}</span>}
      </button>
    );
  };

  return (
    <div className="ndc-lang" role="group" aria-label={t('label')} aria-busy={isPending}>
      {renderOpt('fr', t('fr'), t('frFull'))}
      {renderOpt('en', t('en'), t('enFull'))}

      <style>{`
        .ndc-lang{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--line,#e2e8f1);border-radius:8px;background:var(--surface-alt,#f6f9fc)}
        /* Cible tactile ≥ 36px de haut (WCAG 2.5.8 « Target Size (Minimum) ») */
        .ndc-lang-opt{display:inline-flex;align-items:center;justify-content:center;min-height:34px;min-width:38px;border:none;background:transparent;cursor:pointer;font:inherit;font-size:13px;font-weight:600;color:var(--muted,#5d6b85);padding:6px 12px;border-radius:6px;transition:background .15s ease,color .15s ease}
        .ndc-lang-opt:hover:not(:disabled){color:var(--heading,#1b3360)}
        .ndc-lang-opt.is-active{background:var(--surface,#fff);color:var(--heading,#1b3360);box-shadow:0 1px 3px rgba(20,40,73,.12)}
        .ndc-lang-opt.is-loading{background:var(--surface,#fff);color:var(--marine,#1b3360);box-shadow:0 1px 3px rgba(20,40,73,.12)}
        .ndc-lang-opt:disabled{cursor:progress}
        .ndc-lang-opt:focus-visible{outline:2px solid var(--marine,#1b3360);outline-offset:2px}
        .ndc-lang-spin{display:inline-block;width:13px;height:13px;border-radius:50%;border:2px solid currentColor;border-top-color:transparent;animation:ndc-lang-rot .6s linear infinite}
        @keyframes ndc-lang-rot{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion: reduce){.ndc-lang-spin{animation-duration:1.4s}}
        .ndc-lang-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
      `}</style>
    </div>
  );
}
