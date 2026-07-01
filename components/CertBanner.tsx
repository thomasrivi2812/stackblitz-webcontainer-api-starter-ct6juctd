// Bandeau « Certifications & Groupe Altarea » : remplace l'ancienne section Crédibilité sur la home.
// Textes/liens éditables depuis WordPress (champs `homeFields.certBanner*`), avec
// repli sur les traductions codées (messages/*.json) si le champ WP est vide.
import { AltareaMark } from '@/components/AltareaLogo';
import type { HomeContent, WpLocale } from '@/lib/wordpress';

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

export async function CertBanner({ locale = 'fr', wp }: { locale?: WpLocale; wp?: HomeContent | null }) {
  const t = (await import(`../messages/${locale}.json`)).default.certBanner as Record<string, string>;

  const certTitle = wp?.certBannerCertTitle || t.certTitle;
  const certSub = wp?.certBannerCertSub || t.certSub;
  const certUrl = wp?.certBannerCertUrl || '/certifications';
  const altareaTitle = wp?.certBannerAltareaTitle || t.altareaTitle;
  const altareaSub = wp?.certBannerAltareaSub || t.altareaSub;
  const altareaUrl = wp?.certBannerAltareaUrl || '/groupe';

  return (
    <section className="section cert-banner-section" id="certifications-groupe">
      <div className="container">
        <div className="cert-banner-grid">
          <a className="cert-banner-card" href={certUrl}>
            <span className="cert-banner-ico"><ShieldIcon /></span>
            <span className="cert-banner-text">
              <strong>{certTitle}</strong>
              <span>{certSub}</span>
            </span>
            <span className="cert-banner-arrow"><ArrowIcon /></span>
          </a>
          <a className="cert-banner-card altarea" href={altareaUrl}>
            <span className="cert-banner-ico"><AltareaMark size={26} /></span>
            <span className="cert-banner-text">
              <strong>{altareaTitle}</strong>
              <span>{altareaSub}</span>
            </span>
            <span className="cert-banner-arrow"><ArrowIcon /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
