'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { DocVideo } from '@/lib/wordpress';
import { DIDOMI_ENABLED, DIDOMI_VENDORS, didomiVendorConsent, onDidomiConsent, showDidomiPreferences } from '@/lib/didomi';
import { imgProps } from '@/lib/image';

// Carte vidéo de la page Documentation : vignette (image WP, sinon vignette
// YouTube déduite de l'URL, sinon dégradé NDC) + bouton lecture + durée.
// Clic → modale avec lecteur intégré (youtube-nocookie / Vimeo, autorisés
// par la CSP frame-src) ; URL non reconnue → ouverture dans un nouvel onglet.
//
// Consentement (RGPD) : le lecteur YouTube/Vimeo peut déposer des cookies.
// Il n'est chargé que si le visiteur a accepté ce fournisseur dans Didomi ;
// sinon la modale l'informe et propose « Accepter et lire » (consentement
// pour cette lecture), l'ouverture sur la plateforme, ou les préférences.
// Les vignettes YouTube passent par l'optimiseur d'images du site : le
// navigateur du visiteur ne contacte pas Google avant d'avoir cliqué.

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
  const vendor = yt ? DIDOMI_VENDORS.youtube : DIDOMI_VENDORS.vimeo;
  const platform = yt ? 'YouTube' : 'Vimeo';
  // Sans CMP (bannière désactivée), rien à recueillir : lecture directe.
  const [consented, setConsented] = useState(!DIDOMI_ENABLED);
  const [playOnce, setPlayOnce] = useState(false);
  const canPlay = consented || playOnce;

  useEffect(() => {
    if (!embed || !DIDOMI_ENABLED) return;
    const sync = () => setConsented(didomiVendorConsent(vendor));
    sync();
    onDidomiConsent(sync);
  }, [embed, vendor]);

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
        {video.image ? (
          <img {...imgProps(video.image, '(max-width: 768px) 100vw, 33vw')} alt="" loading="lazy" />
        ) : yt ? (
          <Image src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" width={480} height={270} sizes="(max-width: 700px) 100vw, 400px" />
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
              {canPlay ? (
                <iframe
                  src={embed}
                  title={video.titre}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="vdc-consent">
                  <p>{t('videoConsentText', { platform })}</p>
                  <div className="vdc-consent-actions">
                    <button type="button" className="btn btn-primary" onClick={() => setPlayOnce(true)}>
                      {t('videoConsentPlay')}
                    </button>
                    <a className="btn btn-ghost" href={video.url} target="_blank" rel="noopener noreferrer">
                      {t('videoConsentExternal', { platform })}
                    </a>
                  </div>
                  <button type="button" className="vdc-consent-manage" onClick={showDidomiPreferences}>
                    {t('videoConsentManage')}
                  </button>
                </div>
              )}
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
            .vdc-consent{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;text-align:center;color:#fff;background:linear-gradient(150deg,#1b3360 0%,#142849 100%)}
            .vdc-consent p{max-width:520px;margin:0;line-height:1.5}
            .vdc-consent-actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
            .vdc-consent .btn-primary{background:#fff;color:#1b3360;border-color:#fff}
            .vdc-consent .btn-ghost{color:#fff;border-color:#fff}
            .vdc-consent-manage{background:none;border:0;color:#aebed8;text-decoration:underline;cursor:pointer;font:inherit;font-size:14px}
          `}</style>
        </div>
      )}
    </>
  );
}
