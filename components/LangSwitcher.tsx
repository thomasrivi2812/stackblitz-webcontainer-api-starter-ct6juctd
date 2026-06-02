'use client';

import { useState } from 'react';

// Sélecteur de langue FR/EN (header) — styles encapsulés, indépendants de globals.css.
// À ce stade : bascule visuelle. Quand Polylang sera branché, il pilotera le routing /en/.

export function LangSwitcher() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  return (
    <div className="ndc-lang" role="group" aria-label="Choix de la langue">
      <button
        type="button"
        className={`ndc-lang-opt${lang === 'fr' ? ' is-active' : ''}`}
        aria-pressed={lang === 'fr'}
        onClick={() => setLang('fr')}
      >
        FR
      </button>
      <button
        type="button"
        className={`ndc-lang-opt${lang === 'en' ? ' is-active' : ''}`}
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
      >
        EN
      </button>

      <style>{`
        .ndc-lang{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--line,#e2e8f1);border-radius:8px;background:var(--surface-alt,#f6f9fc)}
        .ndc-lang-opt{border:none;background:transparent;cursor:pointer;font:inherit;font-size:13px;font-weight:600;color:var(--muted,#5d6b85);padding:5px 10px;border-radius:6px;transition:background .15s ease,color .15s ease}
        .ndc-lang-opt:hover{color:var(--heading,#1b3360)}
        .ndc-lang-opt.is-active{background:var(--surface,#fff);color:var(--heading,#1b3360);box-shadow:0 1px 3px rgba(20,40,73,.12)}
      `}</style>
    </div>
  );
}
