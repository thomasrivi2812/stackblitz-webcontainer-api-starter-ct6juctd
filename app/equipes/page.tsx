import { getMembres, POLE_LABELS, POLE_ORDER } from '@/lib/wordpress';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos équipes',
  description:
    'Rencontrez les équipes de Nation Data Center : direction, ingénierie, exploitation et accompagnement. Les femmes et les hommes qui bâtissent un réseau de data centers souverains.',
  alternates: { canonical: '/equipes' },
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

export default async function EquipesPage() {
  const membres = await getMembres();

  // Groupement par pôle, dans l'ordre défini (pôles inconnus en fin de liste).
  const groupes = POLE_ORDER
    .map((pole) => ({ pole, items: membres.filter((m) => m.pole === pole) }))
    .filter((g) => g.items.length > 0);
  const autres = membres.filter((m) => !POLE_ORDER.includes(m.pole));
  if (autres.length > 0) groupes.push({ pole: 'support', items: autres });

  return (
    <main>
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">Les femmes & les hommes de NDC</span>
          <h1 className="fil-rouge">Nos équipes</h1>
          <p>
            Une équipe pluridisciplinaire — ingénierie, exploitation, sécurité et accompagnement —
            au service de vos infrastructures critiques.
          </p>
        </div>
      </section>

      {groupes.map((g, gi) => (
        <section className={`section ${gi % 2 === 1 ? 'section-alt' : ''}`} style={gi === 0 ? { paddingTop: 0 } : undefined} key={g.pole}>
          <div className="container">
            <h2 className="team-pole-title fil-rouge">{POLE_LABELS[g.pole] ?? 'Équipe'}</h2>
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
                  <div className="team-body">
                    <h3>{m.nom}</h3>
                    {m.poste && <span className="team-poste">{m.poste}</span>}
                    {m.bio && <p className="team-bio">{m.bio}</p>}
                    {m.linkedin && (
                      <a className="team-linkedin" href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${m.nom}`}>
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
