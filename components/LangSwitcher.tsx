'use client';

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

  const switchTo = (locale: Locale) => {
    if (locale === active) return;
    // On repasse les params dynamiques (ex. [slug]) pour reconstruire l'URL.
    router.replace(
      // @ts-expect-error -- params dynamiques typés de façon générique
      { pathname, params },
      { locale },
    );
  };

  return (
    <div className="ndc-lang" role="group" aria-label={t('label')}>
      <button
        type="button"
        className={`ndc-lang-opt${active === 'fr' ? ' is-active' : ''}`}
        aria-pressed={active === 'fr'}
        lang="fr"
        title={t('frFull')}
        onClick={() => switchTo('fr')}
      >
        {t('fr')}
      </button>
      <button
        type="button"
        className={`ndc-lang-opt${active === 'en' ? ' is-active' : ''}`}
        aria-pressed={active === 'en'}
        lang="en"
        title={t('enFull')}
        onClick={() => switchTo('en')}
      >
        {t('en')}
      </button>

      <style>{`
        .ndc-lang{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--line,#e2e8f1);border-radius:8px;background:var(--surface-alt,#f6f9fc)}
        .ndc-lang-opt{border:none;background:transparent;cursor:pointer;font:inherit;font-size:13px;font-weight:600;color:var(--muted,#5d6b85);padding:5px 10px;border-radius:6px;transition:background .15s ease,color .15s ease}
        .ndc-lang-opt:hover{color:var(--heading,#1b3360)}
        .ndc-lang-opt.is-active{background:var(--surface,#fff);color:var(--heading,#1b3360);box-shadow:0 1px 3px rgba(20,40,73,.12)}
      `}</style>
    </div>
  );
}
