'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { sendLead } from '@/lib/send-lead';
import { useFocusTrap } from '@/lib/useFocusTrap';
import type { Livret } from '@/lib/wordpress';

// Carte « livret » de la page Documentation : couverture cliquable → modale
// avec description + bouton Télécharger. Le clic sur le bouton révèle un
// champ e-mail (capture de lead type « download ») avant de lancer le
// téléchargement. Styles encapsulés (comme la modale brochure).

export function LivretCard({ livret }: { livret: Livret }) {
  const t = useTranslations('documentation');
  const [open, setOpen] = useState(false);
  const [askEmail, setAskEmail] = useState(false); // input révélé sous le bouton
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const cardRef = useFocusTrap<HTMLDivElement>(open);

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
    setTimeout(() => { setAskEmail(false); setDone(false); setError(''); }, 200);
  }

  function download() {
    if (!livret.fichierUrl) return;
    const a = document.createElement('a');
    a.href = livret.fichierUrl;
    a.download = `${livret.titre}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('errEmail'));
      return;
    }
    if (!consent) {
      setError(t('errConsent'));
      return;
    }
    setError('');
    // Lead enregistré côté WP (sans bloquer le téléchargement si l'API est indisponible).
    void sendLead({ type: 'download', email, ressource: livret.titre });
    download();
    setDone(true);
  }

  // Format choisi dans WP : paysage = couverture 16:9 (slides), carte élargie.
  const paysage = livret.format === 'paysage';

  const cover = (
    <span className={`lvc-cover${paysage ? ' lvc-cover--paysage' : ''}`}>
      {livret.cover?.sourceUrl ? (
        <img src={livret.cover.sourceUrl} alt={livret.cover.altText || livret.titre} loading="lazy" />
      ) : (
        <span className="lvc-cover-ph" aria-hidden="true">
          <span className="lvc-ph-mark">N|D|C</span>
          <span className="lvc-ph-title">{livret.titre}</span>
        </span>
      )}
    </span>
  );

  return (
    <>
      <button type="button" className={`lvc-card${paysage ? ' lvc-card--paysage' : ''}`} onClick={() => setOpen(true)}>
        {cover}
        <span className="lvc-name">{livret.titre}</span>
      </button>

      {open && (
        <div className="lvc-overlay" role="dialog" aria-modal="true" aria-labelledby={`lvc-title-${livret.slug}`} onClick={close}>
          <div className="lvc-modal" ref={cardRef} onClick={(e) => e.stopPropagation()}>
            <button className="lvc-close" aria-label={t('close')} onClick={close}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            <div className={`lvc-modal-grid${paysage ? ' lvc-modal-grid--paysage' : ''}`}>
              <div className="lvc-modal-cover">{cover}</div>

              <div className="lvc-modal-body">
                {!done ? (
                  <>
                    <span className="lvc-eyebrow"><span className="lvc-dot" aria-hidden="true" />{t('eyebrowModal')}</span>
                    <h3 className="lvc-title" id={`lvc-title-${livret.slug}`}>{livret.titre}</h3>
                    {livret.description && <p className="lvc-desc">{livret.description}</p>}

                    <button type="button" className="lvc-download" onClick={() => setAskEmail(true)} disabled={askEmail}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                      {t('downloadBtn')}
                    </button>

                    {/* Champ e-mail révélé sous le bouton */}
                    {askEmail && (
                      <div className="lvc-gate">
                        <label className="lvc-label" htmlFor={`lvc-email-${livret.slug}`}>{t('emailLabel')}</label>
                        <input
                          id={`lvc-email-${livret.slug}`}
                          type="email"
                          className="lvc-input"
                          placeholder={t('emailPlaceholder')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                          autoFocus
                        />
                        <label className="lvc-consent">
                          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                          <span>{t('consent')}</span>
                        </label>
                        {error && <p className="lvc-error">{error}</p>}
                        <button type="button" className="lvc-submit" onClick={submit}>{t('confirmBtn')}</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="lvc-done">
                    <div className="lvc-check">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <h3 className="lvc-title">{t('doneTitle')}</h3>
                    <p className="lvc-desc">
                      {t('doneText')}{' '}
                      {livret.fichierUrl && <a href={livret.fichierUrl} download>{t('doneLink')}</a>}
                    </p>
                    <button type="button" className="lvc-ghost" onClick={close}>{t('close')}</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <style>{`
            .lvc-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(10,20,36,.55);backdrop-filter:blur(4px);animation:lvc-fade .15s ease}
            @keyframes lvc-fade{from{opacity:0}to{opacity:1}}
            @keyframes lvc-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
            .lvc-modal{position:relative;width:100%;max-width:640px;background:var(--surface,#fff);color:var(--ink,#1b3360);border:1px solid var(--line,#e2e8f1);border-radius:14px;padding:34px 32px 30px;box-shadow:0 30px 80px -20px rgba(10,20,36,.55);animation:lvc-pop .18s ease;font-family:var(--font-jost,system-ui,sans-serif)}
            .lvc-close{position:absolute;top:14px;right:14px;display:grid;place-items:center;width:34px;height:34px;border:none;border-radius:8px;background:transparent;color:var(--muted,#5d6b85);cursor:pointer;transition:background .15s ease,color .15s ease;z-index:1}
            .lvc-close:hover{background:var(--surface-alt,#f1f5fa);color:var(--ink,#1b3360)}
            .lvc-modal-grid{display:grid;grid-template-columns:170px 1fr;gap:26px;align-items:start}
            .lvc-modal-grid--paysage{grid-template-columns:250px 1fr}
            .lvc-modal-cover .lvc-cover{box-shadow:0 18px 40px -18px rgba(20,40,73,.45)}
            @media (max-width:600px){.lvc-modal-grid,.lvc-modal-grid--paysage{grid-template-columns:1fr}.lvc-modal-cover{max-width:170px;margin:0 auto}.lvc-modal-grid--paysage .lvc-modal-cover{max-width:250px}}

            .lvc-eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--turquoise-700,#1c8cbd);margin-bottom:12px}
            .lvc-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--red,#ff0000);flex-shrink:0}
            .lvc-title{font-size:clamp(20px,2.6vw,25px);font-weight:700;line-height:1.15;letter-spacing:-.01em;color:var(--heading,#1b3360);margin:0 0 10px}
            .lvc-desc{color:var(--muted,#5d6b85);font-size:15px;line-height:1.6;margin:0 0 22px}
            .lvc-desc a{color:var(--marine,#1b3360);font-weight:600;text-decoration:underline;text-underline-offset:3px}

            .lvc-download{position:relative;display:inline-flex;align-items:center;gap:9px;padding:13px 22px;border:1.5px solid var(--marine,#1b3360);border-radius:8px;font:inherit;font-size:15px;font-weight:600;color:#fff;background:var(--marine,#1b3360);cursor:pointer;transition:background .15s ease,transform .15s ease}
            .lvc-download:hover:not(:disabled){background:var(--marine-800,#102240);transform:translateY(-1px)}
            .lvc-download:disabled{opacity:.55;cursor:default}

            .lvc-gate{margin-top:18px;padding-top:18px;border-top:1px solid var(--line,#e2e8f1);animation:lvc-pop .18s ease}
            .lvc-label{display:block;font-size:13px;font-weight:600;color:var(--heading,#1b3360);margin-bottom:7px}
            .lvc-input{width:100%;padding:11px 13px;border:1.5px solid var(--line,#e2e8f1);border-radius:8px;font:inherit;font-size:15px;background:var(--bg,#fff);color:var(--ink,#1b3360);margin-bottom:14px;transition:border-color .15s ease,box-shadow .15s ease}
            .lvc-input:focus{outline:none;border-color:var(--marine,#1b3360);box-shadow:0 0 0 3px rgba(27,51,96,.10)}
            .lvc-consent{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.5;color:var(--muted,#5d6b85);margin-bottom:14px;cursor:pointer}
            .lvc-consent input{margin-top:3px;flex-shrink:0;accent-color:var(--marine,#1b3360)}
            .lvc-error{color:var(--red,#ff0000);font-size:13px;margin:0 0 12px;font-weight:500}
            .lvc-submit{position:relative;width:100%;padding:13px 22px;border:1.5px solid var(--marine,#1b3360);border-radius:8px;font:inherit;font-size:14.5px;font-weight:600;color:#fff;background:var(--marine,#1b3360);cursor:pointer;transition:background .15s ease}
            .lvc-submit::after{content:'';position:absolute;left:14px;right:14px;bottom:5px;height:2px;background:var(--red,#ff0000);opacity:.85;border-radius:1px}
            .lvc-submit:hover{background:var(--marine-800,#102240)}

            .lvc-done{text-align:center;padding:12px 0}
            .lvc-check{width:54px;height:54px;margin:0 auto 14px;border-radius:50%;display:grid;place-items:center;background:rgba(27,51,96,.10);color:var(--marine,#1b3360)}
            .lvc-ghost{margin-top:10px;padding:12px 22px;border:1.5px solid var(--marine,#1b3360);border-radius:8px;font:inherit;font-weight:600;background:transparent;color:var(--marine,#1b3360);cursor:pointer;transition:background .15s ease,color .15s ease}
            .lvc-ghost:hover{background:var(--marine,#1b3360);color:#fff}
          `}</style>
        </div>
      )}
    </>
  );
}
