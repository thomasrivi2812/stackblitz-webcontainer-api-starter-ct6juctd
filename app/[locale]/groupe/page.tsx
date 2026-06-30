import { KpiBand } from '@/components/KpiBand';
import { AltareaLogo, AltareaMark } from '@/components/AltareaLogo';
import { type WpLocale } from '@/lib/wordpress';
import type { Metadata } from 'next';

// Violet de la marque Altarea (accents de la page Groupe).
const ALTAREA = '#6A2C91';

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.groupeTitle,
    description: m.groupeDesc,
    alternates: { canonical: '/groupe', languages: { fr: '/groupe', en: '/en/groupe' } },
  };
}

export default async function GroupePage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.groupe as Record<string, string>;

  const chiffres = [
    { valeur: '2,7', unite: 'Mds€', label: t.kpi1Label },
    { valeur: '68,6', unite: '%', label: t.kpi2Label },
    { valeur: '2 139', unite: '', label: t.kpi3Label },
    { valeur: 'N°1', unite: '', label: t.kpi4Label },
  ];
  const metiers = [
    { titre: t.metier1Title, desc: t.metier1Desc },
    { titre: t.metier2Title, desc: t.metier2Desc },
    { titre: t.metier3Title, desc: t.metier3Desc },
    { titre: t.metier4Title, desc: t.metier4Desc },
  ];
  const engagements = [
    { titre: t.eng1Title, desc: t.eng1Desc },
    { titre: t.eng2Title, desc: t.eng2Desc },
    { titre: t.eng3Title, desc: t.eng3Desc },
    { titre: t.eng4Title, desc: t.eng4Desc },
  ];

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-text">
            <span className="eyebrow" style={{ color: ALTAREA }}>
              <span className="eyebrow-dot" style={{ background: ALTAREA }} />
              {t.heroEyebrow}
              <AltareaMark size={20} className="" />
            </span>
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-lead">{t.heroLead}</p>
            <div className="cta-row">
              <a className="btn-v2 btn-v2-primary" href="https://altarea.com" target="_blank" rel="noopener noreferrer">
                {t.heroCta1}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a className="btn-v2 btn-v2-ghost" href="#engagement">{t.heroCta2}</a>
            </div>
          </div>
          <div className="hero-visual">
            <div
              className="hero-frame"
              style={{ display: 'grid', placeItems: 'center', minHeight: 380, background: 'var(--surface-alt-2, #eef3f9)' }}
            >
              <span style={{ color: 'var(--muted-2, #8593af)', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6, textAlign: 'center', padding: '0 24px' }}>
                {t.heroVisual}
              </span>
              <div className="hero-frame-corner tl" aria-hidden="true" />
              <div className="hero-frame-corner br" aria-hidden="true" />
            </div>
            <div className="hero-caption">
              <span className="hero-cap-dot" aria-hidden="true" />
              <div>
                <strong>{t.heroCaptionTitle}</strong>
                <span>{t.heroCaptionSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <KpiBand kpis={chiffres} title={t.kpiTitle} meta={t.kpiMeta} />

      {/* NOS MÉTIERS */}
      <section className="section">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{t.metiersEyebrow}</span>
              <h2 className="section-title">{t.metiersTitle}</h2>
            </div>
            <p className="section-sub right">{t.metiersLead}</p>
          </div>
          <div className="eng-grid-v2">
            {metiers.map((m, i) => (
              <article className="eng-card-v2" key={m.titre}>
                <span className="eng-num" style={{ color: ALTAREA }}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{m.titre}</h3>
                <p>{m.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT BAS CARBONE */}
      <section className="section section-alt" id="engagement">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{t.engEyebrow}</span>
              <h2 className="section-title">{t.engTitle}</h2>
              <p className="section-sub">{t.engLead}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'flex-end', minWidth: 180 }}>
              <strong style={{ fontSize: 38, lineHeight: 1, color: ALTAREA, fontWeight: 700 }}>{t.engStatValue}</strong>
              <span style={{ fontSize: 14, color: 'var(--muted, #5d6b85)' }}>{t.engStatLabel}</span>
            </div>
          </div>
          <div className="eng-grid-v2">
            {engagements.map((e, i) => (
              <article className="eng-card-v2" key={e.titre}>
                <span className="eng-num" style={{ color: ALTAREA }}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{e.titre}</h3>
                <p>{e.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL — Groupe Altarea */}
      <section className="op-final" style={{ ['--op-accent' as string]: ALTAREA } as React.CSSProperties}>
        <div className="container">
          <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 22, color: '#fff' }}>
            <AltareaLogo height={50} />
          </span>
          <h2 className="fil-rouge">{t.finalTitle}</h2>
          <p className="op-final-lead">{t.finalLead}</p>
          <div className="op-cta-row">
            <a
              className="op-btn-primary"
              href="https://altarea.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#fff', color: ALTAREA }}
            >
              {t.finalCta} →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
