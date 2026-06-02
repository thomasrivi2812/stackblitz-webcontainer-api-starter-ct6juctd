import { HeroVisual } from '@/components/HeroVisual';
import { Services } from '@/components/Services';
import { Credibility } from '@/components/Credibility';
import { NetworkMap } from '@/components/NetworkMap';
import {
  getDatacenters,
  getRecentPosts,
  toMapPoints,
  statutInfo,
  networkKpis,
  stripHtml,
  formatDateFr,
} from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

/* ------------------------------- Icônes ------------------------------- */
function Icon({ name }: { name: string }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'building': return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></svg>;
    case 'shield': return <svg {...common}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>;
    case 'network': return <svg {...common}><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M12 7v4M12 11l-5 5M12 11l5 5" /></svg>;
    case 'services': return <svg {...common}><path d="M14 7l3-3 3 3-3 3M3 21l6-6M9 11l4 4M5 13l-2 2 4 4 2-2" /></svg>;
    case 'decarbon': return <svg {...common}><path d="M7 18a4 4 0 010-8 5 5 0 019-2 4 4 0 011 8" /><path d="M12 21v-7M9 17l3-3 3 3" /></svg>;
    case 'sobriete': return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 12l3-3" /></svg>;
    case 'chaleur': return <svg {...common}><path d="M12 3c2 3-1 4 0 7M8 7c1 2-1 3 0 5M16 8c1 2-1 3 0 5" /><path d="M7 14a5 5 0 0010 0" /></svg>;
    case 'eau': return <svg {...common}><path d="M12 3s6 6.5 6 10a6 6 0 01-12 0c0-3.5 6-10 6-10z" /></svg>;
    default: return null;
  }
}

const engagements = [
  { icon: 'decarbon', titre: 'Décarbonation des énergies et de la construction', tone: 'vert' },
  { icon: 'sobriete', titre: 'Sobriété énergétique', tone: 'turquoise' },
  { icon: 'chaleur', titre: 'Valorisation des énergies fatales', tone: 'marine' },
  { icon: 'eau', titre: 'Protection de la ressource en eau', tone: 'turquoise' },
];

const principes = [
  ['Construire avec une approche décarbonée', 'bois responsable, réemploi et recyclage des matériaux.'],
  ['Privilégier les énergies propres', 'renouvelables locales, géothermie, free cooling.'],
  ['Réduire la consommation énergétique', 'isolation performante, pilotage et optimisation.'],
  ['Protéger la ressource en eau', 'aucune technologie consommatrice d’eau pour le refroidissement.'],
  ['Valoriser les chaleurs fatales', 'redistribution vers les réseaux urbains (piscines, logements…).'],
];

