'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Logo } from '@/components/Logo';
import { LangSwitcher } from '@/components/LangSwitcher';
import type { Persona } from '@/lib/personas';
import { statutInfo, type Datacenter, type Service } from '@/lib/wordpress';

type Props = {
  personas?: Persona[];
  datacenters?: Datacenter[];
  /** Services (menu déroulant « Nos services », ancrés sur /services#slug). */
  services?: Service[];
  /** Logo du site défini dans WP (sinon marque N|D|C dessinée). */
  logoUrl?: string | null;
  /** Image de la carte « Découvrir notre équipe » (WP, sinon défaut). */
  equipeImageUrl?: string | null;
  /** Image de la carte « Découvrir nos engagements » (WP, sinon défaut). */
  offresImageUrl?: string | null;
  /** Image de la carte « Demander une visite » du menu réseau (WP, sinon défaut). */
  reseauImageUrl?: string | null;
};

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

// Clés i18n (namespace « datacenters ») des libellés de statut du menu réseau.
const STATUT_MSG: Record<string, string> = {
  livre: 'statutLivre',
  construction: 'statutConstruction',
  avenir: 'statutAvenir',
};

export function SiteHeader({ personas = [], datacenters = [], services = [], logoUrl = null, equipeImageUrl = null, offresImageUrl = null, reseauImageUrl = null }: Props) {
  const t = useTranslations('nav');
  // Libellés de statut réutilisés tels quels depuis les cards data centers.
  const td = useTranslations('datacenters');
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // tiroir mobile
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null); // dropdown desktop ouvert
  const [mobileSub, setMobileSub] = useState<string | null>(null); // accordéon mobile ouvert

  // Fermeture différée au survol + retour de focus à Échap.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Clic/tap hors de la nav → fermeture (utile après ouverture au clavier).
  useEffect(() => {
    if (!desktopOpen) return;
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setDesktopOpen(null);
      }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [desktopOpen]);

  // Ouverture immédiate (annule une fermeture en attente).
  const openMenu = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDesktopOpen(key);
  };
  // Fermeture différée (~160 ms) : la traversée en diagonale vers le panneau
  // ne referme plus le menu au premier pixel hors du bloc.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDesktopOpen(null), 160);
  };
  // Échap : ferme le menu ouvert et rend le focus à son déclencheur.
  // Focus d'abord : son onFocus rouvre le menu, puis la fermeture (posée
  // après) gagne — l'ordre inverse laisserait le panneau rouvert.
  const onNavKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && desktopOpen) {
      triggerRefs.current[desktopOpen]?.focus();
      setDesktopOpen(null);
    }
  };
  // Le focus (Tab) quitte l'item → fermeture.
  const onItemBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDesktopOpen(null);
    }
  };
  // Props communes des wrappers d'item : souris + clavier (focus ouvre).
  const itemProps = (key: string) => ({
    className: 'nav-item',
    onMouseEnter: () => openMenu(key),
    onMouseLeave: scheduleClose,
    onFocus: () => openMenu(key),
    onBlur: onItemBlur,
  });

  // Section active selon le chemin (soulignement + aria-current).
  const sectionFor = (p: string): string | null => {
    if (p.startsWith('/datacenters')) return 'reseau';
    if (p.startsWith('/offres')) return 'offres';
    if (p.startsWith('/services')) return 'services';
    if (p.startsWith('/certifications')) return 'certifications';
    if (p.startsWith('/documentation') || p.startsWith('/actualites')) return 'ressources';
    if (p.startsWith('/equipes') || p.startsWith('/groupe')) return 'apropos';
    return null;
  };
  const active = sectionFor(pathname);
  const linkCls = (key: string) => `nav-link${active === key ? ' active' : ''}`;

  const close = () => {
    setOpen(false);
    setMobileSub(null);
  };
  const toggle = () => setOpen((v) => !v);

  // Sous-éléments construits depuis les vraies données (WordPress ou fallback)
  const offresChildren = personas.map((p) => ({
    href: `/offres?profil=${p.id}`,
    label: p.label,
    accent: p.accent,
  }));
  const reseauChildren = datacenters.map((dc) => {
    const { key } = statutInfo(dc.datacenterFields?.statut ?? '');
    return {
      href: `/datacenters/${dc.slug}`,
      label: dc.title,
      ville: dc.datacenterFields?.ville ?? null,
      statut: STATUT_MSG[key] ? { key, label: td(STATUT_MSG[key]) } : null,
    };
  });
  // Chaque service pointe sur SA section de la page (ancre id={slug}).
  const servicesChildren = services
    .filter((s) => s.slug)
    .map((s) => ({ href: `/services#${s.slug}`, label: s.titre }));

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || '#';

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" onClick={close}>
          <Logo src={logoUrl} />
        </Link>

        {/* ---------- Nav desktop ---------- */}
        <nav className="nav" aria-label={t('ariaMain')} ref={navRef} onKeyDown={onNavKeyDown}>
          {/* Notre réseau — sites + carte promo « Demander une visite » */}
          <div {...itemProps('reseau')}>
            <Link
              href="/datacenters"
              className={linkCls('reseau')}
              aria-haspopup="true"
              aria-expanded={desktopOpen === 'reseau'}
              aria-current={active === 'reseau' ? 'page' : undefined}
              ref={(el) => { triggerRefs.current.reseau = el; }}
            >
              {t('reseau')}
              <Chevron className="nav-chev" />
            </Link>
            {reseauChildren.length > 0 && (
              <div className={`nav-dd nav-dd-split nav-dd-reseau${desktopOpen === 'reseau' ? ' open' : ''}`}>
                <div className="nav-dd-col">
                  <Link href="/datacenters" className="nav-dd-all">
                    {t('reseauAll')}
                    <span aria-hidden="true">→</span>
                  </Link>
                  <div className="nav-dd-grid">
                    {reseauChildren.map((c) => (
                      <Link key={c.href} href={c.href} className="nav-dd-item">
                        <span className="nav-dd-name">
                          {c.label}
                          {/* Même code visuel que les pastilles des cards data centers */}
                          {c.statut && (
                            <span className={`nav-dd-status ${c.statut.key}`}>{c.statut.label}</span>
                          )}
                        </span>
                        {c.ville && <span className="sub">{c.ville}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="nav-dd-promo"
                  style={{ backgroundImage: `url('${reseauImageUrl || '/datacenters/rouen.jpg'}')` }}
                >
                  <span className="nav-dd-promo-body">
                    <span className="nav-dd-promo-eyebrow">{t('visitePromoEyebrow')}</span>
                    <span className="nav-dd-promo-text">
                      {t('visitePromo')}
                      {' '}
                      <span className="nav-dd-promo-arrow" aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Nos offres — liens + carte promo « engagements » (image + filtre) */}
          <div {...itemProps('offres')}>
            <Link
              href="/offres"
              className={linkCls('offres')}
              aria-haspopup="true"
              aria-expanded={desktopOpen === 'offres'}
              aria-current={active === 'offres' ? 'page' : undefined}
              ref={(el) => { triggerRefs.current.offres = el; }}
            >
              {t('offres')}
              <Chevron className="nav-chev" />
            </Link>
            {offresChildren.length > 0 && (
              <div className={`nav-dd nav-dd-split${desktopOpen === 'offres' ? ' open' : ''}`}>
                <div className="nav-dd-col">
                  <Link href="/offres" className="nav-dd-all">
                    {t('offresAll')}
                    <span aria-hidden="true">→</span>
                  </Link>
                  {offresChildren.map((c) => (
                    <Link key={c.href} href={c.href} className="nav-dd-item">
                      <span className="nav-dd-name">{c.label}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/#engagements"
                  className="nav-dd-promo"
                  style={{ backgroundImage: `url('${offresImageUrl || '/datacenters/velizy.png'}')` }}
                >
                  <span className="nav-dd-promo-body">
                    <span className="nav-dd-promo-eyebrow">{t('engagementsPromoEyebrow')}</span>
                    <span className="nav-dd-promo-text">
                      {t('engagementsPromo')}
                      {' '}
                      <span className="nav-dd-promo-arrow" aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Nos services — chaque entrée pointe sur sa section (/services#slug) */}
          <div {...itemProps('services')}>
            <Link
              href="/services"
              className={linkCls('services')}
              aria-haspopup="true"
              aria-expanded={desktopOpen === 'services'}
              aria-current={active === 'services' ? 'page' : undefined}
              ref={(el) => { triggerRefs.current.services = el; }}
            >
              {t('services')}
              <Chevron className="nav-chev" />
            </Link>
            {servicesChildren.length > 0 && (
              <div className={`nav-dd nav-dd-split nav-dd-services${desktopOpen === 'services' ? ' open' : ''}`}>
                <div className="nav-dd-col">
                  <Link href="/services" className="nav-dd-all">
                    {t('servicesAll')}
                    <span aria-hidden="true">→</span>
                  </Link>
                  <div className="nav-dd-grid">
                    {servicesChildren.map((c) => (
                      <Link key={c.href} href={c.href} className="nav-dd-item">
                        <span className="nav-dd-name">{c.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  href="/equipes"
                  className="nav-dd-promo"
                  style={{ backgroundImage: `url('${equipeImageUrl || '/datacenters/rennes-1.png'}')` }}
                >
                  <span className="nav-dd-promo-body">
                    <span className="nav-dd-promo-eyebrow">{t('equipePromoEyebrow')}</span>
                    <span className="nav-dd-promo-text">
                      {t('equipePromo')}
                      {' '}
                      <span className="nav-dd-promo-arrow" aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/certifications"
            className={linkCls('certifications')}
            aria-current={active === 'certifications' ? 'page' : undefined}
          >
            {t('certifications')}
          </Link>

          {/* Ressources : documentation, actualités, portail client */}
          <div {...itemProps('ressources')}>
            <button
              type="button"
              className={`nav-link nav-link-btn${active === 'ressources' ? ' active' : ''}`}
              aria-haspopup="true"
              aria-expanded={desktopOpen === 'ressources'}
              ref={(el) => { triggerRefs.current.ressources = el; }}
            >
              {t('ressources')}
              <Chevron className="nav-chev" />
            </button>
            <div className={`nav-dd nav-dd-menu${desktopOpen === 'ressources' ? ' open' : ''}`}>
              <Link href="/documentation" className="nav-dd-item">
                <span className="nav-dd-name">{t('documentation')}</span>
                <span className="sub">{t('documentationSub')}</span>
              </Link>
              <Link href="/actualites" className="nav-dd-item">
                <span className="nav-dd-name">{t('actualites')}</span>
                <span className="sub">{t('actualitesSub')}</span>
              </Link>
              <a
                className="nav-dd-item row nav-dd-portal"
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LockIcon />
                <span className="nav-dd-name">{t('portail')}</span>
              </a>
            </div>
          </div>

          {/* À propos de nous (dropdown : équipes + groupe) */}
          <div {...itemProps('apropos')}>
            <button
              type="button"
              className={`nav-link nav-link-btn${active === 'apropos' ? ' active' : ''}`}
              aria-haspopup="true"
              aria-expanded={desktopOpen === 'apropos'}
              ref={(el) => { triggerRefs.current.apropos = el; }}
            >
              {t('apropos')}
              <Chevron className="nav-chev" />
            </button>
            <div className={`nav-dd nav-dd-menu${desktopOpen === 'apropos' ? ' open' : ''}`}>
              <Link href="/equipes" className="nav-dd-item">
                <span className="nav-dd-name">{t('equipes')}</span>
              </Link>
              <Link href="/groupe" className="nav-dd-item">
                <span className="nav-dd-name">{t('groupe')}</span>
              </Link>
            </div>
          </div>

          {/* Actions : Contact mis en valeur (portail déplacé dans Ressources) */}
          <div className="nav-actions">
            <Link href="/contact" className="nav-cta">{t('contact')}</Link>
            <LangSwitcher />
          </div>
        </nav>

        {/* ---------- Burger ---------- */}
        <button
          className={open ? 'burger open' : 'burger'}
          onClick={toggle}
          aria-label={t('menu')}
          aria-expanded={open}
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ---------- Nav mobile ---------- */}
        <nav className={open ? 'mobile-nav open' : 'mobile-nav'} aria-label={t('menu')}>
          {/* Notre réseau (accordéon) */}
          <div className="mnav-group">
            <button
              type="button"
              className={`mnav-trigger${mobileSub === 'reseau' ? ' open' : ''}`}
              aria-expanded={mobileSub === 'reseau'}
              onClick={() => setMobileSub((v) => (v === 'reseau' ? null : 'reseau'))}
            >
              {t('reseau')}
              <Chevron className="chev" />
            </button>
            <div className={`mnav-sub${mobileSub === 'reseau' ? ' open' : ''}`}>
              <Link href="/datacenters" className="all" onClick={close}>
                {t('reseauAll')}
              </Link>
              {reseauChildren.map((c) => (
                <Link key={c.href} href={c.href} onClick={close}>
                  {c.label}
                  {c.ville ? ` — ${c.ville}` : ''}
                </Link>
              ))}
            </div>
          </div>

          {/* Nos offres (accordéon) */}
          <div className="mnav-group">
            <button
              type="button"
              className={`mnav-trigger${mobileSub === 'offres' ? ' open' : ''}`}
              aria-expanded={mobileSub === 'offres'}
              onClick={() => setMobileSub((v) => (v === 'offres' ? null : 'offres'))}
            >
              {t('offres')}
              <Chevron className="chev" />
            </button>
            <div className={`mnav-sub${mobileSub === 'offres' ? ' open' : ''}`}>
              <Link href="/offres" className="all" onClick={close}>
                {t('offresAll')}
              </Link>
              {offresChildren.map((c) => (
                <Link key={c.href} href={c.href} onClick={close}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Nos services (accordéon) */}
          <div className="mnav-group">
            <button
              type="button"
              className={`mnav-trigger${mobileSub === 'services' ? ' open' : ''}`}
              aria-expanded={mobileSub === 'services'}
              onClick={() => setMobileSub((v) => (v === 'services' ? null : 'services'))}
            >
              {t('services')}
              <Chevron className="chev" />
            </button>
            <div className={`mnav-sub${mobileSub === 'services' ? ' open' : ''}`}>
              <Link href="/services" className="all" onClick={close}>
                {t('servicesAll')}
              </Link>
              {servicesChildren.map((c) => (
                <Link key={c.href} href={c.href} onClick={close}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/certifications" onClick={close}>{t('certifications')}</Link>

          {/* Ressources (accordéon) */}
          <div className="mnav-group">
            <button
              type="button"
              className={`mnav-trigger${mobileSub === 'ressources' ? ' open' : ''}`}
              aria-expanded={mobileSub === 'ressources'}
              onClick={() => setMobileSub((v) => (v === 'ressources' ? null : 'ressources'))}
            >
              {t('ressources')}
              <Chevron className="chev" />
            </button>
            <div className={`mnav-sub${mobileSub === 'ressources' ? ' open' : ''}`}>
              <Link href="/documentation" onClick={close}>{t('documentation')}</Link>
              <Link href="/actualites" onClick={close}>{t('actualites')}</Link>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer" onClick={close}>
                {t('portail')}
              </a>
            </div>
          </div>

          {/* À propos de nous (accordéon) */}
          <div className="mnav-group">
            <button
              type="button"
              className={`mnav-trigger${mobileSub === 'apropos' ? ' open' : ''}`}
              aria-expanded={mobileSub === 'apropos'}
              onClick={() => setMobileSub((v) => (v === 'apropos' ? null : 'apropos'))}
            >
              {t('apropos')}
              <Chevron className="chev" />
            </button>
            <div className={`mnav-sub${mobileSub === 'apropos' ? ' open' : ''}`}>
              <Link href="/equipes" onClick={close}>{t('equipes')}</Link>
              <Link href="/groupe" onClick={close}>{t('groupe')}</Link>
            </div>
          </div>

          <div className="mnav-actions">
            <Link href="/contact" className="nav-cta" onClick={close}>{t('contact')}</Link>
          </div>
          <LangSwitcher />
        </nav>

        <div
          className={open ? 'mobile-overlay open' : 'mobile-overlay'}
          onClick={close}
          aria-hidden="true"
        ></div>
      </div>
    </header>
  );
}
