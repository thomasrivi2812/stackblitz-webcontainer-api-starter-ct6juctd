'use client';

import { useEffect, useState } from 'react';

// Bouton « Télécharger la brochure » → vraie popup modale (centrée, fond assombri).
// Les styles sont ENCAPSULÉS dans le composant pour ne pas dépendre de globals.css.
// L'email est capté côté client ; l'envoi vers Monday/Brevo se fera via une route serveur.

const PDF_URL = '/brochure-ndc.pdf';

export function BrochureButton({ className = 'btn btn-ghost' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
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

  function handleSubmit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Merci de saisir une adresse e-mail valide.');
      return;
    }
    if (!consent) {
      setError('Merci d’accepter d’être recontacté pour télécharger la brochure.');
      return;
    }
    setError('');
    // TODO (étape CRM) : POST { email } vers /api/lead → Monday/Brevo.
    console.log('[NDC] Lead brochure capté :', email);
    const a = document.createElement('a');
    a.href = PDF_URL;
    a.download = 'Brochure-Nation-Data-Center.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDone(true);
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        Télécharger notre brochure
      </button>

      {open && (
        <div className="ndcm-overlay" role="dialog" aria-modal="true" onClick={close}>
          <div className="ndcm-card" onClick={(e) => e.stopPropagation()}>
            <button className="ndcm-close" aria-label="Fermer" onClick={close}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {!done ? (
              <>
                <span className="ndcm-eyebrow">Ressource</span>
                <h3 className="ndcm-title">Télécharger la brochure NDC</h3>
                <p className="ndcm-text">Renseignez votre e-mail professionnel pour accéder à notre brochure complète.</p>

                <label className="ndcm-label" htmlFor="ndcm-email">E-mail professionnel</label>
                <input
                  id="ndcm-email"
                  type="email"
                  className="ndcm-input"
                  placeholder="prenom.nom@entreprise.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  autoFocus
                />

                <label className="ndcm-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>J’accepte d’être recontacté par Nation Data Center et la conservation de mes données conformément à la politique de confidentialité.</span>
                </label>

                {error && <p className="ndcm-error">{error}</p>}

                <button type="button" className="ndcm-submit" onClick={handleSubmit}>Recevoir la brochure</button>
              </>
            ) : (
              <div className="ndcm-done">
                <div className="ndcm-check">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 className="ndcm-title">Merci !</h3>
                <p className="ndcm-text">Votre téléchargement a démarré. S’il ne se lance pas, <a href={PDF_URL} download>cliquez ici</a>.</p>
                <button type="button" className="ndcm-ghost" onClick={close}>Fermer</button>
              </div>
            )}
          </div>

          <style>{`
            .ndcm-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(10,20,36,.6);backdrop-filter:blur(4px);animation:ndcm-fade .15s ease}
            @keyframes ndcm-fade{from{opacity:0}to{opacity:1}}
            @keyframes ndcm-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
            .ndcm-card{position:relative;width:100%;max-width:460px;background:var(--surface,#fff);color:var(--ink,#1b3360);border:1px solid var(--line,#e2e8f1);border-radius:12px;padding:36px;box-shadow:0 30px 80px -20px rgba(10,20,36,.55);animation:ndcm-pop .18s ease;font-family:var(--font-jost,system-ui,sans-serif)}
            .ndcm-close{position:absolute;top:14px;right:14px;display:grid;place-items:center;width:34px;height:34px;border:none;border-radius:8px;background:transparent;color:var(--muted,#5d6b85);cursor:pointer;transition:background .15s ease,color .15s ease}
            .ndcm-close:hover{background:var(--surface-alt,#f1f5fa);color:var(--ink,#1b3360)}
            .ndcm-eyebrow{display:inline-block;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--turquoise-700,#1c8cbd);margin-bottom:12px}
            .ndcm-title{position:relative;padding-left:16px;font-size:23px;font-weight:700;line-height:1.1;color:var(--heading,#1b3360);margin:0 0 10px}
            .ndcm-title::before{content:'';position:absolute;left:0;top:3px;bottom:3px;width:4px;border-radius:2px;background:var(--red,#ff0000)}
            .ndcm-text{color:var(--muted,#5d6b85);font-size:15px;line-height:1.5;margin:0 0 22px}
            .ndcm-label{display:block;font-size:13px;font-weight:600;color:var(--heading,#1b3360);margin-bottom:6px}
            .ndcm-input{width:100%;padding:12px 14px;border:1px solid var(--line,#e2e8f1);border-radius:8px;font:inherit;font-size:15px;background:var(--bg,#fff);color:var(--ink,#1b3360);margin-bottom:18px}
            .ndcm-input:focus{outline:none;border-color:var(--turquoise,#2dafe6);box-shadow:0 0 0 3px rgba(45,175,230,.18)}
            .ndcm-consent{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.45;color:var(--muted,#5d6b85);margin-bottom:18px;cursor:pointer}
            .ndcm-consent input{margin-top:3px;flex-shrink:0;accent-color:var(--turquoise,#2dafe6)}
            .ndcm-error{color:var(--red,#ff0000);font-size:13.5px;margin:0 0 14px}
            .ndcm-submit{width:100%;padding:13px 22px;border:none;border-radius:8px;font:inherit;font-size:15px;font-weight:600;color:#fff;background:var(--turquoise,#2dafe6);cursor:pointer;transition:background .15s ease,transform .15s ease}
            .ndcm-submit:hover{background:var(--turquoise-700,#1c8cbd);transform:translateY(-1px)}
            .ndcm-done{text-align:center}
            .ndcm-check{width:58px;height:58px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;background:rgba(45,175,230,.12);color:var(--turquoise-700,#1c8cbd)}
            .ndcm-done .ndcm-title{padding-left:0;text-align:center}
            .ndcm-done .ndcm-title::before{display:none}
            .ndcm-done a{color:var(--turquoise-700,#1c8cbd);font-weight:600}
            .ndcm-ghost{margin-top:8px;padding:11px 22px;border:1.5px solid var(--line,#e2e8f1);border-radius:8px;font:inherit;font-weight:600;background:transparent;color:var(--ink,#1b3360);cursor:pointer}
            .ndcm-ghost:hover{border-color:var(--turquoise,#2dafe6);color:var(--turquoise-700,#1c8cbd)}
          `}</style>
        </div>
      )}
    </>
  );
}
