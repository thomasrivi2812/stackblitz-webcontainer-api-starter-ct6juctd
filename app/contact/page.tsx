import { ContactForm } from '@/components/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Nation Data Center',
  description:
    'Contactez Nation Data Center pour un devis, une visite de site ou tout renseignement sur nos offres d\'hébergement souverain.',
};

/* ------------------------------- Icônes ------------------------------- */
function Icon({ name }: { name: string }) {
  const c = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'mail':
      return (
        <svg {...c}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 7L2 7" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...c}>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.37 1.6.65 2.36a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.76.28 1.55.52 2.36.65a2 2 0 011.72 2.01z" />
        </svg>
      );
    case 'map':
      return (
        <svg {...c}>
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...c}>
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ContactPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1 className="fil-rouge">Parlons de votre projet</h1>
          <p>
            Besoin d'un devis, d'une visite de site ou d'informations sur nos
            offres ? Remplissez le formulaire ci-dessous, nos équipes vous
            répondent sous 24 heures.
          </p>
        </div>
      </section>

      {/* ── Contenu ── */}
      <section className="section">
        <div className="container">
          <div className="contact-layout">
            {/* Formulaire */}
            <div className="contact-form-wrap">
              <ContactForm />
            </div>

            {/* Sidebar informations */}
            <aside className="contact-aside">
              {/* Carte coordonnées */}
              <div className="contact-info-card">
                <h3>Nation Data Center</h3>
                <p className="contact-info-sub">Filiale du Groupe Altarea</p>

                <ul className="contact-info-list">
                  <li>
                    <span className="contact-info-icon"><Icon name="mail" /></span>
                    <div>
                      <strong>E-mail</strong>
                      <a href="mailto:contact@nationdatacenter.com">contact@nationdatacenter.com</a>
                    </div>
                  </li>
                  <li>
                    <span className="contact-info-icon"><Icon name="phone" /></span>
                    <div>
                      <strong>Téléphone</strong>
                      <a href="tel:+33100000000">+33 1 00 00 00 00</a>
                    </div>
                  </li>
                  <li>
                    <span className="contact-info-icon"><Icon name="map" /></span>
                    <div>
                      <strong>Adresse</strong>
                      <span>87 rue de Richelieu<br />75002 Paris, France</span>
                    </div>
                  </li>
                  <li>
                    <span className="contact-info-icon"><Icon name="clock" /></span>
                    <div>
                      <strong>Horaires</strong>
                      <span>Lun – Ven : 9h00 – 18h00</span>
                    </div>
                  </li>
                </ul>

                <div className="contact-social">
                  <a href="#" aria-label="LinkedIn" className="contact-social-link">
                    <Icon name="linkedin" />
                  </a>
                </div>
              </div>

              {/* Carte réassurance */}
              <div className="contact-reassurance">
                <h4>Pourquoi nous contacter ?</h4>
                <ul>
                  <li>
                    <span className="contact-check">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    Réponse personnalisée sous 24h
                  </li>
                  <li>
                    <span className="contact-check">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    Devis sur mesure, sans engagement
                  </li>
                  <li>
                    <span className="contact-check">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    Visite de site possible
                  </li>
                  <li>
                    <span className="contact-check">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    Accompagnement dédié de A à Z
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
