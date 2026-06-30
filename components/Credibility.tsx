// Section « Crédibilité » : certifications exigeantes + endossement Groupe Altarea.
import type { WpLocale } from '@/lib/wordpress';

const certifications = [
  { code: 'ISO 27001', labelKey: 'labelIso27001', statut: 'visee' },
  { code: 'HDS', labelKey: 'labelHds', statut: 'visee' },
  { code: 'ISO 14001', labelKey: 'labelIso14001', statut: 'visee' },
  { code: 'ISO 50001', labelKey: 'labelIso50001', statut: 'visee' },
  { code: 'EN 50600', labelKey: 'labelEn50600', statut: 'conforme' },
  { code: 'Code of Conduct', labelKey: 'labelCoc', statut: 'visee' },
];

export async function Credibility({ locale = 'fr' }: { locale?: WpLocale }) {
  const t = (await import(`../messages/${locale}.json`)).default.credibility as Record<string, string>;
  const statutLabel = (k: string) => (k === 'conforme' ? t.statutConforme : t.statutVisee);

  return (
    <section className="section section-alt" id="credibilite">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="fil-rouge">{t.title}</h2>
          <p>{t.intro}</p>
        </div>

        <div className="cred-grid">
          {certifications.map((c) => (
            <div className="cert-card" key={c.code}>
              <div className="cert-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" /><path d="M8.5 12.5L7 21l5-3 5 3-1.5-8.5" />
                </svg>
              </div>
              <div className="cert-main">
                <strong>{c.code}</strong>
                <span>{t[c.labelKey]}</span>
              </div>
              <span className={`cert-statut ${c.statut === 'conforme' ? 'ok' : 'wip'}`}>{statutLabel(c.statut)}</span>
            </div>
          ))}
        </div>

        {/* Endossement Groupe Altarea */}
        <div className="altarea-card">
          <div className="altarea-logo" aria-label="Groupe Altarea">
            <span className="altarea-mark">ALTAREA</span>
          </div>
          <div className="altarea-text">
            <h3>{t.altareaTitle}</h3>
            <p>{t.altareaText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
