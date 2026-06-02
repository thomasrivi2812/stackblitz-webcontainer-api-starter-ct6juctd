import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { Logo } from '@/components/Logo';
import { SiteFooter } from '@/components/SiteFooter';
import { LangSwitcher } from '@/components/LangSwitcher';
import './globals.css';

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
});

export const metadata: Metadata = {
  title: 'Nation Data Center — Hébergement souverain & responsable',
  description:
    'Un réseau de data centers français, souverains et écoresponsables, au service des enjeux critiques des entreprises.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jost.variable}>
      <body>
        <header className="site-header">
          <div className="container inner">
            <a href="/"><Logo /></a>
            <nav className="nav">
              <a href="/datacenters">Notre réseau</a>
              <a href="/#services">Nos services</a>
              <a href="/">Qui sommes-nous</a>
              <a href="/#contact">Contact</a>
              <LangSwitcher />
            </nav>
          </div>
        </header>

        {children}

        <SiteFooter />
      </body>
    </html>
  );
}
