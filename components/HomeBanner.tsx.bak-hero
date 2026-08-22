// Bandeau d'actualité chaude, sous le hero de l'accueil.
// -----------------------------------------------------
// Entièrement piloté depuis WordPress (homeFields.banner*) : interrupteur
// d'affichage, pastille, titre, texte, lien, vignette, tonalité et date de
// péremption. Rien à déployer pour publier ou retirer une annonce.
//
// Composant serveur : aucun JavaScript n'est envoyé au navigateur, et la
// date de péremption est évaluée côté serveur — donc pas de divergence
// d'hydratation. L'objet `banner` vaut déjà null quand la bannière est
// désactivée, sans titre ou périmée (voir mapHome dans lib/wordpress.ts).
import type { HomeBanner as Banner, WpLocale } from '@/lib/wordpress';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export async function HomeBanner({ banner, locale = 'fr' }: { banner: Banner; locale?: WpLocale }) {
  const t = (await import(`../messages/${locale}.json`)).default.homeBanner as Record<string, string>;

  const label = banner.label || t.label;
  const ctaLabel = banner.ctaLabel || t.cta;
  const href = banner.ctaUrl || null;

  const inner = (
    <>
      <span className="hbn-flag">
        <span className="hbn-flag-dot" aria-hidden="true" />
        {label}
      </span>

      <span className="hbn-body">
        <span className="hbn-title">{banner.title}</span>
        {banner.text && <span className="hbn-text">{banner.text}</span>}
      </span>

      {banner.image && (
        <span className="hbn-media" aria-hidden="true">
          {/* Vignette purement décorative : le titre porte déjà l'information,
              et next/image serait inutile pour 96 px de large. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.image.sourceUrl} alt="" loading="lazy" decoding="async" width={96} height={64} />
        </span>
      )}

      {href && (
        <span className="hbn-cta">
          {ctaLabel}
          <ArrowIcon />
        </span>
      )}
    </>
  );

  return (
    <section className={`hbn tone-${banner.tone}`} aria-label={label}>
      <span className="hbn-rule" aria-hidden="true" />
      <span className="hbn-motif" aria-hidden="true" />
      <span className="hbn-glow" aria-hidden="true" />
      <div className="container">
        {href ? (
          <a className="hbn-inner is-link" href={href}>{inner}</a>
        ) : (
          <div className="hbn-inner">{inner}</div>
        )}
      </div>
    </section>
  );
}
