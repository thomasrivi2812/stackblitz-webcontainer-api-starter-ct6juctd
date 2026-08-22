'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export type HeroSlide = { sourceUrl: string; altText: string };

/**
 * Diaporama du hero de l'accueil : plusieurs images en fondu enchaîné.
 * Les images viennent de WordPress (homeFields.heroImage + heroImages).
 *
 * Trois précautions gouvernent ce composant :
 *
 * 1. LCP. La première image est l'élément le plus grand de la page : elle
 *    garde `priority`. Les suivantes ne sont montées qu'APRÈS l'hydratation
 *    (état `ready`), sinon le navigateur les téléchargerait toutes dès le
 *    premier rendu — elles sont dans le viewport, même invisibles — et
 *    retarderait l'affichage de la première.
 * 2. Aucun décalage de mise en page. Les vues sont empilées dans la même
 *    cellule de grille ; la hauteur reste celle que `.hero-frame img` fixe
 *    déjà à chaque point de rupture (480 / 380 / 320 / 280 px).
 * 3. WCAG 2.2.2. Un contenu qui défile seul doit pouvoir être arrêté :
 *    pause au survol, au focus, quand l'onglet passe en arrière-plan, bouton
 *    d'arrêt explicite, et défilement désactivé si le visiteur a demandé de
 *    réduire les animations.
 */
export function HeroSlideshow({
  slides,
  interval = 6,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const t = useTranslations('heroSlider');
  const n = slides.length;

  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reduced, setReduced] = useState(false);
  // « polite » seulement quand le visiteur pilote : annoncer chaque rotation
  // automatique transformerait le lecteur d'écran en métronome.
  const [live, setLive] = useState<'off' | 'polite'>('off');
  const liveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Monte les vues suivantes une fois la première peinte.
  useEffect(() => { setReady(true); }, []);

  // Respect de « prefers-reduced-motion », y compris si le réglage change.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Un onglet en arrière-plan ne doit pas continuer à faire tourner le
  // diaporama : le visiteur reviendrait sur une image prise au hasard.
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const paused = hovered || focused || hidden || stopped || reduced;

  useEffect(() => {
    if (n <= 1 || paused) return;
    const ms = Math.max(2, interval) * 1000;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), ms);
    return () => clearInterval(id);
  }, [n, paused, interval]);

  // Passage manuel : on annonce la vue, puis on repasse en silence.
  const goTo = useCallback((i: number) => {
    setIndex(((i % n) + n) % n);
    setLive('polite');
    if (liveTimer.current) clearTimeout(liveTimer.current);
    liveTimer.current = setTimeout(() => setLive('off'), 1500);
  }, [n]);

  useEffect(() => () => { if (liveTimer.current) clearTimeout(liveTimer.current); }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
  };

  if (n === 0) return null;

  // Une seule image : exactement le rendu d'avant, sans le moindre script.
  if (n === 1) {
    const s = slides[0];
    return (
      <Image
        className="hero-img"
        src={s.sourceUrl}
        alt={s.altText}
        width={1200}
        height={800}
        priority
        sizes="(max-width: 900px) 100vw, 50vw"
      />
    );
  }

  const shown = ready ? slides : slides.slice(0, 1);

  return (
    <div
      className="hero-slides"
      role="group"
      aria-roledescription={t('roleDescription')}
      aria-label={t('label')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={onKeyDown}
    >
      {shown.map((s, i) => (
        <Image
          key={s.sourceUrl + i}
          className={`hero-img hero-slide${i === index ? ' is-active' : ''}`}
          src={s.sourceUrl}
          alt={i === index ? s.altText : ''}
          aria-hidden={i === index ? undefined : true}
          width={1200}
          height={800}
          priority={i === 0}
          sizes="(max-width: 900px) 100vw, 50vw"
        />
      ))}

      <div className="hero-slides-ui">
        <button
          type="button"
          className="hero-slides-toggle"
          aria-pressed={stopped}
          aria-label={stopped ? t('play') : t('pause')}
          title={stopped ? t('play') : t('pause')}
          onClick={() => setStopped((v) => !v)}
        >
          {stopped ? (
            <svg width="11" height="12" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z" fill="currentColor" /></svg>
          ) : (
            <svg width="11" height="12" viewBox="0 0 12 14" aria-hidden="true"><rect x="1" y="1" width="3.4" height="12" fill="currentColor" /><rect x="7.6" y="1" width="3.4" height="12" fill="currentColor" /></svg>
          )}
        </button>
        <div className="hero-slides-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-slides-dot${i === index ? ' is-active' : ''}`}
              aria-label={t('goTo', { index: i + 1, total: n })}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      <span className="sr-only" aria-live={live} aria-atomic="true">
        {t('position', { index: index + 1, total: n })}
      </span>
    </div>
  );
}
