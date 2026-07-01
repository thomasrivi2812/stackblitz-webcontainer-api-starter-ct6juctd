// Bandeau « Certifications & Groupe Altarea » : remplace l'ancienne section Crédibilité sur la home.
import { AltareaMark } from '@/components/AltareaLogo';
import type { WpLocale } from '@/lib/wordpress';

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export async function CertBanner({ locale = 'fr' }: { locale?: WpLocale }) {
  const t = (await import(`../messages/${locale}.json`)).default.certBanner as Record<string, string>;

  return (
    <section className="section cert-banner-section" id="certifications-groupe">
      <div className="container">
        <div className="cert-banner-grid">
          <a className="cert-banner-card" href="/certifications">
            <span className="cert-banner-ico"><ShieldIcon /></span>
            <span className="cert-banner-text">
              <strong>{t.certTitle}</strong>
              <span>{t.certSub}</span>
            </span>
            <span className="cert-banner-arrow"><ArrowIcon /></span>
          </a>
          <a className="cert-banner-card altarea" href="/groupe">
            <span className="cert-banner-ico"><AltareaMark size={26} /></span>
            <span className="cert-banner-text">
              <strong>{t.altareaTitle}</strong>
              <span>{t.altareaSub}</span>
            </span>
            <span className="cert-banner-arrow"><ArrowIcon /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
