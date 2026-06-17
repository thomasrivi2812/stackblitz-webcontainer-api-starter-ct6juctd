'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { LangSwitcher } from '@/components/LangSwitcher';

const NAV = [
  { href: '/datacenters', label: 'Notre réseau' },
  { href: '/offres', label: 'Nos offres' },
  { href: '/#services', label: 'Nos services' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" onClick={close}>
          <Logo />
        </Link>

        <nav className="nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <LangSwitcher />
        </nav>

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

        <nav className={open ? 'mobile-nav open' : 'mobile-nav'}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
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
