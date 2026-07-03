import { getServices, type WpLocale } from '@/lib/wordpress';
import { ServiceMedia } from '@/components/ServiceMedia';
import type { Metadata } from 'next';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.servicesTitle,
    description: m.servicesDesc,
    alternates: { canonical: '/services', languages: { fr: '/services', en: '/en/services' } },
  };
}


export default async function ServicesPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.services as Record<string, string>;
  const services = await getServices(locale);

  return (
    <main>
      <section className="section" style={{ paddingBottom: 12 }}>
        <div className="container section-head">
          <span className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</span>
          <h1 className="fil-rouge">{t.h1}</h1>
          <p>{t.intro}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 12 }}>
        <div className="container svc-page">
          {services.map((s, idx) => (
            <article
              className={`svc-row${idx % 2 === 1 ? ' reverse' : ''}`}
              key={s.slug || idx}
              id={s.slug || undefined}
            >
              <div className="svc-row-media">
                <ServiceMedia service={s} />
              </div>
              <div className="svc-row-text">
                <span className="eyebrow"><span className="eyebrow-dot" />{s.accroche || t.fallbackAccroche}</span>
                <h2>{s.titre}</h2>
                <p>{s.description}</p>
                {s.benefice && (
                  <div className="svc-benefit">
                    <span className="svc-benefit-bar" />
                    <span><em>{t.benefice}</em>{s.benefice}</span>
                  </div>
                )}
                <a className="btn-v2 btn-v2-ghost svc-row-btn" href={s.lienUrl || '/contact'}>
                  {s.lienLabel || t.fallbackLink}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="section section-alt">
        <div className="container">
          <div className="souv-card">
            <div className="souv-text">
              <span className="eyebrow"><span className="eyebrow-dot" />{t.ctaEyebrow}</span>
              <h2 className="fil-rouge">{t.ctaTitle}</h2>
              <p>{t.ctaText}</p>
            </div>
            <div className="souv-cta">
              <a className="btn-v2 btn-v2-primary" href="/contact">
                {t.ctaButton}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
