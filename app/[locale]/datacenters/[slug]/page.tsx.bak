import { getDatacenter, getDatacenters, statutInfo, toMapPoints, type WpLocale } from '@/lib/wordpress';
import { notFound, redirect } from 'next/navigation';
import { LocationMap } from '@/components/LocationMap';
import { DcPhoto } from '@/components/DcPhoto';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, localePath } from '@/lib/seo';
import { Link } from '@/i18n/routing';
import { BrochureButton } from '@/components/BrochureButton';
import type { Metadata } from 'next';


// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params }: { params: { locale: WpLocale; slug: string } }): Promise<Metadata> {
  const dc = await getDatacenter(params.slug, params.locale);
  const t = (await import(`../../../../messages/${params.locale}.json`)).default.datacenters as Record<string, string>;
  if (!dc) return { title: t.notFound };
  const f = dc.datacenterFields;
  const ville = f.ville ? ` à ${f.ville}` : '';
  const desc = f.accroche
    || `Data center NDC${ville} : hébergement souverain, conception Tier III et écoresponsable. Découvrez ses caractéristiques techniques.`;
  // hreflang avec les vrais slugs par langue (Polylang) : l'alternative n'est
  // déclarée que si la traduction existe.
  const cur = params.locale;
  const otherLang = cur === 'fr' ? 'EN' : 'FR';
  const otherSlug = dc.translations?.find(
    (tr) => (tr?.language?.code ?? '').toUpperCase() === otherLang,
  )?.slug ?? null;
  const frSlug = cur === 'fr' ? dc.slug : otherSlug;
  const enSlug = cur === 'en' ? dc.slug : otherSlug;
  const languages: Record<string, string> = {};
  if (frSlug) {
    languages.fr = `/datacenters/${frSlug}`;
    languages['x-default'] = `/datacenters/${frSlug}`;
  }
  if (enSlug) languages.en = `/en/datacenters/${enSlug}`;
  const canonical = localePath(cur, `/datacenters/${dc.slug}`);

  return {
    title: `${dc.title}${ville ? ' — ' + f.ville : ''}`,
    description: desc,
    alternates: { canonical, languages },
    openGraph: {
      title: `${dc.title}${ville ? ' — ' + f.ville : ''}`,
      description: desc,
      type: 'article',
      url: canonical,
      ...(dc.featuredImage?.node?.sourceUrl
        ? { images: [{ url: dc.featuredImage.node.sourceUrl, alt: dc.featuredImage.node.altText || dc.title }] }
        : {}),
    },
  };
}

export async function generateStaticParams() {
  const dcs = await getDatacenters();
  return dcs.map((d) => ({ slug: d.slug }));
}

