'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { sendLead } from '@/lib/send-lead';
import type { Faq } from '@/lib/wordpress';

// Assistant du site — bulle en bas à droite.
// 1) Répond aux questions déjà couvertes par la FAQ (chips + texte libre,
//    matching lexical sans dépendance externe).
// 2) Pour toute autre demande : capture l'e-mail dans le fil de discussion
//    (lead type « question » → visible dans WP > Leads du site) et prévient
//    que l'équipe recontactera.
// Styles encapsulés dans le composant (aucune dépendance à globals.css).

type Msg =
  | { from: 'bot' | 'user'; kind: 'text'; text: string }
  | { from: 'bot'; kind: 'chips'; chips: { id: string; label: string }[] }
  | { from: 'bot'; kind: 'email' };

/** Normalise pour le matching : minuscules, accents et ponctuation retirés. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  // FR
  'le','la','les','un','une','des','du','de','d','l','et','ou','a','au','aux','en','dans','sur','pour','par','avec','sans','que','qui','quoi','quel','quelle','quels','quelles','est','sont','ce','cette','ces','se','sa','son','ses','vos','votre','nos','notre','je','tu','il','elle','on','nous','vous','ils','elles','ne','pas','plus','moins','tres','bien','faire','fait','comment','pourquoi','combien','ya','y','il-y-a','peut','peux','veux','veut','avoir','etre','the',
  // EN
  'a','an','of','to','in','on','for','with','and','or','is','are','was','be','do','does','what','which','how','why','can','could','you','your','we','our','i','my','it','this','that','there','have','has',
]);

function tokens(s: string): string[] {
  return norm(s).split(' ').filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Score de similarité question ↔ FAQ : recouvrement de tokens + bonus racine. */
function scoreMatch(queryToks: string[], faqText: string): number {
  if (!queryToks.length) return 0;
  const faqToks = new Set(tokens(faqText));
  if (!faqToks.size) return 0;
  let hits = 0;
  for (const qt of queryToks) {
    if (faqToks.has(qt)) { hits += 1; continue; }
    // tolère pluriels/déclinaisons : racine commune de 4+ caractères
    for (const ft of faqToks) {
      if (qt.length >= 4 && ft.length >= 4 && (ft.startsWith(qt.slice(0, 4)) || qt.startsWith(ft.slice(0, 4)))) {
        hits += 0.6;
        break;
      }
    }
  }
  return hits / queryToks.length;
}

