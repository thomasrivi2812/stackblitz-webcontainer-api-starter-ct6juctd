import { getServices } from '@/lib/wordpress';
import { ServiceMedia } from '@/components/ServiceMedia';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos services',
  description:
    'Les services Nation Data Center : proximité, haute densité & IA, colocation, accompagnement personnalisé, espaces bureau, connectivité carrier-neutral, espaces modulables et continuité de service.',
  alternates: { canonical: '/services' },
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main>
      <section className="section" style={{ paddingBottom: 12 }}>
        <div className="container section-head">
          <span className="eyebrow"><span className="eyebrow-dot" />Nos services</span>
          <h1 className="fil-rouge">Une infrastructure et des équipes à votre service</h1>
          <p>
            De l’hébergement à l’exploitation quotidienne, NDC couvre l’ensemble de vos besoins —
            avec un réseau de data centers souverains et des équipes de proximité.
          </p>
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
                <span className="eyebrow"><span className="eyebrow-dot" />{s.accroche || 'Service'}</span>
                <h2>{s.titre}</h2>
                <p>{s.description}</p>
                {s.benefice && (
                  <div className="svc-benefit">
                    <span className="svc-benefit-bar" />
                    <span><em>Bénéfice client</em>{s.benefice}</span>
                  </div>
                )}
                <a className="btn-v2 btn-v2-ghost svc-row-btn" href={s.lienUrl || '/contact'}>
                  {s.lienLabel || 'En savoir plus'}
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
              <span className="eyebrow"><span className="eyebrow-dot" />Parlons-en</span>
              <h2 className="fil-rouge">Un besoin spécifique ?</h2>
              <p>
                Nos équipes étudient votre projet d’hébergement et construisent un dispositif sur
                mesure, de la colocation à l’exploitation de proximité.
              </p>
            </div>
            <div className="souv-cta">
              <a className="btn-v2 btn-v2-primary" href="/contact">
                Contactez nos équipes
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
