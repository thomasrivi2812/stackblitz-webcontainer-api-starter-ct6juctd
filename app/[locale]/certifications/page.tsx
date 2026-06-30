import { getCertifications, groupCertifications, certifCategorieLabel, certifStatutInfo, type WpLocale } from '@/lib/wordpress';

const camel = (k: string) => k.split('-').map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p.charAt(0).toUpperCase() + p.slice(1)).join('');
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.certifsTitle,
    description: m.certifsDesc,
    alternates: { canonical: '/certifications', languages: { fr: '/certifications', en: '/en/certifications' } },
  };
}

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

export default async function CertificationsPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.certifications as Record<string, string>;
  const certifs = await getCertifications(locale);
  const groups = groupCertifications(certifs);

  const groupLabel = (k: string, fallback: string) => t[`group${camel(k)}`] || fallback;
  const statutLabel = (k: string, fallback: string) => t[`statut${camel(k)}`] || fallback;
  const catLabel = (cat: string) => t[`cat${camel(cat)}`] || certifCategorieLabel(cat);

  return (
    <main>
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="fil-rouge">{t.h1}</h1>
          <p>{t.intro}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {groups.map((group) => (
            <div className="certif-group" key={group.key}>
              <div className="certif-group-head">
                <span className="certif-group-badge">{groupLabel(group.key, group.label)}</span>
                <span className="certif-group-line" />
                <span className="certif-group-count">
                  {group.items.length} {group.items.length !== 1 ? t.countMany : t.countOne}
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
                        <span className={`certif-statut ${statut.key}`}>{statutLabel(statut.key, statut.label)}</span>
                      </div>
                      <span className="certif-cat">{catLabel(c.categorie)}</span>
                      <h3>{c.nom}</h3>
                      {c.description && <p className="certif-desc">{c.description}</p>}
                      {c.garantie && (
                        <p className="certif-garantie">
                          <span>{t.garantit}</span>
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

      {/* En savoir plus → contact */}
      <section className="section section-alt">
        <div className="container">
          <div className="souv-card">
            <div className="souv-text">
              <span className="eyebrow">{t.ctaEyebrow}</span>
              <h2 className="fil-rouge">{t.ctaTitle}</h2>
              <p>{t.ctaText}</p>
            </div>
            <div className="souv-cta">
              <a className="btn btn-primary" href="/contact">
                {t.ctaButton}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
