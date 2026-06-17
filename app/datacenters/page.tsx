import { getDatacenters, statutInfo } from '@/lib/wordpress';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notre réseau de data centers en France',
  description:
    'Découvrez les data centers Nation Data Center : Rennes, Rouen, Vélizy… Un réseau souverain de 15 sites prévus d’ici 2030, conçus Tier III et écoresponsables.',
  alternates: { canonical: '/datacenters' },
};

export const dynamic = 'force-dynamic';

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default async function DatacentersPage() {
  const datacenters = await getDatacenters();
  const isLive = Boolean(process.env.WORDPRESS_GRAPHQL_ENDPOINT);

  return (
    <main>
      <div className={`data-banner ${isLive ? 'live' : 'sample'}`}>
        <div className="container">
          {isLive
            ? '● Données en direct depuis votre endpoint WordPress GraphQL.'
            : '○ Données d’exemple. Renseignez WORDPRESS_GRAPHQL_ENDPOINT (.env.local) pour brancher vos vraies données.'}
        </div>
      </div>

      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">Le réseau NDC</span>
          <h2 className="fil-rouge">Nos data centers</h2>
          <p>
            Un réseau 100 % implanté sur le territoire national, à l’horizon de 15 sites en 2030.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="dc-grid">
            {datacenters.map((dc) => {
              const { key, label } = statutInfo(dc.datacenterFields.statut);
              return (
                <a className="dc-card" key={dc.slug} href={`/datacenters/${dc.slug}`}>
                  <span className={`badge ${key}`}>
                    <span className="dot" />
                    {label}
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
