import { getDatacenter, getDatacenters, statutInfo, toMapPoints } from '@/lib/wordpress';
import { notFound } from 'next/navigation';
import { LocationMap } from '@/components/LocationMap';
import { DcPhoto } from '@/components/DcPhoto';
import { KpiBand } from '@/components/KpiBand';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dc = await getDatacenter(params.slug);
  if (!dc) return { title: 'Data center introuvable' };
  const f = dc.datacenterFields;
  const ville = f.ville ? ` à ${f.ville}` : '';
  const desc = f.accroche
    || `Data center NDC${ville} : hébergement souverain, conception Tier III et écoresponsable. Découvrez ses caractéristiques techniques.`;
  return {
    title: `${dc.title}${ville ? ' — ' + f.ville : ''}`,
    description: desc,
    alternates: { canonical: `/datacenters/${dc.slug}` },
    openGraph: {
      title: `${dc.title} — Nation Data Center`,
      description: desc,
      type: 'article',
    },
  };
}

const CATEGORIE_LABELS: Record<string, string> = {
  securite: 'Sécurité',
  refroidissement: 'Refroidissement',
  electrique: 'Électrique',
  connectivite: 'Connectivité',
  resilience: 'Résilience',
};

export async function generateStaticParams() {
  const dcs = await getDatacenters();
  return dcs.map((d) => ({ slug: d.slug }));
}

export default async function DatacenterDetail({ params }: { params: { slug: string } }) {
  const dc = await getDatacenter(params.slug);
  if (!dc) notFound();

  const f = dc.datacenterFields;
  const { key, label } = statutInfo(f.statut);
  const kpis = f.kpis ?? [];
  const caracs = f.caracteristiques ?? [];
  const benefices = f.benefices ?? [];
  const mapPoint = toMapPoints([dc])[0]; // présent seulement si lat/lng renseignés

  return (
    <main>
      {/* HERO + PHOTO */}
      <section className="dc-hero">
        <div className="container dc-hero-grid">
          <div>
            <a className="back-link" href="/datacenters">← Tous nos data centers</a>
            <span className={`badge ${key}`} style={{ marginTop: 18 }}>
              <span className="dot" />
              {label}
            </span>
            <h1 className="fil-rouge">{dc.title}</h1>
            {f.ville && <p className="dc-city">◍ {f.ville}</p>}
            {f.accroche && <p className="dc-accroche">{f.accroche}</p>}
            <div className="dc-hero-cta">
              <a className="btn btn-primary" href="/offres">Découvrir nos offres dédiées</a>
              <a className="btn btn-ghost" href="/contact">Demander une visite</a>
            </div>
          </div>
          <DcPhoto slug={dc.slug} title={dc.title} imageUrl={dc.featuredImage?.node?.sourceUrl} />
        </div>
      </section>

      {/* KPI */}
      {kpis.length > 0 && <KpiBand kpis={kpis} title="Le site en chiffres" meta={dc.title} />}

      {/* CORPS : présentation + caractéristiques / aside bénéfices + carte */}
      <section className="section">
        <div className="container dc-body">
          <div>
            {f.description && (
              <>
                <h2 className="fil-rouge">Présentation du site</h2>
                <p className="dc-desc">{f.description}</p>
              </>
            )}

            {caracs.length > 0 && (
              <>
                <h2 className="fil-rouge" style={{ marginTop: 48 }}>Caractéristiques techniques</h2>
                <div className="carac-list">
                  {caracs.map((c, i) => (
                    <div className="carac" key={i}>
                      <span className="carac-cat">{CATEGORIE_LABELS[c.categorie] ?? c.categorie}</span>
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
                <h3>Localisation</h3>
                <LocationMap point={mapPoint} />
                {f.ville && <p className="dc-aside-loc">◍ {f.ville}</p>}
              </div>
            )}

            {/* Bénéfices */}
            {benefices.length > 0 && (
              <div className="dc-aside-block">
                <h3>Ce que cela vous apporte</h3>
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

            <a className="btn btn-primary dc-aside-cta" href="/offres">Découvrir nos offres dédiées</a>
          </aside>
        </div>
      </section>
    </main>
  );
}
