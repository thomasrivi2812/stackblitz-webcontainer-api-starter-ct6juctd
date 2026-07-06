import { getMembres, getEquipesHead, POLE_ORDER, type WpLocale } from '@/lib/wordpress';
import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/seo';

// ISR : page servie depuis le cache, regeneree au plus toutes les 5 min
// (revalidation instantanee possible via /api/revalidate au save_post WP).
// Temps reel pendant l'edition : poser WP_LIVE=1 dans l'env (Vercel) →
// revalidate=0 (aucun cache). Sinon cache ISR de 5 min.
export const revalidate = process.env.WP_LIVE === '1' ? 0 : 300;

export async function generateMetadata({ params: { locale } }: { params: { locale: WpLocale } }): Promise<Metadata> {
  const m = (await import(`../../../messages/${locale}.json`)).default.meta as Record<string, string>;
  return {
    title: m.equipesTitle,
    description: m.equipesDesc,
    alternates: alternatesFor(locale, '/equipes'),
  };
}


function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z" />
    </svg>
  );
}

export default async function EquipesPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.team as Record<string, string>;
  const pole = (k: string) => t[`pole${k.charAt(0).toUpperCase()}${k.slice(1)}`] || t.poleFallback;
  // En-tête éditable dans WP (page « equipes ») ; membres gérés dans le CPT
  // « Membres » (nom, poste, pôle, bio, LinkedIn, photo, ordre manuel).
  const [membres, head] = await Promise.all([getMembres(locale), getEquipesHead(locale)]);

  // Groupement par pôle, dans l'ordre défini (pôles inconnus en fin de liste).
  const groupes = POLE_ORDER
    .map((pole) => ({ pole, items: membres.filter((m) => m.pole === pole) }))
    .filter((g) => g.items.length > 0);
  const autres = membres.filter((m) => !POLE_ORDER.includes(m.pole));
  if (autres.length > 0) groupes.push({ pole: 'transverse', items: autres });

  return (
    <main>
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">{head?.eyebrow || t.eyebrow}</span>
          <h1 className="fil-rouge">{head?.titre || t.h1}</h1>
          <p>{head?.intro || t.intro}</p>
        </div>
      </section>

      {groupes.map((g, gi) => (
        <section className={`section ${gi % 2 === 1 ? 'section-alt' : ''}`} style={gi === 0 ? { paddingTop: 0 } : undefined} key={g.pole}>
          <div className="container">
            <div className="team-pole-head">
              <h2 className="team-pole-title fil-rouge">{pole(g.pole)}</h2>
              <span className="team-pole-line" aria-hidden="true" />
              <span className="team-pole-count">
                {g.items.length} {g.items.length !== 1 ? t.countMany : t.countOne}
              </span>
            </div>
            <div className="team-grid">
              {g.items.map((m) => (
                <article className="team-card" key={m.nom + m.poste}>
                  <div className="team-photo">
                    {m.photo ? (
                      <img src={m.photo.sourceUrl} alt={m.photo.altText || m.nom} />
                    ) : (
                      <span className="team-initials">{initials(m.nom)}</span>
                    )}
                  </div>
                  <span className="team-dot" aria-hidden="true" />
                  <div className="team-body">
                    <h3>{m.nom}</h3>
                    {m.poste && <span className="team-poste">{m.poste}</span>}
                    {m.bio && <p className="team-bio">{m.bio}</p>}
                    {m.linkedin && (
                      <a className="team-linkedin" href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={t.linkedinAria.replace('{name}', m.nom)}>
                        <LinkedInIcon />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
