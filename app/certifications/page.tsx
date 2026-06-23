import { getCertifications, groupCertifications, certifCategorieLabel, certifStatutInfo } from '@/lib/wordpress';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos certifications',
  description:
    'Les certifications de Nation Data Center : ISO 27001, HDS, SecNumCloud, ISO 50001, Tier III… Des référentiels exigeants au service d’un hébergement souverain et écoresponsable.',
  alternates: { canonical: '/certifications' },
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default async function CertificationsPage() {
  const certifs = await getCertifications();
  const groups = groupCertifications(certifs);
  const souveraines = certifs.filter((c) => c.souverainete);

  return (
    <main>
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">Conformité & confiance</span>
          <h1 className="fil-rouge">Nos certifications</h1>
          <p>
            Nos infrastructures sont conçues pour répondre aux référentiels les plus stricts du marché,
            de la sécurité de l’information à la performance énergétique.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {groups.map((group) => (
            <div className="certif-group" key={group.key}>
              <div className="certif-group-head">
                <span className="certif-group-badge">{group.label}</span>
                <span className="certif-group-line" />
                <span className="certif-group-count">
                  {group.items.length} certification{group.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="certif-grid">
                {group.items.map((c) => {
                  const statut = certifStatutInfo(c.statut);
                  return (
                    <article className="certif-card" key={c.nom}>
                      <div className="certif-card-top">
                        <div className="certif-badge">
                          {c.logo ? (
                            <img src={c.logo.sourceUrl} alt={c.logo.altText || c.nom} />
                          ) : (
                            <ShieldIcon />
                          )}
                        </div>
                        <span className={`certif-statut ${statut.key}`}>{statut.label}</span>
                      </div>
                      <span className="certif-cat">{certifCategorieLabel(c.categorie)}</span>
                      <h3>{c.nom}</h3>
                      {c.description && <p className="certif-desc">{c.description}</p>}
                      {c.garantie && (
                        <p className="certif-garantie">
                          <span>Ce que ça garantit</span>
                          {c.garantie}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Éclairage souveraineté */}
      {souveraines.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="souv-card">
              <div className="souv-text">
                <span className="eyebrow">Souveraineté</span>
                <h2 className="fil-rouge">Vos données restent en France</h2>
                <p>
                  Avec des qualifications comme <strong>SecNumCloud</strong> et <strong>HDS</strong>, et un hébergement
                  100 % national, Nation Data Center garantit que vos données demeurent sous juridiction française et
                  européenne — hors de portée des lois extraterritoriales (Cloud Act, FISA).
                </p>
              </div>
              <ul className="souv-list">
                {souveraines.map((c) => (
                  <li key={c.nom}>
                    <ShieldIcon />
                    <div>
                      <strong>{c.nom}</strong>
                      <span>{c.garantie || c.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
