import { KpiBand } from '@/components/KpiBand';
import { AltareaLogo, AltareaMark } from '@/components/AltareaLogo';
import { getGroupe, type WpLocale } from '@/lib/wordpress';
import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

// Violet de la marque Altarea (accents de la page Groupe).
const ALTAREA = '#6A2C91';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.groupeTitle,
    description: m.groupeDesc,
    alternates: alternatesFor(locale, '/groupe'),
  };
}

// Contenu éditable dans WP (page « groupe ») → pas de cache statique.

export default async function GroupePage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.groupe as Record<string, string>;
  // Page 100 % éditable dans WordPress (champs `groupeFields` de la page
  // « groupe ») : chaque texte lit d'abord WP, puis retombe sur messages/*.json.
  const wp = await getGroupe(locale);

  const chiffres = wp?.chiffres?.length
    ? wp.chiffres
    : [
        { valeur: '2,7', unite: 'Mds€', label: t.kpi1Label },
        { valeur: '68,6', unite: '%', label: t.kpi2Label },
        { valeur: '2 139', unite: '', label: t.kpi3Label },
        { valeur: 'N°1', unite: '', label: t.kpi4Label },
      ];
  const metiers = wp?.metiers?.length
    ? wp.metiers.map((m) => ({ titre: m.titre, desc: m.desc, image: m.image ?? null }))
    : [
        { titre: t.metier1Title, desc: t.metier1Desc, image: null },
        { titre: t.metier2Title, desc: t.metier2Desc, image: null },
        { titre: t.metier3Title, desc: t.metier3Desc, image: null },
        { titre: t.metier4Title, desc: t.metier4Desc, image: null },
      ];
  const engagements = wp?.engagements?.length
    ? wp.engagements.map((e) => ({ titre: e.titre, desc: e.desc }))
    : [
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
              {wp?.heroEyebrow || t.heroEyebrow}
              <AltareaMark size={20} className="" />
            </span>
            <h1 className="hero-title">{wp?.heroTitle || t.heroTitle}</h1>
            <p className="hero-lead">{wp?.heroLead || t.heroLead}</p>
            <div className="cta-row">
              <a
                className="btn btn-primary"
                href={wp?.heroCta1Url || 'https://altarea.com'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {wp?.heroCta1Label || t.heroCta1}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a className="btn btn-ghost" href={wp?.heroCta2Url || '#engagement'}>
                {wp?.heroCta2Label || t.heroCta2}
              </a>
            </div>
          </div>
          <div className="hero-visual">
            {wp?.heroImage ? (
              <div className="hero-frame">
                <img className="hero-img" fetchPriority="high" decoding="async" src={wp.heroImage.sourceUrl} alt={wp.heroImage.altText || (wp?.heroTitle || t.heroTitle)} />
                <div className="hero-frame-corner tl" aria-hidden="true" />
                <div className="hero-frame-corner br" aria-hidden="true" />
              </div>
            ) : (
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
            )}
            <div className="hero-caption">
              <span className="hero-cap-dot" aria-hidden="true" />
              <div>
                <strong>{wp?.heroCaptionTitle || t.heroCaptionTitle}</strong>
                <span>{wp?.heroCaptionSub || t.heroCaptionSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <KpiBand kpis={chiffres} title={wp?.kpiTitle || t.kpiTitle} meta={wp?.kpiMeta || t.kpiMeta} />

      {/* NOS MÉTIERS */}
      <section className="section">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{wp?.metiersEyebrow || t.metiersEyebrow}</span>
              <h2 className="section-title">{wp?.metiersTitle || t.metiersTitle}</h2>
            </div>
            <p className="section-sub right">{wp?.metiersLead || t.metiersLead}</p>
          </div>
          <div className="eng-grid-v2">
            {metiers.map((m, i) => (
              <article className="eng-card-v2" key={m.titre}>
                {m.image && (
                  <div className="eng-card-media">
                    <img src={m.image.sourceUrl} alt={m.image.altText || m.titre} loading="lazy" />
                  </div>
                )}
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
              <span className="eyebrow"><span className="eyebrow-dot" />{wp?.engEyebrow || t.engEyebrow}</span>
              <h2 className="section-title">{wp?.engTitle || t.engTitle}</h2>
              <p className="section-sub">{wp?.engLead || t.engLead}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'flex-end', minWidth: 180 }}>
              <strong style={{ fontSize: 38, lineHeight: 1, color: ALTAREA, fontWeight: 700 }}>{wp?.engStatValue || t.engStatValue}</strong>
              <span style={{ fontSize: 14, color: 'var(--muted, #5d6b85)' }}>{wp?.engStatLabel || t.engStatLabel}</span>
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
          <h2 className="fil-rouge">{wp?.finalTitle || t.finalTitle}</h2>
          <p className="op-final-lead">{wp?.finalLead || t.finalLead}</p>
          <div className="op-cta-row">
            <a
              className="op-btn-primary"
              href={wp?.finalCtaUrl || 'https://altarea.com'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#fff', color: ALTAREA }}
            >
              {wp?.finalCtaLabel || t.finalCta} →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