export function ChatBot({ faqs = [] }: { faqs?: Faq[] }) {
  const t = useTranslations('chatbot');
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [emailDone, setEmailDone] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chipsFor = (exclude?: string) => {
    const list = faqs
      .map((f, i) => ({ id: String(i), label: f.question }))
      .filter((c) => c.label !== exclude)
      .slice(0, 4);
    return [...list, { id: 'other', label: t('chipOther') }];
  };

  // Message d'accueil à la première ouverture.
  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        { from: 'bot', kind: 'text', text: t('hello') },
        { from: 'bot', kind: 'chips', chips: chipsFor() },
      ]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-scroll en bas à chaque message.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const push = (...m: Msg[]) => setMsgs((prev) => [...prev, ...m]);

  const emailMode = msgs.some((m) => m.kind === 'email') && !emailDone;

  function askEmail(question: string) {
    setPendingQuestion(question);
    push(
      { from: 'bot', kind: 'text', text: t('noAnswer') },
      { from: 'bot', kind: 'email' },
    );
  }

  function answerFaq(faq: Faq) {
    push(
      { from: 'bot', kind: 'text', text: faq.reponse },
      { from: 'bot', kind: 'text', text: t('anythingElse') },
      { from: 'bot', kind: 'chips', chips: chipsFor(faq.question) },
    );
  }

  function onChip(id: string, label: string) {
    if (emailMode) return;
    push({ from: 'user', kind: 'text', text: label });
    if (id === 'other') {
      askEmail('');
      return;
    }
    const faq = faqs[Number(id)];
    if (faq) answerFaq(faq);
  }

  function onSend() {
    const q = input.trim();
    if (!q || emailMode) return;
    setInput('');
    push({ from: 'user', kind: 'text', text: q });

    const toks = tokens(q);
    let best: { faq: Faq; score: number } | null = null;
    for (const f of faqs) {
      const s = Math.max(scoreMatch(toks, f.question) * 1.25, scoreMatch(toks, f.question + ' ' + f.reponse));
      if (!best || s > best.score) best = { faq: f, score: s };
    }
    if (best && best.score >= 0.5) {
      answerFaq(best.faq);
    } else {
      askEmail(q);
    }
  }

  async function onSubmitEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr(t('errEmail')); return; }
    if (!consent) { setEmailErr(t('errConsent')); return; }
    setEmailErr('');
    setEmailDone(true);
    void sendLead({
      type: 'question',
      email,
      objet: 'Chatbot du site',
      message: pendingQuestion || t('chipOther'),
    });
    push(
      { from: 'user', kind: 'text', text: email },
      { from: 'bot', kind: 'text', text: t('emailDone') },
    );
  }

  return (
    <>
      {/* Bulle flottante */}
      <button
        type="button"
        className={`ndcb-bubble${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-label={open ? t('close') : t('openLabel')}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" />
            <path d="M9 11h.01M12.5 11h.01M16 11h.01" />
          </svg>
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div className="ndcb-panel" role="dialog" aria-label={t('title')}>
          <div className="ndcb-head">
            <span className="ndcb-head-dot" aria-hidden="true" />
            <div className="ndcb-head-text">
              <strong>{t('title')}</strong>
              <span>{t('subtitle')}</span>
            </div>
          </div>

          <div className="ndcb-body" ref={bodyRef}>
            {msgs.map((m, i) => {
              if (m.kind === 'text') {
                return <div key={i} className={`ndcb-msg ${m.from}`}>{m.text}</div>;
              }
              if (m.kind === 'chips') {
                const isLast = i === msgs.length - 1;
                return (
                  <div key={i} className={`ndcb-chips${isLast ? '' : ' done'}`}>
                    {m.chips.map((c) => (
                      <button key={c.id + c.label} type="button" onClick={() => isLast && onChip(c.id, c.label)}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                );
              }
              // Formulaire e-mail dans le fil
              if (emailDone) return null;
              return (
                <div key={i} className="ndcb-emailform">
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmitEmail(); }}
                  />
                  <label className="ndcb-consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>{t('consent')}</span>
                  </label>
                  {emailErr && <p className="ndcb-err">{emailErr}</p>}
                  <button type="button" className="ndcb-submit" onClick={onSubmitEmail}>{t('emailSubmit')}</button>
                </div>
              );
            })}
          </div>

          <div className="ndcb-foot">
            <input
              ref={inputRef}
              type="text"
              placeholder={emailMode ? t('inputDisabled') : t('inputPlaceholder')}
              value={input}
              disabled={emailMode}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
            />
            <button type="button" aria-label={t('send')} disabled={emailMode} onClick={onSend}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ndcb-bubble{position:fixed;right:22px;bottom:22px;z-index:960;width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;background:var(--marine,#1b3360);color:#fff;box-shadow:0 12px 34px -10px rgba(10,20,36,.5);transition:transform .16s ease,background .16s ease}
        .ndcb-bubble:hover{transform:translateY(-2px);background:var(--marine-800,#102240)}
        .ndcb-bubble::after{content:'';position:absolute;top:9px;right:9px;width:9px;height:9px;border-radius:50%;background:var(--red,#ff0000);border:2px solid var(--marine,#1b3360)}
        .ndcb-bubble.is-open::after{display:none}

        .ndcb-panel{position:fixed;right:22px;bottom:92px;z-index:960;display:flex;flex-direction:column;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100dvh - 130px));background:var(--surface,#fff);border:1px solid var(--line,#e2e8f1);border-radius:16px;box-shadow:0 30px 80px -24px rgba(10,20,36,.5);overflow:hidden;animation:ndcb-pop .18s ease;font-family:var(--font-jost,system-ui,sans-serif)}
        @keyframes ndcb-pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}

        .ndcb-head{display:flex;align-items:center;gap:12px;padding:16px 18px;background:var(--marine,#1b3360);color:#fff}
        .ndcb-head-dot{width:9px;height:9px;border-radius:50%;background:#3fd68f;box-shadow:0 0 0 3px rgba(63,214,143,.25);flex-shrink:0}
        .ndcb-head-text{display:flex;flex-direction:column;line-height:1.25}
        .ndcb-head-text strong{font-size:15px}
        .ndcb-head-text span{font-size:12.5px;opacity:.75}

        .ndcb-body{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:var(--surface-alt,#f6f9fc)}
        .ndcb-msg{max-width:85%;padding:10px 13px;border-radius:12px;font-size:14px;line-height:1.5;white-space:pre-line}
        .ndcb-msg.bot{align-self:flex-start;background:var(--surface,#fff);border:1px solid var(--line,#e2e8f1);color:var(--ink,#1b3360);border-bottom-left-radius:4px}
        .ndcb-msg.user{align-self:flex-end;background:var(--marine,#1b3360);color:#fff;border-bottom-right-radius:4px}

        .ndcb-chips{display:flex;flex-wrap:wrap;gap:7px;padding:2px 0}
        .ndcb-chips button{border:1.5px solid var(--marine,#1b3360);background:transparent;color:var(--marine,#1b3360);font:inherit;font-size:12.5px;font-weight:600;padding:7px 12px;border-radius:999px;cursor:pointer;text-align:left;transition:background .14s ease,color .14s ease}
        .ndcb-chips button:hover{background:var(--marine,#1b3360);color:#fff}
        .ndcb-chips.done{display:none}

        .ndcb-emailform{align-self:stretch;background:var(--surface,#fff);border:1px solid var(--line,#e2e8f1);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px}
        .ndcb-emailform input[type=email]{width:100%;padding:10px 12px;border:1.5px solid var(--line,#e2e8f1);border-radius:8px;font:inherit;font-size:14px;color:var(--ink,#1b3360);background:var(--bg,#fff)}
        .ndcb-emailform input[type=email]:focus{outline:none;border-color:var(--marine,#1b3360)}
        .ndcb-consent{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:1.45;color:var(--muted,#5d6b85);cursor:pointer}
        .ndcb-consent input{margin-top:2px;flex-shrink:0;accent-color:var(--marine,#1b3360)}
        .ndcb-err{color:var(--red,#ff0000);font-size:12.5px;margin:0;font-weight:500}
        .ndcb-submit{position:relative;padding:11px 16px;border:1.5px solid var(--marine,#1b3360);border-radius:8px;font:inherit;font-size:14px;font-weight:600;color:#fff;background:var(--marine,#1b3360);cursor:pointer;transition:background .15s ease}
        .ndcb-submit:hover{background:var(--marine-800,#102240)}

        .ndcb-foot{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,#e2e8f1);background:var(--surface,#fff)}
        .ndcb-foot input{flex:1;padding:11px 13px;border:1.5px solid var(--line,#e2e8f1);border-radius:10px;font:inherit;font-size:14px;color:var(--ink,#1b3360);background:var(--bg,#fff)}
        .ndcb-foot input:focus{outline:none;border-color:var(--marine,#1b3360)}
        .ndcb-foot input:disabled{opacity:.55}
        .ndcb-foot button{width:44px;border:none;border-radius:10px;background:var(--marine,#1b3360);color:#fff;cursor:pointer;display:grid;place-items:center;transition:background .15s ease}
        .ndcb-foot button:hover:not(:disabled){background:var(--marine-800,#102240)}
        .ndcb-foot button:disabled{opacity:.55;cursor:default}

        @media (max-width: 480px){
          .ndcb-bubble{right:14px;bottom:14px;width:54px;height:54px}
          .ndcb-panel{right:14px;bottom:78px}
        }
        @media print{.ndcb-bubble,.ndcb-panel{display:none}}
      `}</style>
    </>
  );
}
