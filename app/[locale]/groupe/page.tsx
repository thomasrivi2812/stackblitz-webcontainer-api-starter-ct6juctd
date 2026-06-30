import { getGroupe, type WpLocale } from '@/lib/wordpress';
import { KpiBand } from '@/components/KpiBand';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.groupeTitle,
    description: m.groupeDesc,
    alternates: { canonical: '/groupe', languages: { fr: '/groupe', en: '/en/groupe' } },
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function GroupePage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.groupe as Record<string, string>;
  const g = await getGroupe(locale);

  return (
    <main>
      {/* Intro */}
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="fil-rouge">{g.introTitre}</h1>
          {g.introTexte && <p>{g.introTexte}</p>}
        </div>
      </section>

      {/* Chiffres clés — même bandeau que l'accueil */}
      {g.chiffres.length > 0 && (
        <KpiBand
          kpis={g.chiffres.map((c) => ({ valeur: c.valeur, unite: c.unite, label: c.label }))}
          title={t.kpiTitle}
          meta="Groupe Altarea"
        />
      )}

      {/* Valeurs */}
      {g.valeurs.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t.valeursEyebrow}</span>
              <h2 className="fil-rouge">{t.valeursTitle}</h2>
            </div>
            <div className="groupe-valeurs">
              {g.valeurs.map((v) => (
                <article className="groupe-valeur" key={v.titre}>
                  <h3>{v.titre}</h3>
                  <p>{v.texte}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articulation NDC ↔ Altarea */}
      {(g.articulationTitre || g.articulationTexte) && (
        <section className="section">
          <div className="container">
            <div className="groupe-artic">
              <div className="groupe-artic-text">
                <span className="eyebrow">NDC × Altarea</span>
                <h2 className="fil-rouge">{g.articulationTitre}</h2>
                <p>{g.articulationTexte}</p>
              </div>
              <div className="groupe-artic-logos" aria-hidden="true">
                <span className="groupe-logo-ndc">NDC</span>
                <span className="groupe-logo-link" />
                <span className="groupe-logo-altarea">ALTAREA</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {g.timeline.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t.reperesEyebrow}</span>
              <h2 className="fil-rouge">{t.reperesTitle}</h2>
            </div>
            <ol className="groupe-timeline">
              {g.timeline.map((t) => (
                <li key={t.annee + t.evenement}>
                  <span className="groupe-timeline-annee">{t.annee}</span>
                  <span className="groupe-timeline-dot" />
                  <span className="groupe-timeline-event">{t.evenement}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </main>
  );
}
