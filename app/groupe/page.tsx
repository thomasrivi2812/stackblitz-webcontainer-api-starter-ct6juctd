import { getGroupe } from '@/lib/wordpress';
import { KpiBand } from '@/components/KpiBand';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Le groupe Altarea',
  description:
    'Nation Data Center est une filiale à 100 % du Groupe Altarea, leader français de la transformation urbaine bas carbone. Découvrez l’articulation entre NDC et son groupe.',
  alternates: { canonical: '/groupe' },
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function GroupePage() {
  const g = await getGroupe();

  return (
    <main>
      {/* Intro */}
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">Notre groupe</span>
          <h1 className="fil-rouge">{g.introTitre}</h1>
          {g.introTexte && <p>{g.introTexte}</p>}
        </div>
      </section>

      {/* Chiffres clés — même bandeau que l'accueil */}
      {g.chiffres.length > 0 && (
        <KpiBand
          kpis={g.chiffres.map((c) => ({ valeur: c.valeur, unite: c.unite, label: c.label }))}
          title="Le groupe Altarea en chiffres"
          meta="Groupe Altarea"
        />
      )}

      {/* Valeurs */}
      {g.valeurs.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Nos valeurs partagées</span>
              <h2 className="fil-rouge">Une ambition commune</h2>
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
              <span className="eyebrow">Repères</span>
              <h2 className="fil-rouge">Quelques jalons</h2>
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
