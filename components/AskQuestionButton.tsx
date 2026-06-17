'use client';

import { useEffect, useState } from 'react';

// Bouton « Poser votre question » → modale (email + question).
// L'email/question sont captés côté client ; l'envoi vers le CRM se fera via une route serveur.

export function AskQuestionButton({ accent = 'var(--op-accent)' }: { accent?: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setTimeout(() => { setDone(false); setError(''); }, 200);
  }

  function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Merci de saisir une adresse e-mail valide.');
      return;
    }
    if (question.trim().length < 5) {
      setError('Merci de détailler un peu votre question.');
      return;
    }
    setError('');
    // TODO (étape CRM) : POST { email, question } vers /api/question → Monday/Brevo.
    console.log('[NDC] Question posée :', { email, question });
    setDone(true);
  }

  return (
    <>
      <button type="button" className="aq-trigger" style={{ ['--aq-accent' as string]: accent } as React.CSSProperties} onClick={() => setOpen(true)}>
        Poser votre question
      </button>

      {open && (
        <div className="aq-overlay" role="dialog" aria-modal="true" onClick={close}>
          <div className="aq-card" style={{ ['--aq-accent' as string]: accent } as React.CSSProperties} onClick={(e) => e.stopPropagation()}>
            <button className="aq-close" aria-label="Fermer" onClick={close}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {!done ? (
              <>
                <span className="aq-eyebrow"><span className="aq-eyebrow-dot" aria-hidden="true" />Une question ?</span>
                <h3 className="aq-title">Poser votre question</h3>
                <p className="aq-text">Une question précise ? Laissez-nous votre e-mail et votre question, nous vous répondrons dans les plus brefs délais.</p>

                <label className="aq-label" htmlFor="aq-email">Votre e-mail</label>
                <input id="aq-email" type="email" className="aq-input" placeholder="prenom.nom@entreprise.fr"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />

                <label className="aq-label" htmlFor="aq-question">Votre question</label>
                <textarea id="aq-question" className="aq-input aq-textarea" rows={4} placeholder="Posez votre question ici…"
                  value={question} onChange={(e) => setQuestion(e.target.value)} />

                {error && <p className="aq-error">{error}</p>}

                <button type="button" className="aq-submit" onClick={submit}>Envoyer ma question</button>
              </>
            ) : (
              <div className="aq-done">
                <div className="aq-check">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 className="aq-title">Merci !</h3>
                <p className="aq-text">Votre question a bien été enregistrée. Nos équipes vous répondront dans les plus brefs délais.</p>
                <button type="button" className="aq-ghost" onClick={close}>Fermer</button>
              </div>
            )}
          </div>

          <style>{`
            .aq-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(10,20,36,.55);backdrop-filter:blur(4px);animation:aq-fade .15s ease}
            @keyframes aq-fade{from{opacity:0}to{opacity:1}}
            @keyframes aq-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
            .aq-card{position:relative;width:100%;max-width:500px;background:var(--surface,#fff);color:var(--ink,#1b3360);border:1px solid var(--line,#e2e8f1);border-radius:14px;padding:40px 36px 32px;box-shadow:0 30px 80px -20px rgba(10,20,36,.55);animation:aq-pop .18s ease;font-family:var(--font-jost,system-ui,sans-serif)}
            .aq-close{position:absolute;top:14px;right:14px;display:grid;place-items:center;width:34px;height:34px;border:none;border-radius:8px;background:transparent;color:var(--muted,#5d6b85);cursor:pointer;transition:background .15s ease,color .15s ease}
            .aq-close:hover{background:var(--surface-alt,#f1f5fa);color:var(--ink,#1b3360)}

            .aq-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--turquoise-700,#1c8cbd);margin-bottom:18px}
            .aq-eyebrow-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--red,#ff0000);flex-shrink:0}

            .aq-title{font-size:clamp(24px,3vw,28px);font-weight:700;line-height:1.1;letter-spacing:-0.02em;color:var(--heading,#1b3360);margin:0 0 12px;padding-left:14px;position:relative}
            .aq-title::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:3px;border-radius:2px;background:var(--red,#ff0000)}
            .aq-text{color:var(--muted,#5d6b85);font-size:15.5px;line-height:1.55;margin:0 0 26px}

            .aq-label{display:block;font-size:13px;font-weight:600;color:var(--heading,#1b3360);margin-bottom:8px;letter-spacing:.01em}
            .aq-input{width:100%;padding:12px 14px;border:1.5px solid var(--line,#e2e8f1);border-radius:8px;font:inherit;font-size:15px;background:var(--bg,#fff);color:var(--ink,#1b3360);margin-bottom:16px;transition:border-color .15s ease,box-shadow .15s ease}
            .aq-input:focus{outline:none;border-color:var(--aq-accent,var(--marine,#1b3360));box-shadow:0 0 0 3px color-mix(in srgb, var(--aq-accent,#1b3360) 14%, transparent)}
            .aq-textarea{resize:vertical;min-height:110px;line-height:1.5}

            .aq-error{color:var(--red,#ff0000);font-size:13.5px;margin:0 0 14px;font-weight:500}

            /* Submit : style btn-v2-primary (marine + accent rouge en bas) */
            .aq-submit{position:relative;width:100%;padding:15px 22px;border:1.5px solid var(--marine,#1b3360);border-radius:8px;font:inherit;font-size:15px;font-weight:600;color:#fff;background:var(--marine,#1b3360);cursor:pointer;transition:background .15s ease,transform .15s ease,border-color .15s ease;margin-top:6px}
            .aq-submit::after{content:'';position:absolute;left:14px;right:14px;bottom:6px;height:2px;background:var(--red,#ff0000);opacity:.85;border-radius:1px}
            .aq-submit:hover{background:var(--marine-800,#102240);border-color:var(--marine-800,#102240);transform:translateY(-1px)}

            .aq-done{text-align:center}
            .aq-check{width:58px;height:58px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb, var(--aq-accent,#1b3360) 14%, transparent);color:var(--aq-accent,var(--marine,#1b3360))}
            .aq-done .aq-title{padding-left:0;text-align:center}
            .aq-done .aq-title::before{display:none}

            /* Ghost : style btn-v2-ghost (bordure marine) */
            .aq-ghost{margin-top:8px;padding:13px 22px;border:1.5px solid var(--marine,#1b3360);border-radius:8px;font:inherit;font-weight:600;background:transparent;color:var(--marine,#1b3360);cursor:pointer;transition:background .15s ease,color .15s ease}
            .aq-ghost:hover{background:var(--marine,#1b3360);color:#fff}
          `}</style>
        </div>
      )}
    </>
  );
}
