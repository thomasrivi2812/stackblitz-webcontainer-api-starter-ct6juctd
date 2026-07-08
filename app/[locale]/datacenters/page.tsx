import { getDatacenters, getDatacentersVisit, statutInfo, toMapPoints, type WpLocale } from '@/lib/wordpress';
import { DcTileImage } from '@/components/DcTileImage';
import { NetworkMap } from '@/components/NetworkMap';
import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.datacentersTitle,
    description: m.datacentersDesc,
    alternates: alternatesFor(locale, '/datacenters'),
  };
}


function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default async function DatacentersPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.datacenters as Record<string, string>;
  // Bandeau visite éditable dans WP (page « datacenters ») ; chaque champ
  // vide retombe sur le texte par défaut du site. Fetch en parallèle.
  const [datacenters, visit] = await Promise.all([getDatacenters(locale), getDatacentersVisit(locale)]);

  const statutLabel = (k: string) =>
    t[`statut${k.charAt(0).toUpperCase()}${k.slice(1)}`] || t.statutInconnu;

  return (
    <main>
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="fil-rouge">{t.h2}</h2>
          <p>{t.intro}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="dc-grid">
            {datacenters.map((dc) => {
              const { key } = statutInfo(dc.datacenterFields.statut);
              return (
                <a className="dc-card" key={dc.slug} href={`/datacenters/${dc.slug}`}>
                  <div className="dc-card-media">
                    <DcTileImage slug={dc.slug} title={dc.title} imageUrl={dc.featuredImage?.node?.sourceUrl} />
                    <span className={`badge ${key}`}>
                      <span className="dot" />
                      {statutLabel(key)}
                    </span>
                  </div>
                  <div className="dc-card-body">
                    {dc.datacenterFields.ville && (
                      <div className="city">
                        <PinIcon />
                        {dc.datacenterFields.ville}
                      </div>
                    )}
                    <h3>{dc.title}</h3>
                    {dc.datacenterFields.accroche && (
                      <p className="accroche">{dc.datacenterFields.accroche}</p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bandeau pleine largeur : carte du réseau + demande de visite ── */}
      <section className="dc-visit-band">
        <div className="dc-visit-map">
          <NetworkMap points={toMapPoints(datacenters)} />
        </div>
        <div className="dc-visit-body">
          <span className="eyebrow">{visit?.visitEyebrow || t.visitEyebrow}</span>
          <h3>{visit?.visitTitle || t.visitTitle}</h3>
          <p>{visit?.visitText || t.visitText}</p>
          <a
            className="btn-v2 btn-v2-primary"
            href={locale === 'en' ? '/en/contact' : '/contact'}
          >
            {visit?.visitCta || t.visitCta}
          </a>
        </div>
      </section>
    </main>
  );
}
