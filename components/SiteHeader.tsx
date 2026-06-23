'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { LangSwitcher } from '@/components/LangSwitcher';
import type { Persona } from '@/lib/personas';
import type { Datacenter } from '@/lib/wordpress';

type Props = {
  personas?: Persona[];
  datacenters?: Datacenter[];
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

export function SiteHeader({ personas = [], datacenters = [] }: Props) {
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

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" onClick={close}>
          <Logo />
        </Link>

        {/* ---------- Nav desktop ---------- */}
        <nav className="nav">
          {/* Notre réseau */}
          <div
            className="nav-item"
            onMouseEnter={() => setDesktopOpen('reseau')}
            onMouseLeave={() => setDesktopOpen(null)}
          >
            <Link href="/datacenters" className="nav-link">
              Notre réseau
              <Chevron className="nav-chev" />
            </Link>
            {reseauChildren.length > 0 && (
              <div className={`nav-dd wide${desktopOpen === 'reseau' ? ' open' : ''}`}>
                <Link href="/datacenters" className="nav-dd-all">
                  Voir tout le réseau
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
            )}
          </div>

          {/* Nos offres */}
          <div
            className="nav-item"
            onMouseEnter={() => setDesktopOpen('offres')}
            onMouseLeave={() => setDesktopOpen(null)}
          >
            <Link href="/offres" className="nav-link">
              Nos offres
              <Chevron className="nav-chev" />
            </Link>
            {offresChildren.length > 0 && (
              <div className={`nav-dd${desktopOpen === 'offres' ? ' open' : ''}`}>
                <Link href="/offres" className="nav-dd-all">
                  Toutes nos offres
                  <span aria-hidden="true">→</span>
                </Link>
                {offresChildren.map((c) => (
                  <Link key={c.href} href={c.href} className="nav-dd-item row">
                    <span className="nav-dd-dot" style={{ background: c.accent }} />
                    <span className="nav-dd-name">{c.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/certifications" className="nav-link">Certifications</Link>
          <Link href="/equipes" className="nav-link">Nos équipes</Link>
          <Link href="/groupe" className="nav-link">Le groupe</Link>
          <Link href="/actualites" className="nav-link">Actualités</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
          <LangSwitcher />
        </nav>

        {/* ---------- Burger ---------- */}
        <button
          className={open ? 'burger open' : 'burger'}
          onClick={toggle}
          aria-label="Menu"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ---------- Nav mobile ---------- */}
        <nav className={open ? 'mobile-nav open' : 'mobile-nav'}>
          {/* Notre réseau (accordéon) */}
          <div className="mnav-group">
            <button
              type="button"
              className={`mnav-trigger${mobileSub === 'reseau' ? ' open' : ''}`}
              aria-expanded={mobileSub === 'reseau'}
              onClick={() => setMobileSub((v) => (v === 'reseau' ? null : 'reseau'))}
            >
              Notre réseau
              <Chevron className="chev" />
            </button>
            <div className={`mnav-sub${mobileSub === 'reseau' ? ' open' : ''}`}>
              <Link href="/datacenters" className="all" onClick={close}>
                Voir tout le réseau
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
              Nos offres
              <Chevron className="chev" />
            </button>
            <div className={`mnav-sub${mobileSub === 'offres' ? ' open' : ''}`}>
              <Link href="/offres" className="all" onClick={close}>
                Toutes nos offres
              </Link>
              {offresChildren.map((c) => (
                <Link key={c.href} href={c.href} onClick={close}>
                  <span className="nav-dd-dot" style={{ background: c.accent }} />
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/certifications" onClick={close}>Certifications</Link>
          <Link href="/equipes" onClick={close}>Nos équipes</Link>
          <Link href="/groupe" onClick={close}>Le groupe</Link>
          <Link href="/actualites" onClick={close}>Actualités</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
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
