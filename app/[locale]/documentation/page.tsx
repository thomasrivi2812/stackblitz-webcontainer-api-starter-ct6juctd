import { getLivrets, type WpLocale } from '@/lib/wordpress';
import { LivretCard } from '@/components/LivretCard';
import { alternatesFor } from '@/lib/seo';
import type { Metadata } from 'next';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.documentationTitle,
    description: m.documentationDesc,
    alternates: alternatesFor(locale, '/documentation'),
  };
}

// Grille des livrets (CPT WP « livret ») : couverture cliquable → modale
// description + téléchargement contre e-mail (lead « download »).
export default async function DocumentationPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.documentation as Record<string, string>;
  const livrets = await getLivrets(locale);

  // Deux documents paysage consécutifs (ordre WP) sont empilés dans la même
  // colonne : deux couvertures 16:9 ≈ la hauteur d'un livret portrait.
  const groups: (typeof livrets)[] = [];
  for (let i = 0; i < livrets.length; i++) {
    if (livrets[i].format === 'paysage' && livrets[i + 1]?.format === 'paysage') {
      groups.push([livrets[i], livrets[i + 1]]);
      i++;
    } else {
      groups.push([livrets[i]]);
    }
  }

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
          {livrets.length > 0 ? (
            <div className="lvc-grid">
              {groups.map((g) =>
                g.length === 2 ? (
                  <div className="lvc-stack" key={g[0].slug}>
                    <LivretCard livret={g[0]} />
                    <LivretCard livret={g[1]} />
                  </div>
                ) : (
                  <LivretCard key={g[0].slug} livret={g[0]} />
                ),
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>{t.empty}</p>
          )}
        </div>
      </section>
    </main>
  );
}
