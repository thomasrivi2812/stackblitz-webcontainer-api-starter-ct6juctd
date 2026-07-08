'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DocVideo } from '@/lib/wordpress';

// Carte vidéo de la page Documentation : vignette (image WP, sinon vignette
// YouTube déduite de l'URL, sinon dégradé NDC) + bouton lecture + durée.
// Clic → modale avec lecteur intégré (youtube-nocookie / Vimeo, autorisés
// par la CSP frame-src) ; URL non reconnue → ouverture dans un nouvel onglet.

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function embedUrl(url: string): string | null {
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1`;
  const vm = vimeoId(url);
  if (vm) return `https://player.vimeo.com/video/${vm}?autoplay=1`;
  return null;
}

export function VideoCard({ video }: { video: DocVideo }) {
  const t = useTranslations('documentation');
  const [open, setOpen] = useState(false);
  const embed = embedUrl(video.url);
  const yt = youtubeId(video.url);
  const thumb = video.image || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const media = (
    <>
      <span className="vdc-media">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" />
        ) : (
          <span className="vdc-media-ph" aria-hidden="true" />
        )}
        <span className="vdc-play" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
        </span>
        {video.duree && <span className="vdc-duration">{video.duree}</span>}
      </span>
      <span className="vdc-body">
        {video.categorie && <span className="vdc-cat">{video.categorie}</span>}
        <span className="vdc-title">{video.titre}</span>
      </span>
    </>
  );

  return (
    <>
      {embed ? (
        <button type="button" className="vdc-card" onClick={() => setOpen(true)} aria-label={`${t('playVideo')} — ${video.titre}`}>
          {media}
        </button>
      ) : (
        <a className="vdc-card" href={video.url} target="_blank" rel="noopener noreferrer">
          {media}
        </a>
      )}

      {open && embed && (
        <div className="vdc-overlay" role="dialog" aria-modal="true" aria-label={video.titre} onClick={() => setOpen(false)}>
          <div className="vdc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vdc-close" aria-label={t('close')} onClick={() => setOpen(false)} autoFocus>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <div className="vdc-frame">
              <iframe
                src={embed}
                title={video.titre}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <style>{`
            .vdc-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(10,20,36,.72);backdrop-filter:blur(4px);animation:vdc-fade .15s ease}
            @keyframes vdc-fade{from{opacity:0}to{opacity:1}}
            .vdc-modal{position:relative;width:100%;max-width:960px}
            .vdc-close{position:absolute;top:-44px;right:0;display:grid;place-items:center;width:36px;height:36px;border:none;border-radius:8px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;transition:background .15s ease}
            .vdc-close:hover{background:rgba(255,255,255,.25)}
            .vdc-frame{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 30px 90px -20px rgba(0,0,0,.7)}
            .vdc-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
          `}</style>
        </div>
      )}
    </>
  );
}
