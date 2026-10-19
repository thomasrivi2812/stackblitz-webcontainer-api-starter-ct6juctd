'use client';

import { Suspense, useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { type Persona } from '@/lib/personas';
import { AskQuestionButton } from './AskQuestionButton';
import { OffreIcon } from './OffreIcon';

// Colore le terme du profil (ex. « DSI », « secteur public ») là où il apparaît dans un titre.
// On teste les termes du plus long au plus court pour colorer l'expression la plus complète.
function highlight(text: string, words: string[]) {
  const sorted = [...words].sort((a, b) => b.length - a.length);
  for (const w of sorted) {
    const idx = text.toLowerCase().indexOf(w.toLowerCase());
    if (idx !== -1) {
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + w.length);
      const after = text.slice(idx + w.length);
      return (
        <>
          {before}
          <span style={{ color: 'var(--op-accent)' }}>{match}</span>
          {after}
        </>
      );
    }
  }
  return text;
}

// Suit ?profil=… (menu déroulant, lien partagé). Isolé dans son propre
// <Suspense> : useSearchParams fait basculer en rendu navigateur tout ce qui
// se trouve sous la frontière Suspense la plus proche. Autour de la page
// entière, le HTML servi était VIDE (illisible par Google et les IA) ; ici,
// seul ce composant sans affichage est concerné.
function ProfilSync({ personas, onChange }: { personas: Persona[]; onChange: (id: string) => void }) {
  const profil = useSearchParams().get('profil');
  useEffect(() => {
    if (profil && personas.some((p) => p.id === profil)) onChange(profil);
  }, [profil, personas, onChange]);
  return null;
}

export function OffresPersonas({ personas }: { personas: Persona[] }) {
  const t = useTranslations('offres');

  // Persona affiché au rendu serveur : le premier ; ?profil=… est appliqué
  // ensuite dans le navigateur (ProfilSync).
  const [active, setActive] = useState<string>(personas[0]?.id ?? 'dsi');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const persona = personas.find((p) => p.id === active) ?? personas[0];
  const syncProfil = useCallback((id: string) => {
    setActive(id);
    setOpenFaq(null);
  }, []);

  function changePersona(id: string) {
    setActive(id);
    setOpenFaq(null);
    // Refléter le persona courant dans l'URL (?profil=id) sans rechargement,
    // pour que le changement de langue reste sur ce persona.
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('profil', id);
      window.history.replaceState(null, '', url.toString());
    }
  }

  if (!persona) return null;

  const accentVars = {
    ['--op-accent' as string]: persona.accent,
    ['--op-accent-soft' as string]: persona.accentSoft,
  } as React.CSSProperties;

  return (
    <div className="op" style={accentVars}>
      <Suspense fallback={null}>
        <ProfilSync personas={personas} onChange={syncProfil} />
      </Suspense>
      <div className="op-switch-wrap">
        <div className="container op-switch-inner">
          <label className="op-switch-label" htmlFor="op-profil">{t('youAre')}</label>
          <select
            id="op-profil"
            className="op-select"
            value={active}
            onChange={(e) => changePersona(e.target.value as Persona['id'])}
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="op-hero">
        <div className="container op-hero-grid">
          <div>
            <span className="op-tag">{persona.tag}</span>
            <h1 className="fil-rouge">{highlight(persona.h1, persona.accentWord)}</h1>
            <p className="op-lead">{persona.lead}</p>
            <div className="op-cta-row">
              <Link className="op-btn-primary" href="/contact">{persona.ctaPrimary} →</Link>
              <Link className="op-btn-ghost" href="/datacenters">{t('seeSites')}</Link>
            </div>
            <div className="op-proofs">
              {persona.proofs.map((pr, i) => (
                <span className="op-proof" key={i}><span className="op-proof-dot" />{pr}</span>
              ))}
            </div>
          </div>

          <aside className="op-enjeux">
            <p className="op-enjeux-label">{t('dailyChallenges')}</p>
            <div className="op-enjeux-list">
              {persona.enjeux.map((e, i) => (
                <div className="op-enjeu" key={i}>
                  <span className="op-enjeu-icon"><OffreIcon name={e.icon} /></span>
                  <div>
                    <strong>{e.titre}</strong>
                    <span>{e.texte}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section op-problems">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ color: 'var(--op-accent)' }}>{t('challenges')}</span>
            <h2 className="fil-rouge">{highlight(persona.problemesTitre, persona.accentWord)}</h2>
          </div>
          <div className="op-grid">
            {persona.problemes.map((p, i) => (
              <article className="op-card" key={i}>
                <span className="op-card-icon"><OffreIcon name={p.icon} /></span>
                <h3>{p.titre}</h3>
                <p>{p.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section op-answers">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ color: 'var(--op-accent)' }}>{t('ourAnswer')}</span>
            <h2 className="fil-rouge">{highlight(persona.reponsesTitre, persona.accentWord)}</h2>
          </div>
          <div className="op-grid">
            {persona.reponses.map((r, i) => (
              <article className="op-answer" key={i}>
                <span className="op-answer-num">{r.num}</span>
                <h3>{r.titre}</h3>
                <p>{r.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="kpi-band">
        <div className="container kpi-grid">
          {persona.stats.map((s, i) => (
            <div className="kpi" key={i}>
              <div className="kpi-val" style={{ color: 'var(--op-accent)' }}>{s.num}</div>
              <div className="kpi-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section op-faq">
        <div className="container op-faq-inner">
          <div className="section-head">
            <span className="eyebrow" style={{ color: 'var(--op-accent)' }}>{t('faqEyebrow')}</span>
            <h2 className="fil-rouge">{highlight(persona.faqTitre, persona.accentWord)}</h2>
          </div>
          <div className="op-faq-list">
            {persona.faq.map((item, i) => (
              <div className={`op-faq-row${openFaq === i ? ' open' : ''}`} key={i}>
                <button
                  type="button"
                  className="op-faq-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="op-faq-toggle" aria-hidden="true">+</span>
                </button>
                {/* Toujours dans le HTML (lisible par les moteurs), masquée si fermée. */}
                <div className="op-faq-a" hidden={openFaq !== i}>{item.a}</div>
              </div>
            ))}
          </div>
          <div className="op-faq-cta">
            <p>{t('faqCta')}</p>
            <AskQuestionButton accent="var(--op-accent)" />
          </div>
        </div>
      </section>

      <section className="section op-final">
        <div className="container">
          <h2 className="fil-rouge">{t('finalTitle')}</h2>
          <p className="op-final-lead">{t('finalLead')}</p>
          <div className="op-cta-row">
            <Link className="op-btn-primary" href="/contact">{persona.ctaPrimary} →</Link>
            <Link className="op-btn-ghost" href="/datacenters">{t('discoverDc')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
