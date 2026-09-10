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
export function LangSwitcher() {
  const t = useTranslations('langSwitcher');
  const active = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  // Retour visuel pendant la navigation : la page traduite est rendue côté
  // serveur, ce qui peut prendre une seconde ; sans indicateur, le clic
  // semblait sans effet. `pending` reste vrai jusqu'à l'arrivée de la page.
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<Locale | null>(null);

  const switchTo = (locale: Locale) => {
    if (locale === active || pending) return;
    setTarget(locale);
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
    // On repasse les params dynamiques (ex. [slug]) pour reconstruire l'URL.
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params dynamiques typés de façon générique
        { pathname, params, query },
        { locale },
      );
    });
  };
  const loading = (locale: Locale) => pending && target === locale;

  return (
    <div className={`ndc-lang${pending ? ' is-busy' : ''}`} role="group" aria-label={t('label')} aria-busy={pending}>
      <button
        type="button"
        className={`ndc-lang-opt${active === 'fr' ? ' is-active' : ''}${loading('fr') ? ' is-loading' : ''}`}
        aria-pressed={active === 'fr'}
        lang="fr"
        title={t('frFull')}
        disabled={pending}
        onClick={() => switchTo('fr')}
      >
        <span className="ndc-lang-txt">{t('fr')}</span>
        <span className="ndc-lang-spin" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`ndc-lang-opt${active === 'en' ? ' is-active' : ''}${loading('en') ? ' is-loading' : ''}`}
        aria-pressed={active === 'en'}
        lang="en"
        title={t('enFull')}
        disabled={pending}
        onClick={() => switchTo('en')}
      >
        <span className="ndc-lang-txt">{t('en')}</span>
        <span className="ndc-lang-spin" aria-hidden="true" />
      </button>

      <style>{`
        .ndc-lang{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--line,#e2e8f1);border-radius:8px;background:var(--surface-alt,#f6f9fc)}
        /* Cible tactile ≥ 36px de haut (WCAG 2.5.8 « Target Size (Minimum) ») */
        .ndc-lang-opt{display:inline-flex;align-items:center;justify-content:center;min-height:34px;min-width:38px;border:none;background:transparent;cursor:pointer;font:inherit;font-size:13px;font-weight:600;color:var(--muted,#5d6b85);padding:6px 12px;border-radius:6px;transition:background .15s ease,color .15s ease}
        .ndc-lang-opt:hover{color:var(--heading,#1b3360)}
        .ndc-lang-opt.is-active{background:var(--surface,#fff);color:var(--heading,#1b3360);box-shadow:0 1px 3px rgba(20,40,73,.12)}
        .ndc-lang-opt:focus-visible{outline:2px solid var(--marine,#1b3360);outline-offset:2px}
        .ndc-lang-opt{position:relative}
        .ndc-lang-opt:disabled{cursor:progress}
        .ndc-lang.is-busy .ndc-lang-opt:not(.is-loading){opacity:.55}
        .ndc-lang-spin{position:absolute;inset:0;margin:auto;width:14px;height:14px;border-radius:50%;border:2px solid rgba(27,51,96,.2);border-top-color:var(--marine,#1b3360);opacity:0;animation:ndc-lang-spin .7s linear infinite}
        .ndc-lang-opt.is-loading .ndc-lang-txt{visibility:hidden}
        .ndc-lang-opt.is-loading .ndc-lang-spin{opacity:1}
        @keyframes ndc-lang-spin{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion:reduce){.ndc-lang-spin{animation:none;border-top-color:rgba(27,51,96,.2);border-color:var(--marine,#1b3360)}}
      `}</style>
    </div>
  );
}
