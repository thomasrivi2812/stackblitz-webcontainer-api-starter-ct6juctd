'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/Logo';
import { LangSwitcher } from '@/components/LangSwitcher';
import type { Persona } from '@/lib/personas';
import type { Datacenter, NavMenuItem } from '@/lib/wordpress';

type Props = {
  personas?: Persona[];
  datacenters?: Datacenter[];
  /** Menu WP (Apparence → Menus, emplacement « header »). null/vide = nav par défaut. */
  nav?: NavMenuItem[] | null;
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

const isExternal = (href: string) => /^https?:\/\//i.test(href);

export function SiteHeader({ personas = [], datacenters = [], nav = null }: Props) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false); // tiroir mobile
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null); // dropdown desktop survolé
  const [mobileSub, setMobileSub] = useState<string | null>(null); // accordéon mobile ouvert

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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
  const reseauChildren = datacenters.map((dc) => ({
    href: `/datacenters/${dc.slug}`,
    label: dc.title,
    ville: dc.datacenterFields?.ville ?? null,
  }));

  // Navigation : menu WP si configuré, sinon nav par défaut (identique à
  // l'historique du site). Les boutons Contact / Portail / FR-EN restent fixes.
  const items: NavMenuItem[] =
    nav && nav.length > 0
      ? nav
      : [
          { label: t('reseau'), href: '/datacenters', children: [] },
          { label: t('offres'), href: '/offres', children: [] },
          { label: t('certifications'), href: '/certifications', children: [] },
          { label: t('services'), href: '/services', children: [] },
          {
            label: t('apropos'),
            href: '#',
            children: [
              { label: t('equipes'), href: '/equipes' },
              { label: t('groupe'), href: '/groupe' },
            ],
          },
          { label: t('actualites'), href: '/actualites', children: [] },
        ];

  // /datacenters et /offres gardent leur menu déroulant enrichi (données WP) ;
  // tout élément de menu avec des sous-éléments devient un déroulant simple.
  const kindOf = (item: NavMenuItem) => {
    if (item.href === '/datacenters' && reseauChildren.length > 0) return 'reseau' as const;
    if (item.href === '/offres' && offresChildren.length > 0) return 'offres' as const;
    if (item.children.length > 0) return 'dropdown' as const;
    return 'link' as const;
  };

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" onClick={close}>
          <Logo />
        </Link>

        {/* ---------- Nav desktop ---------- */}
        <nav className="nav">
          {items.map((item, i) => {
            const id = `nav-${i}`;
            const kind = kindOf(item);

            if (kind === 'link') {
              return isExternal(item.href) ? (
                <a key={id} href={item.href} className="nav-link" target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              ) : (
                <Link key={id} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={id}
                className="nav-item"
                onMouseEnter={() => setDesktopOpen(id)}
                onMouseLeave={() => setDesktopOpen(null)}
              >
                {item.href && item.href !== '#' ? (
                  <Link href={item.href} className="nav-link">
                    {item.label}
                    <Chevron className="nav-chev" />
                  </Link>
                ) : (
                  <button type="button" className="nav-link nav-link-btn" aria-expanded={desktopOpen === id}>
                    {item.label}
                    <Chevron className="nav-chev" />
                  </button>
                )}

                {kind === 'reseau' ? (
                  <div className={`nav-dd wide${desktopOpen === id ? ' open' : ''}`}>
                    <Link href="/datacenters" className="nav-dd-all">
                      {t('reseauAll')}
                      <span aria-hidden="true">→</span>
                    </Link>
                    <div className="nav-dd-grid">
                      {reseauChildren.map((c) => (
                        <Link key={c.href} href={c.href} className="nav-dd-item">
                          <span className="nav-dd-name">{c.label}</span>
                          {c.ville && <span className="sub">{c.ville}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`nav-dd${desktopOpen === id ? ' open' : ''}`}>
                    {kind === 'offres' && (
                      <Link href="/offres" className="nav-dd-all">
                        {t('offresAll')}
                        <span aria-hidden="true">→</span>
                      </Link>
                    )}
                    {(kind === 'offres' ? offresChildren : item.children).map((c) => (
                      <Link key={c.href} href={c.href} className="nav-dd-item">
                        <span className="nav-dd-name">{c.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Actions : Portail + Contact mis en valeur (fixes, hors menu WP) */}
          <div className="nav-actions">
            <a
              className="nav-portal"
              href={process.env.NEXT_PUBLIC_PORTAL_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              {t('portail')}
            </a>
            <Link href="/contact" className="nav-cta">{t('contact')}</Link>
            <LangSwitcher />
          </div>
        </nav>

        {/* ---------- Burger ---------- */}
        <button
          className={open ? 'burger open' : 'burger'}
          onClick={toggle}
          aria-label={t('menu')}
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ---------- Nav mobile ---------- */}
        <nav className={open ? 'mobile-nav open' : 'mobile-nav'}>
          {items.map((item, i) => {
            const id = `nav-${i}`;
            const kind = kindOf(item);

            if (kind === 'link') {
              return isExternal(item.href) ? (
                <a key={id} href={item.href} onClick={close} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              ) : (
                <Link key={id} href={item.href} onClick={close}>
                  {item.label}
                </Link>
              );
            }

            return (
              <div className="mnav-group" key={id}>
                <button
                  type="button"
                  className={`mnav-trigger${mobileSub === id ? ' open' : ''}`}
                  aria-expanded={mobileSub === id}
                  onClick={() => setMobileSub((v) => (v === id ? null : id))}
                >
                  {item.label}
                  <Chevron className="chev" />
                </button>
                <div className={`mnav-sub${mobileSub === id ? ' open' : ''}`}>
                  {kind === 'reseau' && (
                    <>
                      <Link href="/datacenters" className="all" onClick={close}>
                        {t('reseauAll')}
                      </Link>
                      {reseauChildren.map((c) => (
                        <Link key={c.href} href={c.href} onClick={close}>
                          {c.label}
                          {c.ville ? ` — ${c.ville}` : ''}
                        </Link>
                      ))}
                    </>
                  )}
                  {kind === 'offres' && (
                    <>
                      <Link href="/offres" className="all" onClick={close}>
                        {t('offresAll')}
                      </Link>
                      {offresChildren.map((c) => (
                        <Link key={c.href} href={c.href} onClick={close}>
                          {c.label}
                        </Link>
                      ))}
                    </>
                  )}
                  {kind === 'dropdown' &&
                    item.children.map((c) => (
                      <Link key={c.href} href={c.href} onClick={close}>
                        {c.label}
                      </Link>
                    ))}
                </div>
              </div>
            );
          })}

          <div className="mnav-actions">
            <Link href="/contact" className="nav-cta" onClick={close}>{t('contact')}</Link>
            <a
              className="nav-portal"
              href={process.env.NEXT_PUBLIC_PORTAL_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              {t('portail')}
            </a>
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
