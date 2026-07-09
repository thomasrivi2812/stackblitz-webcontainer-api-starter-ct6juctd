'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

// Boutons de partage d'un article (URL et titre réels de la page) :
//  - variant "header" : rangée compacte dans le hero (PARTAGER · LinkedIn · Copier le lien)
//  - variant "box"    : encart sous le corps de l'article (LinkedIn · E-mail · URL + Copier)
// Le partage LinkedIn passe par share-offsite (aucun SDK, aucun cookie tiers).

function LinkedInIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.98h4v12H3zM9 8.98h3.8v1.64h.05a4.17 4.17 0 013.75-2.06c4 0 4.75 2.64 4.75 6.07v6.35h-4v-5.63c0-1.34 0-3.07-1.87-3.07s-2.16 1.46-2.16 2.97v5.73H9z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

interface Props {
  url: string;
  title: string;
  variant: 'header' | 'box';
}

export function ShareButtons({ url, title, variant }: Props) {
  const t = useTranslations('actualites');
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Repli si l'API clipboard est bloquée (contexte non sécurisé).
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  if (variant === 'header') {
    return (
      <div className="share-row">
        <span className="share-row-label">{t('share')}</span>
        <a
          className="share-round"
          href={linkedinHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('share')} — LinkedIn`}
        >
          <LinkedInIcon />
        </a>
        <button type="button" className={`share-pill ${copied ? 'copied' : ''}`} onClick={copy}>
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? t('copied') : t('copyLink')}
        </button>
      </div>
    );
  }

  return (
    <div className="share-box">
      <h3>{t('shareBoxTitle')}</h3>
      <p>{t('shareBoxText')}</p>
      <div className="share-box-actions">
        <a
          className="share-box-btn linkedin"
          href={linkedinHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedInIcon />
          {t('shareLinkedin')}
        </a>
        <a className="share-box-btn" href={mailHref}>
          <MailIcon />
          {t('shareEmail')}
        </a>
        <div className="share-box-url">
          {/* URL affichée sans protocole (copie = URL complète) */}
          <span>{url.replace(/^https?:\/\//, '')}</span>
          <button type="button" className={copied ? 'copied' : ''} onClick={copy}>
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>
    </div>
  );
}
