import { getDatacenters, getDatacentersVisit, statutInfo, toMapPoints, type WpLocale } from '@/lib/wordpress';
import { loadMessages } from '@/lib/messages';
import { DcTileImage } from '@/components/DcTileImage';
import { NetworkMap } from '@/components/NetworkMap';
import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) → rendu
// dynamique, gere dans le layout (Next 16 exige ici une valeur litterale).
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: WpLocale }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = (await loadMessages(locale)).meta as Record<string, string>;
  return {
    title: m.datacentersTitle,
    description: m.datacentersDesc,
    alternates: alternatesFor(locale, '/datacenters'),
  };
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export default async function DatacentersPage({ params }: { params: Promise<{ locale: WpLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = (await loadMessages(locale)).datacenters as Record<string, string>;
  // En-tête et bandeau visite éditables dans WP (page « datacenters ») ;
  // chaque champ vide retombe sur le texte par défaut du site.
  const [datacenters, visit] = await Promise.all([getDatacenters(locale), getDatacentersVisit(locale)]);

  const statutLabel = (k: string) =>
    t[`statut${k.charAt(0).toUpperCase()}${k.slice(1)}`] || t.statutInconnu;
  const prefix = locale === 'en' ? '/en' : '';
  // Photo du bandeau visite : première fiche qui a une image mise en avant.
  const visitPhoto = datacenters.find((d) => d.featuredImage?.node?.sourceUrl) ?? datacenters[0];

  return (
    <main>
      {/* En-tête + liste des sites en regard de la carte du réseau */}
      <section className="section dc-net-section">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{visit?.eyebrow || t.eyebrow}</span>
              <h1 className="section-title">{visit?.titre || t.h2}</h1>
              <p className="section-sub">{visit?.intro || t.intro}</p>
            </div>
            <a className="link-arrow" href="#visite">
              {visit?.visitCta || t.visitCta}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="dc-net">
            <ul className="dc-net-list">
              {datacenters.map((dc) => {
                const { key } = statutInfo(dc.datacenterFields.statut);
                const f = dc.datacenterFields;
                return (
                  <li key={dc.slug}>
                    <a className="dc-net-row" href={`${prefix}/datacenters/${dc.slug}`}>
                      <div className="dc-net-row-top">
                        <span className={`dc-chip ${key}`}>
                          <span className="bar" />
                          {statutLabel(key)}
                        </span>
                        {f.ville && <span className="dc-net-ville">{f.ville}</span>}
                      </div>
                      <div className="dc-net-row-name">
                        <h2>{dc.title}</h2>
                        <span className="dc-net-arrow"><ArrowIcon /></span>
                      </div>
                      {(f.puissance || f.region) && (
                        <ul className="dc-net-specs">
                          {f.puissance && (
                            <li><span>{t.specPuissance || 'Puissance'}</span><strong>{f.puissance}</strong></li>
                          )}
                          {f.region && (
                            <li><span>{t.specRegion || 'Région'}</span><strong>{f.region}</strong></li>
                          )}
                        </ul>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="dc-net-map">
              <NetworkMap points={toMapPoints(datacenters)} labels />
            </div>
          </div>
        </div>
      </section>

      {/* Cartes photo des sites, sous le bloc liste + carte */}
      <section className="section dc-cards-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="dc-grid">
            {datacenters.map((dc) => {
              const { key } = statutInfo(dc.datacenterFields.statut);
              return (
                <a className="dc-card" key={dc.slug} href={`${prefix}/datacenters/${dc.slug}`}>
                  <div className="dc-card-media">
                    <DcTileImage slug={dc.slug} title={dc.title} imageUrl={dc.featuredImage?.node?.sourceUrl} />
                  </div>
                  <span className={`badge ${key}`}>
                    <span className="dot" />
                    {statutLabel(key)}
                  </span>
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
                    <span className="dc-card-more">
                      {t.readMore}
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bandeau pleine largeur : photo d'un site + demande de visite ── */}
      <section className="dc-visit-band" id="visite">
        <div className="dc-visit-media">
          {visitPhoto && (
            <DcTileImage slug={visitPhoto.slug} title={visitPhoto.title} imageUrl={visitPhoto.featuredImage?.node?.sourceUrl} />
          )}
        </div>
        <div className="dc-visit-body">
          <span className="eyebrow">{visit?.visitEyebrow || t.visitEyebrow}</span>
          <h3>{visit?.visitTitle || t.visitTitle}</h3>
          <p>{visit?.visitText || t.visitText}</p>
          <a className="btn btn-primary" href={`${prefix}/contact`}>
            {visit?.visitCta || t.visitCta}
          </a>
        </div>
      </section>
    </main>
  );
}