export default async function DatacenterDetail({ params }: { params: { locale: WpLocale; slug: string } }) {
  const t = (await import(`../../../../messages/${params.locale}.json`)).default.datacenters as Record<string, string>;
  const dc = await getDatacenter(params.slug, params.locale);
  if (!dc) notFound();

  // Slug résolu ≠ slug demandé : l'URL portait le slug d'une autre langue
  // (switch FR/EN — chaque traduction Polylang a son slug). On redirige vers
  // l'URL canonique de la traduction.
  if (dc.slug && dc.slug !== params.slug) {
    redirect(params.locale === 'fr' ? `/datacenters/${dc.slug}` : `/${params.locale}/datacenters/${dc.slug}`);
  }

  const f = dc.datacenterFields;
  const { key } = statutInfo(f.statut);
  const statutLabel = t[`statut${key.charAt(0).toUpperCase()}${key.slice(1)}`] || t.statutInconnu;
  const caracLabel = (cat: string) =>
    t[`carac${cat.charAt(0).toUpperCase()}${cat.slice(1)}`] || cat;
  const kpis = f.kpis ?? [];
  const caracs = f.caracteristiques ?? [];
  const benefices = f.benefices ?? [];
  // Galerie du bas de page : lignes vides du repeater filtrées.
  const photos = (f.photos ?? [])
    .map((p) => p?.photo?.node)
    .filter((n): n is { sourceUrl: string; altText: string } => !!n?.sourceUrl);
  const mapPoint = toMapPoints([dc])[0]; // présent seulement si lat/lng renseignés
  const pageUrl = `${SITE_URL}${localePath(params.locale, `/datacenters/${dc.slug}`)}`;

  // Barre de stats du hero : puissance (si renseignée) + KPIs WP, plafonnée à
  // 4 tuiles. La puissance « 7 MW IT » est scindée en valeur + unité.
  const heroStats: { label: string; valeur: string; unite: string }[] = [];
  if (f.puissance) {
    const [val, ...rest] = f.puissance.trim().split(/\s+/);
    heroStats.push({ label: t.puissanceLabel, valeur: val, unite: rest.join(' ') });
  }
  for (const k of kpis) {
    if (heroStats.length >= 4) break;
    heroStats.push({ label: k.label, valeur: k.valeur, unite: k.unite });
  }

  return (
    <main>
      {/* Données structurées : lieu physique + fil d'Ariane. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Place',
          name: dc.title,
          url: pageUrl,
          ...(f.accroche ? { description: f.accroche } : {}),
          ...(dc.featuredImage?.node?.sourceUrl ? { photo: dc.featuredImage.node.sourceUrl } : {}),
          ...(f.ville
            ? { address: { '@type': 'PostalAddress', addressLocality: f.ville, addressCountry: 'FR' } }
            : {}),
          ...(mapPoint
            ? { geo: { '@type': 'GeoCoordinates', latitude: mapPoint.lat, longitude: mapPoint.lng } }
            : {}),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Nation Data Center', item: `${SITE_URL}${localePath(params.locale, '/')}` },
            { '@type': 'ListItem', position: 2, name: t.back, item: `${SITE_URL}${localePath(params.locale, '/datacenters')}` },
            { '@type': 'ListItem', position: 3, name: dc.title, item: pageUrl },
          ],
        }}
      />
      {/* HERO immersif : image plein cadre + textes en surimpression + stats */}
      <section className="dc-hero dc-hero-cover">
        <div className="dc-hero-bg">
          <DcPhoto slug={dc.slug} title={dc.title} imageUrl={dc.featuredImage?.node?.sourceUrl} />
        </div>
        <div className="container dc-hero-inner">
          <div className="dc-hero-top">
            <Link className="back-link" href="/datacenters">{t.back}</Link>
            <span className={`badge ${key}`}>
              <span className="dot" />
              {statutLabel}
            </span>
          </div>
          <h1 className="fil-rouge">{dc.title}</h1>
          {f.ville && (
            <p className="dc-city">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {f.ville}{f.region ? ` — ${f.region}` : ''}
            </p>
          )}
          {f.accroche && <p className="dc-accroche">{f.accroche}</p>}
          <div className="dc-hero-cta">
            <Link className="btn btn-primary" href="/offres">{t.ctaOffres}</Link>
            <Link className="btn btn-ghost" href="/contact">{t.ctaVisite}</Link>
          </div>

          {heroStats.length > 0 && (
            <div className="dc-hero-stats">
              {heroStats.map((s, i) => (
                <div className="dc-hero-stat" key={i}>
                  <span className="dc-hero-stat-label">{s.label}</span>
                  <span className="dc-hero-stat-val">
                    {s.valeur}
                    {s.unite && <span className="dc-hero-stat-unit">{s.unite}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CORPS : présentation + caractéristiques / aside bénéfices + carte */}
      <section className="section">
        <div className="container dc-body">
          <div>
            {f.description && (
              <>
                <h2 className="fil-rouge">{t.presentation}</h2>
                <p className="dc-desc">{f.description}</p>
              </>
            )}

            {caracs.length > 0 && (
              <>
                <h2 className="fil-rouge" style={{ marginTop: 48 }}>{t.caracTitle}</h2>
                <div className="carac-list">
                  {caracs.map((c, i) => (
                    <div className="carac" key={i}>
                      <span className="carac-cat" title={caracLabel(c.categorie)} aria-label={caracLabel(c.categorie)} style={{ display: 'inline-grid', placeItems: 'center', padding: 8 }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                      </span>
                      <div className="carac-main">
                        <strong>{c.intitule}</strong>
                        <p>{c.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="dc-aside">
            {/* Petite carte de localisation */}
            {mapPoint && (
              <div className="dc-aside-block">
                <h3>{t.localisation}</h3>
                <LocationMap point={mapPoint} />
                {f.ville && <p className="dc-aside-loc">◍ {f.ville}</p>}
              </div>
            )}

            {/* Bénéfices */}
            {benefices.length > 0 && (
              <div className="dc-aside-block">
                <h3>{t.benefices}</h3>
                <ul className="dc-benefits">
                  {benefices.map((b, i) => (
                    <li key={i}>
                      <strong>{b.titre}</strong>
                      <span>{b.texte}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Plaquette du site à télécharger (repli : brochure NDC générale) */}
            <BrochureButton className="btn btn-ghost dc-aside-cta" pdfUrl={f.document?.url ?? null} label={t.plaquette} ns="plaquette" downloadName={f.document?.titre || 'Plaquette-NDC'} />
            <Link className="btn btn-primary dc-aside-cta" href="/offres" style={{ marginTop: 14 }}>{t.ctaOffres}</Link>
          </aside>
        </div>
      </section>

      {/* GALERIE PHOTOS — remplie dans WP (fiche datacenter → Galerie photos) */}
      {photos.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2 className="fil-rouge" style={{ marginBottom: 30 }}>{t.galerieTitle}</h2>
            <div className="dc-gallery">
              {photos.map((p, i) => (
                <figure className="dc-gallery-item" key={i}>
                  <img src={p.sourceUrl} alt={p.altText || `${dc.title} — ${i + 1}`} loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
