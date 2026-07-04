import { getDatacenter, getDatacenters, statutInfo, toMapPoints, type WpLocale } from '@/lib/wordpress';
import { notFound, redirect } from 'next/navigation';
import { LocationMap } from '@/components/LocationMap';
import { DcPhoto } from '@/components/DcPhoto';
import { KpiBand } from '@/components/KpiBand';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, localePath } from '@/lib/seo';
import { Link } from '@/i18n/routing';
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
  const mapPoint = toMapPoints([dc])[0]; // présent seulement si lat/lng renseignés
  const pageUrl = `${SITE_URL}${localePath(params.locale, `/datacenters/${dc.slug}`)}`;

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
      {/* HERO + PHOTO */}
      <section className="dc-hero">
        <div className="container dc-hero-grid">
          <div>
            <Link className="back-link" href="/datacenters">{t.back}</Link>
            <span className={`badge ${key}`} style={{ marginTop: 18 }}>
              <span className="dot" />
              {statutLabel}
            </span>
            <h1 className="fil-rouge">{dc.title}</h1>
            {f.ville && <p className="dc-city">◍ {f.ville}</p>}
            {f.accroche && <p className="dc-accroche">{f.accroche}</p>}
            <div className="dc-hero-cta">
              <Link className="btn btn-primary" href="/offres">{t.ctaOffres}</Link>
              <Link className="btn btn-ghost" href="/contact">{t.ctaVisite}</Link>
            </div>
          </div>
          <DcPhoto slug={dc.slug} title={dc.title} imageUrl={dc.featuredImage?.node?.sourceUrl} />
        </div>
      </section>

      {/* KPI */}
      {kpis.length > 0 && <KpiBand kpis={kpis} title={t.kpiTitle} meta={dc.title} />}

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
                      <span className="carac-cat">{caracLabel(c.categorie)}</span>
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

            <Link className="btn btn-primary dc-aside-cta" href="/offres">{t.ctaOffres}</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
