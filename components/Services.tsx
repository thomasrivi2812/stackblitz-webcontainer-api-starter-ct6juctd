// Section « Nos services » de l'accueil.
// Contenu repris de la maquette NDC : chaque service a un bénéfice client explicite.
import { BrochureButton } from './BrochureButton';

function ServiceIcon({ name }: { name: string }) {
  const c = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'colocation': return <svg {...c}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>;
    case 'ia': return <svg {...c}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>;
    case 'espaces': return <svg {...c}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
    case 'connectivite': return <svg {...c}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8 11l8-4M8 13l8 4" /></svg>;
    case 'accompagnement': return <svg {...c}><path d="M16 21v-2a4 4 0 00-8 0v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case 'continuite': return <svg {...c}><path d="M3 12a9 9 0 1015-6.7L21 8" /><path d="M21 3v5h-5" /></svg>;
    default: return null;
  }
}

const services = [
  { icon: 'colocation', titre: 'Hébergement en colocation', desc: 'Baies sécurisées, alimentation et refroidissement mutualisés, conception Tier III.', benefice: 'Réduisez vos coûts IT de 30 à 50 % vs salle interne' },
  { icon: 'ia', titre: 'Colocation haute densité / IA', desc: 'Jusqu’à 140 kW par baie en DLC. Conçu pour l’IA, le HPC et les charges intensives.', benefice: 'Hébergez vos clusters GPU sans compromis' },
  { icon: 'espaces', titre: 'Espaces modulables', desc: 'Cages privatives, zones dédiées, configurations sur mesure selon vos enjeux.', benefice: 'Adaptez votre infrastructure sans investissement lourd' },
  { icon: 'connectivite', titre: 'Connectivité carrier-neutral', desc: 'Meet-me-room, opérateurs au choix, interconnexions cloud. Zéro verrouillage.', benefice: 'Choisissez librement vos opérateurs' },
  { icon: 'accompagnement', titre: 'Accompagnement personnalisé', desc: 'Interlocuteur dédié, interventions de proximité, suivi et optimisation.', benefice: 'Un partenaire, pas un simple fournisseur' },
  { icon: 'continuite', titre: 'Continuité de service', desc: 'Réseau redondé, alimentation A+B, groupes électrogènes N+1.', benefice: '99,982 % de disponibilité visée' },
];

export function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Nos services</span>
          <h2 className="fil-rouge">Une infrastructure adaptée à vos exigences</h2>
          <p>NDC vous accompagne de la définition de votre dispositif à l’exploitation quotidienne.</p>
        </div>

        <div className="services-grid">
          {services.map((s) => (
            <article className="service-card" key={s.titre}>
              <span className="service-ico"><ServiceIcon name={s.icon} /></span>
              <h3>{s.titre}</h3>
              <p>{s.desc}</p>
              <div className="service-benefit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                {s.benefice}
              </div>
            </article>
          ))}
        </div>

        <div className="services-feature">
          <div className="services-feature-media">
            <img src="/services-proximite.jpg" alt="Intervention de proximité sur les serveurs dans un data center NDC" />
          </div>
          <div className="services-feature-text">
            <span className="eyebrow">Services de proximité</span>
            <h3>Des gestes techniques réalisés sur site, par nos équipes</h3>
            <p>
              Au-delà de l’hébergement, nos équipes d’exploitation interviennent directement sur
              vos équipements : installation, remplacement de composants, gestion des accès et
              reporting. Un guichet unique, réactif et local, pour une exploitation sans friction.
            </p>
            <a className="btn btn-ghost" href="/">Découvrir le catalogue de proximité</a>
          </div>
        </div>

        <div className="services-cta">
          <BrochureButton className="btn btn-ghost" />
          <a className="btn btn-primary" href="/">Demander un audit</a>
        </div>
      </div>
    </section>
  );
}
