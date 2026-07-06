import { ContactForm } from '@/components/ContactForm';
import { getContact, type WpLocale } from '@/lib/wordpress';
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
    title: m.contactTitle,
    description: m.contactDesc,
    alternates: alternatesFor(locale, '/contact'),
  };
}

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

export default async function ContactPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.contact as Record<string, string>;
  // Contenu éditable dans WP (page « contact », groupe « Contact — page ») ;
  // chaque champ vide retombe sur le texte par défaut du site.
  const c = await getContact(locale);

  const email = c?.email || 'contact@nationdatacenter.com';
  const telephone = c?.telephone || '+33 1 00 00 00 00';
  // Adresse multi-ligne : chaque ligne du champ WP devient une ligne affichée.
  const adresse = (c?.adresse || '87 rue de Richelieu\n75002 Paris, France').split('\n');
  const whys = c?.whys?.length ? c.whys : [t.why1, t.why2, t.why3, t.why4];

  return (
    <main>
      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="container">
          <span className="eyebrow">{c?.eyebrow || t.eyebrow}</span>
          <h1 className="fil-rouge">{c?.titre || t.h1}</h1>
          <p>{c?.intro || t.intro}</p>
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
                <p className="contact-info-sub">{c?.subsidiary || t.subsidiary}</p>

                <ul className="contact-info-list">
                  <li>
                    <span className="contact-info-icon"><Icon name="mail" /></span>
                    <div>
                      <strong>{t.email}</strong>
                      <a href={`mailto:${email}`}>{email}</a>
                    </div>
                  </li>
                  <li>
                    <span className="contact-info-icon"><Icon name="phone" /></span>
                    <div>
                      <strong>{t.phone}</strong>
                      <a href={`tel:${telephone.replace(/[\s.]/g, '')}`}>{telephone}</a>
                    </div>
                  </li>
                  <li>
                    <span className="contact-info-icon"><Icon name="map" /></span>
                    <div>
                      <strong>{t.address}</strong>
                      <span>
                        {adresse.map((line, i) => (
                          <span key={i}>
                            {i > 0 && <br />}
                            {line}
                          </span>
                        ))}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span className="contact-info-icon"><Icon name="clock" /></span>
                    <div>
                      <strong>{t.hours}</strong>
                      <span>{c?.horaires || t.hoursValue}</span>
                    </div>
                  </li>
                </ul>

                {/* LinkedIn affiché seulement si l'URL est renseignée dans WP */}
                {c?.linkedin && (
                  <div className="contact-social">
                    <a
                      href={c.linkedin}
                      aria-label="LinkedIn"
                      className="contact-social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name="linkedin" />
                    </a>
                  </div>
                )}
              </div>

              {/* Carte réassurance */}
              <div className="contact-reassurance">
                <h4>{c?.whyTitle || t.whyTitle}</h4>
                <ul>
                  {whys.map((why, i) => (
                    <li key={i}>
                      <span className="contact-check">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </span>
                      {why}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
