import { ServicesCarousel } from '@/components/ServicesCarousel';
import { DcTileImage } from '@/components/DcTileImage';
import { KpiBand } from '@/components/KpiBand';
import { CertBanner } from '@/components/CertBanner';
import { FaqSection } from '@/components/FaqSection';
import { NetworkMap } from '@/components/NetworkMap';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.homeTitle,
    description: m.homeDesc,
    alternates: { canonical: '/', languages: { fr: '/', en: '/en' } },
  };
}

import {
  getDatacenters,
  getRecentPosts,
  getServices,
  getHome,
  homeServices,
  toMapPoints,
  statutInfo,
  networkKpis,
  stripHtml,
  type WpLocale,
} from '@/lib/wordpress';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/* ------------------------------- Icônes ------------------------------- */
function Icon({ name }: { name: string }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'building':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'network':
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="18" r="2" />
          <circle cx="19" cy="18" r="2" />
          <path d="M12 7v4M12 11l-5 5M12 11l5 5" />
        </svg>
      );
    case 'services':
      return (
        <svg {...common}>
          <path d="M14 7l3-3 3 3-3 3M3 21l6-6M9 11l4 4M5 13l-2 2 4 4 2-2" />
        </svg>
      );
    case 'decarbon':
      return (
        <svg {...common}>
          <path d="M7 18a4 4 0 010-8 5 5 0 019-2 4 4 0 011 8" />
          <path d="M12 21v-7M9 17l3-3 3 3" />
        </svg>
      );
    case 'sobriete':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 12l3-3" />
        </svg>
      );
    case 'chaleur':
      return (
        <svg {...common}>
          <path d="M12 3c2 3-1 4 0 7M8 7c1 2-1 3 0 5M16 8c1 2-1 3 0 5" />
          <path d="M7 14a5 5 0 0010 0" />
        </svg>
      );
    case 'eau':
      return (
        <svg {...common}>
          <path d="M12 3s6 6.5 6 10a6 6 0 01-12 0c0-3.5 6-10 6-10z" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function Home({ params: { locale } }: { params: { locale: WpLocale } }) {
  // Dictionnaire de la page chargé par import direct (compatible WebContainer).
  const t = (await import(`../../messages/${locale}.json`)).default.home as Record<string, string>;
  const wp = await getHome(locale);

  const datacenters = await getDatacenters(locale);
  const points = toMapPoints(datacenters);
  const preview = datacenters.slice(0, 3);
  const posts = await getRecentPosts(locale);
  const kpis = wp?.kpis?.length ? wp.kpis : networkKpis(datacenters);
  const services = await getServices(locale);
  const carouselServices = homeServices(services, 5);
  const heroImage = '/hero-datacenter.jpg';
  const fmtDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch { return ''; }
  };

  const engagements = [
    { icon: 'decarbon', titre: t.engDecarbonTitre, desc: t.engDecarbonDesc },
    { icon: 'sobriete', titre: t.engSobrieteTitre, desc: t.engSobrieteDesc },
    { icon: 'chaleur', titre: t.engChaleurTitre, desc: t.engChaleurDesc },
    { icon: 'eau', titre: t.engEauTitre, desc: t.engEauDesc },
  ];

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-text">
            <span className="eyebrow"><span className="eyebrow-dot" />{wp?.heroEyebrow || t.heroEyebrow}</span>
            <h1 className="hero-title">
              {wp?.heroTitle ?? <>{t.heroTitle1} <span className="title-accent">{t.heroTitleAccent}</span>.</>}
            </h1>
            <p className="hero-lead">{wp?.heroLead || t.heroLead}</p>
            <div className="cta-row">
              <a className="btn-v2 btn-v2-primary" href={wp?.heroCtaPrimaryUrl || "/datacenters"}>
                {wp?.heroCtaPrimaryLabel || t.heroCtaPrimary}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a className="btn-v2 btn-v2-ghost" href={wp?.heroCtaSecondaryUrl || "/contact"}>{wp?.heroCtaSecondaryLabel || t.heroCtaSecondary}</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-frame">
              <img className="hero-img" src={wp?.heroImage?.sourceUrl || heroImage} alt="Data center Nation Data Center" />
              <div className="hero-frame-corner tl" aria-hidden="true" />
              <div className="hero-frame-corner br" aria-hidden="true" />
            </div>
            <div className="hero-caption">
              <span className="hero-cap-dot" aria-hidden="true" />
              <div>
                <strong>{wp?.heroCaptionTitle || t.heroCaptionTitle}</strong>
                <span>3 MW · PUE&nbsp;1,2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANDEAU KPI RÉSEAU — ANIMÉ */}
      <KpiBand kpis={kpis} />

      {/* NOS DATA CENTERS */}
      <section className="section section-alt" id="datacenters">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{t.dcEyebrow}</span>
              <h2 className="section-title">{t.dcTitle}</h2>
              <p className="section-sub">{t.dcSub}</p>
            </div>
            <a className="link-arrow" href="/datacenters">
              {t.dcSeeAll}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="dc-grid-v2">
            {preview.map((dc) => {
              const { key, label } = statutInfo(dc.datacenterFields.statut);
              return (
                <a className="dc-tile" key={dc.slug} href={`/datacenters/${dc.slug}`}>
                  <div className="dc-tile-media">
                    <DcTileImage slug={dc.slug} title={dc.title} imageUrl={dc.featuredImage?.node?.sourceUrl} />
                    <span className={`dc-tile-status ${key}`}><span className="bar" />{label}</span>
                  </div>
                  <div className="dc-tile-body">
                    <div className="dc-tile-top">
                      <h3>{dc.title}</h3>
                      {dc.datacenterFields.ville && <span className="dc-tile-region">{dc.datacenterFields.ville}</span>}
                    </div>
                    <ul className="dc-tile-specs">
                      {dc.datacenterFields.puissance && (
                        <li><span>{t.specPuissance}</span><strong>{dc.datacenterFields.puissance}</strong></li>
                      )}
                      <li><span>{t.specStatut}</span><strong>{label}</strong></li>
                      {dc.datacenterFields.region && (
                        <li><span>{t.specRegion}</span><strong>{dc.datacenterFields.region}</strong></li>
                      )}
                    </ul>
                  </div>
                </a>
              );
            })}
          </div>
          <div className="map-wrap">
            <NetworkMap points={points} />
          </div>
        </div>
      </section>

      {/* NOS SERVICES — carrousel */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{t.servicesEyebrow}</span>
              <h2 className="section-title">{t.servicesTitle1}<br />{t.servicesTitle2}</h2>
            </div>
            <p className="section-sub right">{t.servicesSub}</p>
          </div>

          <ServicesCarousel services={carouselServices} />

          <div className="services-cta">
            <a className="btn-v2 btn-v2-primary" href="/services">
              {t.servicesCta}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* NOS ENGAGEMENTS — Pourquoi choisir NDC */}
      <section className="section" id="engagements">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{t.engEyebrow}</span>
              <h2 className="section-title">{t.engTitle}</h2>
            </div>
            <a className="link-arrow" href="/contact">
              {t.engSeeAll}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="eng-grid-v2">
            {engagements.map((e, i) => (
              <article className="eng-card-v2" key={e.titre}>
                <span className="eng-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="eng-ico"><Icon name={e.icon} /></span>
                <h3>{e.titre}</h3>
                <p>{e.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AMBITION / MISSION / VISION */}
      <section className="amv">
        <div className="amv-glow" aria-hidden="true" />
        <div className="container amv-grid-v2">
          <header className="amv-header">
            <span className="eyebrow"><span className="eyebrow-dot" />{t.amvEyebrow}</span>
            <h2>{t.amvTitle1} <span className="accent">{t.amvTitleAccent}</span><br />{t.amvTitle2}</h2>
            <p>
              {t.amvIntro1}{' '}
              <strong>{t.amvIntroStrong}</strong> {t.amvIntro2}
            </p>
            <div className="amv-figures">
              <div><strong>15</strong><span>{t.amvFig1}</span></div>
              <div><strong>3</strong><span>{t.amvFig2}</span></div>
              <div><strong>16<i>%</i></strong><span>{t.amvFig3}</span></div>
            </div>
          </header>
          <div className="amv-cards">
            <article className="amv-card">
              <span className="amv-card-key">A.</span>
              <div>
                <h3>{t.ambitionTitle}</h3>
                <p>{t.ambitionText}</p>
              </div>
            </article>
            <article className="amv-card">
              <span className="amv-card-key">M.</span>
              <div>
                <h3>{t.missionTitle}</h3>
                <p>{t.missionText}</p>
              </div>
            </article>
            <article className="amv-card">
              <span className="amv-card-key">V.</span>
              <div>
                <h3>{t.visionTitle}</h3>
                <p>{t.visionText}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* BANDEAU CERTIFICATIONS + GROUPE ALTAREA */}
      <CertBanner locale={locale} wp={wp} />

      {/* FAQ */}
      <FaqSection locale={locale} />

      {/* ACTUALITÉS */}
      <section className="section" id="actualites">
        <div className="container">
          <div className="section-head-v2">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{t.newsEyebrow}</span>
              <h2 className="section-title">{t.newsTitle}</h2>
            </div>
            <a className="link-arrow" href="/actualites">
              {t.newsSeeAll}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {posts.length > 0 && (
            <div className="news-grid-v2">
              {/* Article principal (le plus récent) */}
              <a className="news-feat" href={`/actualites/${posts[0].slug}`}>
                <div className="news-feat-media">
                  {posts[0].featuredImage?.node?.sourceUrl
                    ? <img src={posts[0].featuredImage.node.sourceUrl} alt={posts[0].featuredImage.node.altText || posts[0].title} />
                    : <span className="news-ph"><Icon name="building" /></span>}
                </div>
                <div className="news-feat-body">
                  <div className="news-meta-v2">
                    <span className="news-cat">{t.newsCatReseau}</span>
                    <span className="news-date-v2">{fmtDate(posts[0].date)}</span>
                  </div>
                  <h3>{posts[0].title}</h3>
                  <p>{stripHtml(posts[0].excerpt)}</p>
                  <span className="link-arrow small">
                    {t.newsRead}
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>

              {/* Articles secondaires */}
              {posts.length > 1 && (
                <div className="news-side">
                  {posts.slice(1).map((p) => (
                    <a className="news-sm" key={p.slug} href={`/actualites/${p.slug}`}>
                      <div className="news-sm-media">
                        {p.featuredImage?.node?.sourceUrl
                          ? <img src={p.featuredImage.node.sourceUrl} alt={p.featuredImage.node.altText || p.title} />
                          : <span className="news-ph"><Icon name="building" /></span>}
                      </div>
                      <div className="news-sm-body">
                        <div className="news-meta-v2">
                          <span className="news-cat alt">{t.newsCatActu}</span>
                          <span className="news-date-v2">{fmtDate(p.date)}</span>
                        </div>
                        <h3>{p.title}</h3>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