export default async function Home() {
  const datacenters = await getDatacenters();
  const points = toMapPoints(datacenters);
  const preview = datacenters.slice(0, 3);
  const posts = await getRecentPosts();
  const kpis = networkKpis(datacenters);

  // Pour afficher une vraie photo : dépose ton image dans `public/hero-datacenter.jpg`.
  const heroImage = '/hero-datacenter.jpg';

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Souverain · Responsable · De proximité</span>
            <h1 className="fil-rouge">Construire les infrastructures IT de demain.</h1>
            <p>
              Premier réseau de data centers souverain, local et écoresponsable, Nation Data
              Center vous accompagne dans la maîtrise de vos données.
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="/datacenters">Découvrir notre réseau</a>
              <a className="btn btn-ghost" href="/">Demander un échange</a>
            </div>
          </div>
          <HeroVisual src={heroImage} />
        </div>
      </section>

      {/* BANDEAU KPI RÉSEAU */}
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

      {/* NOS DATA CENTERS */}
      <section className="section section-alt" id="datacenters">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Le réseau NDC</span>
            <h2 className="fil-rouge">Nos data centers</h2>
            <p>Un réseau 100 % implanté sur le territoire national, à l’horizon de 15 sites en 2030.</p>
          </div>
          <div className="preview-grid">
            {preview.map((dc) => {
              const { key, label } = statutInfo(dc.datacenterFields.statut);
              return (
                <a className="preview-card" key={dc.slug} href={`/datacenters/${dc.slug}`}>
                  <div className={`preview-media tone-${key}`}>
                    <span className={`badge ${key}`}><span className="dot" />{label}</span>
                  </div>
                  <div className="preview-body">
                    <h3>{dc.title}</h3>
                    <div className="preview-meta">
                      {dc.datacenterFields.ville && <span className="preview-city">◍ {dc.datacenterFields.ville}</span>}
                      {dc.datacenterFields.puissance && <span className="preview-power">⚡ {dc.datacenterFields.puissance}</span>}
                    </div>
                    <span className="preview-link">Voir le site →</span>
                  </div>
                </a>
              );
            })}
          </div>
          <div className="center-cta"><a className="btn btn-ghost" href="/datacenters">Voir tous nos data centers</a></div>
          <div className="map-wrap"><NetworkMap points={points} /></div>
        </div>
      </section>

      {/* NOS SERVICES */}
      <Services />

      {/* NOS ENGAGEMENTS — Pourquoi choisir NDC */}
      <section className="section" id="engagements">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Nos engagements</span>
            <h2 className="fil-rouge">Pourquoi choisir NDC</h2>
          </div>
          <div className="engage-grid">
            {engagements.map((e) => (
              <article className={`engage-card tone-${e.tone}`} key={e.titre}>
                <span className="engage-ico"><Icon name={e.icon} /></span>
                <h3>{e.titre}</h3>
              </article>
            ))}
          </div>
          <div className="center-cta"><a className="btn btn-primary" href="/">Voir tous nos engagements</a></div>
        </div>
      </section>

      {/* AMBITION / MISSION / VISION */}
      <section className="amv">
        <div className="container">
          <h2>Le réseau Nation Data Center : <span className="accent">sécurisé et durable</span></h2>
          <p className="amv-intro">
            Après les data centers de Rouen, Rennes&nbsp;1 et Paris&nbsp;1, Nation Data Center développe
            <strong> 15 data centers à horizon 2030</strong>.
          </p>

          <div className="amv-block">
            <h3>Notre <span className="accent">ambition</span></h3>
            <p>Un réseau de data centers écoresponsable, souverain et de proximité sur le territoire français. Nos équipes conçoivent et opèrent des infrastructures de haute performance, sécurisées et fiables, capables de répondre à l’ensemble de vos enjeux IT.</p>
          </div>
          <div className="amv-block">
            <h3>Notre <span className="accent">mission</span></h3>
            <p>Les data centers représentent déjà 16 % de l’empreinte carbone du numérique en France. Nous nous sommes lancés dans la conception, la construction et l’exploitation de centres conciliant enjeux économiques et durabilité environnementale.</p>
          </div>
          <div className="amv-block">
            <h3>Notre <span className="accent">vision</span></h3>
            <p>Durables et résilients, nos data centers sont conçus et exploités de manière décarbonée. Ils priorisent les énergies renouvelables et ne consomment pas d’eau pour la production de froid, avec un accompagnement client au quotidien.</p>
          </div>

          <ol className="principes">
            {principes.map(([t, d], i) => (
              <li key={i}><span className="num">{i + 1}</span><span><strong>{t}</strong> — {d}</span></li>
            ))}
          </ol>
        </div>
      </section>

      {/* CRÉDIBILITÉ + GROUPE ALTAREA */}
      <Credibility />

      {/* ACTUALITÉS */}
      <section className="section" id="actualites">
        <div className="container">
          <div className="section-head"><h2 className="fil-rouge">Actualités</h2></div>
          <div className="news-grid">
            {posts.map((p) => (
              <a className="news-card" key={p.slug} href={`/`}>
                <div className="news-media">
                  {p.featuredImage?.node?.sourceUrl
                    ? <img src={p.featuredImage.node.sourceUrl} alt={p.featuredImage.node.altText || p.title} />
                    : <span className="news-ph"><Icon name="building" /></span>}
                </div>
                <div className="news-body">
                  <span className="news-date">{formatDateFr(p.date)}</span>
                  <h3>{p.title}</h3>
                  <p>{stripHtml(p.excerpt)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
