import { getDatacenter, getDatacenters, statutInfo } from '@/lib/wordpress';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const CATEGORIE_LABELS: Record<string, string> = {
  securite: 'Sécurité',
  refroidissement: 'Refroidissement',
  electrique: 'Électrique',
  connectivite: 'Connectivité',
  resilience: 'Résilience',
};

// Pré-génère les routes connues (utile une fois en statique/ISR).
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

  return (
    <main>
      <section className="dc-hero">
        <div className="container">
          <a className="back-link" href="/datacenters">← Tous nos data centers</a>
          <span className={`badge ${key}`} style={{ marginTop: 18 }}>
            <span className="dot" />
            {label}
          </span>
          <h1 className="fil-rouge">{dc.title}</h1>
          {f.ville && <p className="dc-city">◍ {f.ville}</p>}
          {f.accroche && <p className="dc-accroche">{f.accroche}</p>}
        </div>
      </section>

      {kpis.length > 0 && (
        <section className="kpi-band">
          <div className="container kpi-grid">
            {kpis.map((k, i) => (
              <div className="kpi" key={i}>
                <div className="kpi-val">
                  {k.valeur}
                  {k.unite && <span className="kpi-unit"> {k.unite}</span>}
                </div>
                <div className="kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

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

          {benefices.length > 0 && (
            <aside className="dc-aside">
              <h3>Ce que cela vous apporte</h3>
              <ul>
                {benefices.map((b, i) => (
                  <li key={i}>
                    <strong>{b.titre}</strong>
                    <span>{b.texte}</span>
                  </li>
                ))}
              </ul>
              <a className="btn btn-primary" href="/" style={{ marginTop: 8 }}>
                Demander une visite
              </a>
            </aside>
          )}
        </div>
      </section>
    </main>
  );
}
