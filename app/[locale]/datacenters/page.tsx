import { getDatacenters, statutInfo, type WpLocale } from '@/lib/wordpress';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.datacentersTitle,
    description: m.datacentersDesc,
    alternates: { canonical: '/datacenters', languages: { fr: '/datacenters', en: '/en/datacenters' } },
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
  const datacenters = await getDatacenters(locale);
  const isLive = Boolean(process.env.WORDPRESS_GRAPHQL_ENDPOINT);

  const statutLabel = (k: string) =>
    t[`statut${k.charAt(0).toUpperCase()}${k.slice(1)}`] || t.statutInconnu;

  return (
    <main>
      <div className={`data-banner ${isLive ? 'live' : 'sample'}`}>
        <div className="container">
          {isLive ? t.bannerLive : t.bannerSample}
        </div>
      </div>

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
                  <span className={`badge ${key}`}>
                    <span className="dot" />
                    {statutLabel(key)}
                  </span>
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
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
