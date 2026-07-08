import { getLivrets, getDocumentationHead, type WpLocale } from '@/lib/wordpress';
import { LivretCard } from '@/components/LivretCard';
import { VideoCard } from '@/components/VideoCard';
import { BrochureButton } from '@/components/BrochureButton';
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

// Page Documentation, entièrement éditable dans WP (page « documentation ») :
// en-tête, bandeau brochure (image, textes, étiquettes, fichier), section
// documents (livrets, formats portrait/paysage mélangés dans la même grille)
// et section vidéos (masquée tant qu'aucune vidéo n'est ajoutée dans WP).
export default async function DocumentationPage({ params: { locale } }: { params: { locale: WpLocale } }) {
  const t = (await import(`../../../messages/${locale}.json`)).default.documentation as Record<string, string>;
  const [livrets, head] = await Promise.all([getLivrets(locale), getDocumentationHead(locale)]);

  const metas = head?.brochureMetas?.length
    ? head.brochureMetas
    : [t.brochureMeta1, t.brochureMeta2].filter(Boolean);
  const videos = head?.videos ?? [];

  return (
    <main>
      {/* ── En-tête ── */}
      <section className="section" style={{ paddingBottom: 24 }}>
        <div className="container section-head">
          <span className="eyebrow">{head?.eyebrow || t.eyebrow}</span>
          <h1 className="fil-rouge">{head?.titre || t.h1}</h1>
          <p>{head?.intro || t.intro}</p>
        </div>
      </section>

      {/* ── Bandeau brochure (lead : envoi contre e-mail) ── */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 28 }}>
        <div className="container">
          <div className="doc-hero">
            <div className="doc-hero-cover">
              {head?.brochureImage ? (
                <img src={head.brochureImage.sourceUrl} alt={head.brochureImage.altText || ''} />
              ) : (
                <span className="doc-hero-ph" aria-hidden="true">
                  <span className="doc-hero-ph-mark">N|D|C</span>
                  <span className="doc-hero-ph-title">{head?.brochureTitle || t.brochureTitle}</span>
                </span>
              )}
            </div>
            <div className="doc-hero-body">
              <span className="doc-hero-eyebrow">{head?.brochureEyebrow || t.brochureEyebrow}</span>
              <h2>{head?.brochureTitle || t.brochureTitle}</h2>
              <p>{head?.brochureText || t.brochureText}</p>
              {metas.length > 0 && (
                <div className="doc-hero-metas">
                  {metas.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              )}
              <div className="doc-hero-cta">
                <BrochureButton
                  className="btn-v2 btn-v2-primary"
                  pdfUrl={head?.brochureFileUrl}
                  label={head?.brochureCta || t.brochureCta}
                />
                <span className="doc-hero-note">{head?.brochureNote || t.brochureNote}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Documents à télécharger ── */}
      <section className="section" style={{ paddingTop: 24, paddingBottom: 32 }}>
        <div className="container">
          <div className="doc-sec-head">
            <h2>{head?.docsTitle || t.docsTitle}</h2>
            <span className="doc-sec-note">{head?.docsNote || t.docsNote}</span>
          </div>
          {livrets.length > 0 ? (
            <div className="lvc-grid">
              {livrets.map((l) => (
                <LivretCard key={l.slug} livret={l} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>{t.empty}</p>
          )}
        </div>
      </section>

      {/* ── En vidéo — section masquée tant qu'aucune vidéo dans WP ── */}
      {videos.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="doc-sec-head">
              <h2>{head?.videosTitle || t.videosTitle}</h2>
              {head?.videosSeeAllUrl && (
                <a
                  className="link-arrow"
                  href={head.videosSeeAllUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {head?.videosSeeAllLabel || t.videosSeeAll}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
            <div className="vdc-grid">
              {videos.map((v, i) => (
                <VideoCard key={`${v.url}-${i}`} video={v} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
