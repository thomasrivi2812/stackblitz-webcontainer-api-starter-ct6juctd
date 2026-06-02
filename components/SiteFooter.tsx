import { getDatacenters } from '@/lib/wordpress';
import { Logo } from './Logo';

export async function SiteFooter() {
  const datacenters = await getDatacenters();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Marque + endossement */}
          <div className="footer-brand">
            <Logo white />
            <p>Hébergement souverain, responsable et de proximité, sur l’ensemble du territoire français.</p>
            <span className="footer-altarea">Une marque Altarea</span>
          </div>

          {/* Data centers */}
          <div className="footer-col">
            <h4>Nos data centers</h4>
            <ul>
              {datacenters.map((dc) => (
                <li key={dc.slug}>
                  <a href={`/datacenters/${dc.slug}`}>
                    NDC {dc.title}
                    {dc.datacenterFields.ville ? ` — ${dc.datacenterFields.ville}` : ''}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="footer-col">
            <h4>Le site</h4>
            <ul>
              <li><a href="/datacenters">Notre réseau</a></li>
              <li><a href="/#services">Nos services</a></li>
              <li><a href="/#engagements">Nos engagements</a></li>
              <li><a href="/#actualites">Actualités</a></li>
              <li><a href="/#contact">Contact</a></li>
            </ul>
          </div>

          {/* Légal */}
          <div className="footer-col">
            <h4>Informations</h4>
            <ul>
              <li><a href="/mentions-legales">Mentions légales</a></li>
              <li><a href="/politique-de-confidentialite">Politique de confidentialité</a></li>
              <li><a href="/cookies">Gestion des cookies</a></li>
            </ul>
            <div className="footer-social">
              <a href="#" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.98h4v12H3zM9 8.98h3.8v1.64h.05a4.17 4.17 0 013.75-2.06c4 0 4.75 2.64 4.75 6.07v6.35h-4v-5.63c0-1.34 0-3.07-1.87-3.07s-2.16 1.46-2.16 2.97v5.73H9z"/></svg></a>
              <a href="#" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.8-.48-5.6a2.9 2.9 0 00-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 00-2 2C1 8.2 1 12 1 12s0 3.8.48 5.6a2.9 2.9 0 002 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 002-2C23 15.8 23 12 23 12zm-13.2 3.5v-7l6 3.5z"/></svg></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Nation Data Center — Filiale du Groupe Altarea. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
