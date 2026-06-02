// Section « Crédibilité » : certifications exigeantes + endossement Groupe Altarea.
// Reprend la logique de la maquette NDC (réassurance pro/technique).

const certifications = [
  { code: 'ISO 27001', label: 'Sécurité de l’information', statut: 'Visée' },
  { code: 'HDS', label: 'Hébergement de données de santé', statut: 'Visée' },
  { code: 'ISO 14001', label: 'Management environnemental', statut: 'Visée' },
  { code: 'ISO 50001', label: 'Management de l’énergie', statut: 'Visée' },
  { code: 'EN 50600', label: 'Conception Tier III', statut: 'Conforme' },
  { code: 'Code of Conduct', label: 'Datacenters européens', statut: 'Visée' },
];

export function Credibility() {
  return (
    <section className="section section-alt" id="credibilite">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Crédibilité</span>
          <h2 className="fil-rouge">Des certifications exigeantes, un groupe solide</h2>
          <p>
            La conformité de nos infrastructures aux référentiels les plus stricts du marché,
            portée par un actionnariat de premier plan.
          </p>
        </div>

        <div className="cred-grid">
          {certifications.map((c) => (
            <div className="cert-card" key={c.code}>
              <div className="cert-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" /><path d="M8.5 12.5L7 21l5-3 5 3-1.5-8.5" />
                </svg>
              </div>
              <div className="cert-main">
                <strong>{c.code}</strong>
                <span>{c.label}</span>
              </div>
              <span className={`cert-statut ${c.statut === 'Conforme' ? 'ok' : 'wip'}`}>{c.statut}</span>
            </div>
          ))}
        </div>

        {/* Endossement Groupe Altarea */}
        <div className="altarea-card">
          <div className="altarea-logo" aria-label="Groupe Altarea">
            {/* Emplacement logo : dépose le fichier dans public/altarea-logo.svg (ou .png) */}
            <span className="altarea-mark">ALTAREA</span>
          </div>
          <div className="altarea-text">
            <h3>Une marque du Groupe Altarea</h3>
            <p>
              Nation Data Center est une filiale à 100 % du Groupe Altarea, leader de la
              transformation urbaine bas carbone en France. Un actionnariat solide et engagé au
              service de vos projets critiques.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
