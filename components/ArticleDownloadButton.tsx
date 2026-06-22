'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { sendLead } from '@/lib/send-lead';

type Props = {
  url: string;
  title?: string;
};

export function ArticleDownloadButton({ url, title = 'Document' }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // déclenche l'animation d'entrée juste après le montage du DOM
    const t = requestAnimationFrame(() => setAnimateIn(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') doClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(t);
    };
  }, [open]);

  function doClose() {
    setAnimateIn(false);
    // laisse le temps à l'animation de sortie de jouer avant le démontage
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      setError('');
    }, 180);
  }

  function handleSubmit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Merci de saisir une adresse e-mail valide.');
      return;
    }
    if (!consent) {
      setError('Merci de cocher la case.');
      return;
    }
    setError('');
    void sendLead({ type: 'download', email, ressource: title });
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDone(true);
  }

  const blue: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%', padding: '13px 24px', borderRadius: 10,
    fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
    background: '#2dafe6', color: '#fff', fontFamily: 'inherit',
  };

  // Modale rendue dans document.body via un portal -> jamais piégée par un parent sticky/transform.
  const modal = (
    <div
      onClick={doClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,20,36,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        opacity: animateIn ? 1 : 0,
        transition: 'opacity 180ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 460,
          background: '#fff', borderRadius: 14, padding: 32,
          boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          fontFamily: 'inherit',
          transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
          opacity: animateIn ? 1 : 0,
          transition: 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease',
        }}
      >
        <button
          onClick={doClose}
          aria-label="Fermer"
          style={{
            position: 'absolute', top: 14, right: 16, background: 'none',
            border: 'none', fontSize: 28, color: '#5d6b85', cursor: 'pointer',
            lineHeight: 1, padding: 0,
          }}
        >
          &#215;
        </button>

        {!done ? (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1c8cbd', marginBottom: 8 }}>
              Ressource
            </p>
            <h3 style={{ fontSize: 22, margin: '0 0 10px', color: '#1b3360' }}>
              Télécharger le document
            </h3>
            <p style={{ color: '#5d6b85', fontSize: 14.5, marginBottom: 20, lineHeight: 1.55 }}>
              Renseignez votre e-mail professionnel pour accéder à&nbsp;:
              <br />
              <strong style={{ color: '#1b3360' }}>{title}</strong>
            </p>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1b3360', marginBottom: 6 }}>
              E-mail professionnel
            </label>
            <input
              type="email"
              placeholder="nom@entreprise.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              autoFocus
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 8,
                border: '1.5px solid #e2e8f1', fontSize: 15, fontFamily: 'inherit',
                color: '#1b3360', marginBottom: 16, boxSizing: 'border-box',
              }}
            />
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#5d6b85', marginBottom: 16, cursor: 'pointer', lineHeight: 1.45 }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <span>
                J&rsquo;accepte d&rsquo;être recontacté par Nation Data Center conformément à la politique de confidentialité.
              </span>
            </label>
            {error !== '' && (
              <div style={{ color: '#e3051b', fontSize: 13, marginBottom: 14 }}>{error}</div>
            )}
            <button type="button" style={blue} onClick={handleSubmit}>
              Télécharger le document
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%', background: '#e8f6fb', color: '#1c8cbd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 style={{ fontSize: 22, marginBottom: 10, color: '#1b3360' }}>Merci !</h3>
            <p style={{ color: '#5d6b85', fontSize: 14.5, marginBottom: 22 }}>
              Votre téléchargement a démarré.
            </p>
            <button
              type="button"
              onClick={doClose}
              style={{ ...blue, background: '#fff', color: '#1b3360', border: '1.5px solid #e2e8f1' }}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button type="button" style={blue} onClick={() => setOpen(true)}>
        Télécharger
      </button>
      {open && mounted && createPortal(modal, document.body)}
    </>
  );
}
