'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import { sendLead } from '@/lib/send-lead';
import { starterEntries, type KnowledgeEntry } from '@/lib/chatbot-knowledge';
import { buildIndex, match, smallTalk } from '@/lib/chatbot-match';

// Assistant du site — bulle en bas à droite.
// ------------------------------------------
// Il répond à partir des contenus réels du site (lib/chatbot-knowledge.ts :
// FAQ, FAQ par profil, data centers, services, certifications, actualités,
// intentions permanentes) au moyen d'une recherche lexicale locale
// (lib/chatbot-match.ts). Aucune IA, aucun appel réseau, aucune donnée qui
// sort du navigateur : la seule requête partante est le lead, quand le
// visiteur laisse son adresse.
//
// Trois issues, et non deux. Le moteur rend « je réponds », « précisez
// laquelle de ces pistes » ou « je passe la main ». La deuxième est celle qui
// manquait : sur cent entrées qui se recouvrent, l'égalité est fréquente, et
// trancher au hasard produisait des réponses assurées et fausses — le pire
// défaut possible sur un site B2B.
//
// Les styles vivent dans app/globals.css (préfixe « .ndcb- »). Ils étaient
// auparavant injectés en <style> dans le composant, ce qui cassait
// l'hydratation à chaque page : React échappe les apostrophes d'un enfant
// texte en « &#x27; », or les entités ne sont pas décodées dans une balise
// <style>.

type Msg =
  | { key: number; from: 'bot' | 'user'; kind: 'text'; text: string; anchor?: boolean }
  | { key: number; from: 'bot'; kind: 'link'; label: string; href: string }
  | { key: number; from: 'bot'; kind: 'choices'; ids: string[] }
  | { key: number; from: 'bot'; kind: 'email'; state: 'pending' | 'sent' | 'declined'; question: string };

const STORE_KEY = 'ndc-assistant-v1';
const STORE_TTL = 30 * 60 * 1000; // 30 min d'inactivité

type Stored = { msgs: Msg[]; open: boolean; declined: boolean; ts: number };

export function ChatBot({ entries = [] }: { entries?: KnowledgeEntry[] }) {
  // On passe par le namespace RACINE avec des clés pointées, et non par
  // `useTranslations('chatbot')`. La différence est cruciale : quand le
  // namespace demandé est absent du dictionnaire, next-intl lève une
  // exception dès la création du traducteur — ce qui ferait échouer le rendu
  // de TOUTES les pages, l'assistant étant monté dans le layout. Depuis la
  // racine, une clé manquante retombe sur son propre chemin : un libellé
  // bizarre, visible, corrigeable — mais le site reste debout.
  const root = useTranslations();
  const t = useCallback(
    (key: string) => {
      try {
        return root(`chatbot.${key}` as never);
      } catch {
        return key;
      }
    },
    [root],
  );
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [lastAnswered, setLastAnswered] = useState('');
  const [awaitingQuestion, setAwaitingQuestion] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [restored, setRestored] = useState(false);

  // Formulaire e-mail (un seul peut être en attente à la fois).
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [sending, setSending] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seq = useRef(0);
  const openedOnce = useRef(false);
  const wasOpen = useRef(false);

  // L'index est coûteux à construire (une centaine de documents) et ne dépend
  // que des entrées : une seule fois par montage.
  const index = useMemo(() => buildIndex(entries), [entries]);

  /* ---------------------------------------------------------------- *
   *  Environnement
   * ---------------------------------------------------------------- */

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const reduced = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- *
   *  Persistance
   * ---------------------------------------------------------------- *
   * Le fil survit à un rechargement et au retour navigateur. Il est écrit
   * SEULEMENT après que le visiteur a ouvert la bulle : c'est son geste qui
   * déclenche le service, condition de l'exemption de consentement. Rien
   * n'est écrit tant qu'il n'a rien demandé.
   */

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        if (s && Date.now() - s.ts < STORE_TTL && Array.isArray(s.msgs)) {
          seq.current = s.msgs.reduce((m, x) => Math.max(m, x.key), 0) + 1;
          setMsgs(s.msgs);
          setDeclined(!!s.declined);
          if (s.open) { openedOnce.current = true; setOpen(true); }
        } else {
          sessionStorage.removeItem(STORE_KEY);
        }
      }
    } catch {
      /* mode privé, stockage refusé : l'assistant fonctionne sans mémoire */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored || !openedOnce.current) return;
    try {
      const payload: Stored = { msgs, open, declined, ts: Date.now() };
      sessionStorage.setItem(STORE_KEY, JSON.stringify(payload));
    } catch {
      /* quota ou stockage refusé : sans conséquence */
    }
  }, [msgs, open, declined, restored]);

  const clearThread = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setMsgs([]);
    setDeclined(false);
    setAwaitingQuestion(false);
    setThinking(false);
    setLastAnswered('');
    setEmail('');
    setConsent(false);
    setEmailErr('');
    try { sessionStorage.removeItem(STORE_KEY); } catch { /* sans conséquence */ }
    push({ key: seq.current++, from: 'bot', kind: 'text', text: t('hello'), anchor: true });
  };

  /* ---------------------------------------------------------------- *
   *  Suggestions — contextualisées par la page consultée
   * ---------------------------------------------------------------- */

  const suggestions = useMemo(() => {
    const here = (pathname || '/').replace(/\/$/, '');
    const relevant = here && here !== ''
      ? entries.filter((e) => e.link?.href && e.link.href.replace(/#.*$/, '') === here)
      : [];
    const out: KnowledgeEntry[] = [];
    const seen = new Set<string>([lastAnswered]);
    for (const e of [...relevant, ...starterEntries(entries, 8)]) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      out.push(e);
      if (out.length === 4) break;
    }
    return out;
  }, [entries, pathname, lastAnswered]);

  /* ---------------------------------------------------------------- *
   *  Ouverture / fermeture
   * ---------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;
    openedOnce.current = true;
    if (msgs.length === 0) {
      setMsgs([{ key: seq.current++, from: 'bot', kind: 'text', text: t('hello'), anchor: true }]);
    }
    // Sur mobile le panneau occupe l'écran : donner le focus au champ y
    // ferait surgir le clavier avant même que le message d'accueil soit lu.
    if (!narrow) {
      const id = setTimeout(() => inputRef.current?.focus(), 150);
      timers.current.push(id);
    } else {
      const id = setTimeout(() => panelRef.current?.focus(), 60);
      timers.current.push(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Retour du focus sur la bulle à la fermeture : sans cela le clavier
  // repartait du début de la page.
  useEffect(() => {
    if (wasOpen.current && !open) bubbleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Les réponses différées ne doivent pas surgir après une fermeture.
  useEffect(() => {
    if (open) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setThinking(false);
  }, [open]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  // Défilement : on amène le DÉBUT de la dernière réponse en haut du cadre.
  // Coller au bas du fil laissait les réponses longues coupées.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const anchors = el.querySelectorAll<HTMLElement>('[data-anchor="1"]');
    const last = anchors[anchors.length - 1];
    const behavior: ScrollBehavior = reduced() ? 'auto' : 'smooth';
    if (last) el.scrollTo({ top: Math.max(0, last.offsetTop - el.offsetTop - 8), behavior });
    else el.scrollTo({ top: el.scrollHeight, behavior });
  }, [msgs, thinking]);

  // Fermeture à Échap, et au clic hors du panneau sur grand écran. Sur
  // mobile le panneau est plein écran : il n'y a pas de « dehors », et un
  // simple effleurement pendant le défilement fermerait la conversation.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);

    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      const start = down;
      down = null;
      if (!start) return;
      // Un glissement n'est pas un clic : on ne ferme pas sur un défilement.
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || bubbleRef.current?.contains(target)) return;
      setOpen(false);
    };
    if (!narrow) {
      document.addEventListener('pointerdown', onDown);
      document.addEventListener('pointerup', onUp);
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
    };
  }, [open, narrow]);

  /* ---------------------------------------------------------------- *
   *  Fil de conversation
   * ---------------------------------------------------------------- */

  const push = useCallback((...m: Msg[]) => setMsgs((prev) => [...prev, ...m]), []);

  /**
   * Diffère une réponse derrière un indicateur de saisie. Une réponse
   * instantanée donne l'impression d'un formulaire, pas d'une conversation,
   * et ne laisse pas le temps de lire ce qu'on vient d'envoyer. Le délai suit
   * la longueur de la réponse, entre 500 ms et 1,4 s.
   */
  const reply = useCallback((...m: Msg[]) => {
    const chars = m.reduce((n, x) => n + (x.kind === 'text' ? x.text.length : 0), 0);
    const delay = Math.min(1400, 500 + chars * 2.2);
    const marked = m.map((x, i) => (i === 0 && x.kind === 'text' ? { ...x, anchor: true } : x));
    setThinking(true);
    const id = setTimeout(() => {
      setThinking(false);
      push(...marked);
    }, delay);
    timers.current.push(id);
  }, [push]);

  const nextKey = () => seq.current++;

  /** Un seul formulaire e-mail en attente : les précédents sont clos. */
  function askEmail(question: string) {
    setMsgs((prev) =>
      prev.map((m) => (m.kind === 'email' && m.state === 'pending' ? { ...m, state: 'declined' } : m)),
    );
    setEmailErr('');
    // Après un premier refus, on ne remet pas le formulaire dans les pattes du
    // visiteur : on lui donne la page contact et il décide.
    if (declined) {
      reply(
        { key: nextKey(), from: 'bot', kind: 'text', text: t('noAnswerAgain') },
        { key: nextKey(), from: 'bot', kind: 'link', label: t('contactLink'), href: '/contact' },
      );
      return;
    }
    reply(
      { key: nextKey(), from: 'bot', kind: 'text', text: t('noAnswer') },
      { key: nextKey(), from: 'bot', kind: 'email', state: 'pending', question },
    );
  }

  function answerEntry(entry: KnowledgeEntry) {
    const out: Msg[] = [{ key: nextKey(), from: 'bot', kind: 'text', text: entry.answer }];
    if (entry.link) {
      out.push({ key: nextKey(), from: 'bot', kind: 'link', label: entry.link.label, href: entry.link.href });
    }
    setLastAnswered(entry.id);
    reply(...out);
  }

  /** Traite une question, d'où qu'elle vienne (saisie ou puce). */
  const ask = useCallback((q: string) => {
    const civil = smallTalk(q);
    if (civil) {
      reply({
        key: nextKey(),
        from: 'bot',
        kind: 'text',
        text: civil === 'greeting' ? t('hi') : civil === 'thanks' ? t('welcome') : t('bye'),
      });
      return;
    }
    const r = match(index, q);
    if (r.kind === 'answer') { answerEntry(r.entry); return; }
    if (r.kind === 'clarify') {
      // Quand deux entrées se tiennent, on RÉPOND d'abord avec la mieux
      // classée, puis on offre les autres pistes. Se contenter de faire
      // choisir imposait un clic de plus alors que la première réponse était
      // presque toujours la bonne — c'est ce que le jugement à l'aveugle des
      // deux moteurs a montré, et c'était son principal reproche.
      const [first, ...rest] = r.options;
      const out: Msg[] = [{ key: nextKey(), from: 'bot', kind: 'text', text: first.answer }];
      if (first.link) {
        out.push({ key: nextKey(), from: 'bot', kind: 'link', label: first.link.label, href: first.link.href });
      }
      if (rest.length) {
        out.push({ key: nextKey(), from: 'bot', kind: 'text', text: t('clarify') });
        out.push({ key: nextKey(), from: 'bot', kind: 'choices', ids: rest.map((e) => e.id) });
      }
      setLastAnswered(first.id);
      reply(...out);
      return;
    }
    askEmail(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, declined, t, reply]);

  function onChip(id: string, label: string) {
    if (thinking) return;
    push({ key: nextKey(), from: 'user', kind: 'text', text: label });
    if (id === 'other') {
      setAwaitingQuestion(true);
      reply({ key: nextKey(), from: 'bot', kind: 'text', text: t('askQuestion') });
      const tid = setTimeout(() => inputRef.current?.focus(), 200);
      timers.current.push(tid);
      return;
    }
    const entry = entries.find((e) => e.id === id);
    if (entry) answerEntry(entry);
  }

  function onSend() {
    const q = input.trim();
    if (!q || thinking) return;
    setInput('');
    setAwaitingQuestion(false);
    push({ key: nextKey(), from: 'user', kind: 'text', text: q });
    // La question saisie après « Autre question » passe désormais par le
    // moteur comme toutes les autres. Auparavant elle partait directement en
    // capture d'e-mail, sans jamais être confrontée à la base : le visiteur
    // qui cliquait sur cette puce n'obtenait plus aucune réponse, quelle que
    // soit sa question.
    ask(q);
  }

  /* ---------------------------------------------------------------- *
   *  Capture du lead
   * ---------------------------------------------------------------- */

  function closeEmail(state: 'sent' | 'declined') {
    setMsgs((prev) =>
      prev.map((m) => (m.kind === 'email' && m.state === 'pending' ? { ...m, state } : m)),
    );
  }

  function onDeclineEmail() {
    setDeclined(true);
    setEmailErr('');
    closeEmail('declined');
    reply({ key: nextKey(), from: 'bot', kind: 'text', text: t('emailSkipped') });
  }

  async function onSubmitEmail(e: React.FormEvent, question: string) {
    e.preventDefault();
    if (sending) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr(t('errEmail'));
      emailRef.current?.focus();
      return;
    }
    if (!consent) {
      setEmailErr(t('errConsent'));
      consentRef.current?.focus();
      return;
    }
    setEmailErr('');
    setSending(true);
    // Le résultat de l'envoi était ignoré : en cas d'échec réseau, le
    // visiteur lisait « c'est noté » et le lead était perdu sans que
    // personne ne le sache.
    const ok = await sendLead({
      type: 'question',
      email,
      objet: t('leadSubject'),
      message: question,
    });
    setSending(false);
    if (!ok) { setEmailErr(t('errSend')); return; }
    closeEmail('sent');
    push({ key: nextKey(), from: 'user', kind: 'text', text: email });
    reply({ key: nextKey(), from: 'bot', kind: 'text', text: t('emailDone') });
    setEmail('');
    setConsent(false);
  }

  const emailPending = msgs.some((m) => m.kind === 'email' && m.state === 'pending');

  /* ---------------------------------------------------------------- *
   *  Rendu
   * ---------------------------------------------------------------- */

  return (
    <>
      <button
        ref={bubbleRef}
        type="button"
        className={`ndcb-bubble${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls="ndcb-panel"
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

      {open && (
        <div
          ref={panelRef}
          id="ndcb-panel"
          className="ndcb-panel"
          role="dialog"
          aria-modal={narrow}
          aria-labelledby="ndcb-title"
          tabIndex={-1}
        >
          <div className="ndcb-head">
            <div className="ndcb-head-text">
              <strong id="ndcb-title">{t('title')}</strong>
              {/* Sous-titre volontairement explicite : ni pastille verte ni
                  « un conseiller est en ligne ». Laisser croire à une
                  présence humaine se retourne contre la marque au premier
                  message sans réponse. */}
              <span>{t('subtitle')}</span>
            </div>
            <div className="ndcb-head-actions">
              {msgs.length > 1 && (
                <button type="button" className="ndcb-head-btn" onClick={clearThread} title={t('clear')} aria-label={t('clear')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                  </svg>
                </button>
              )}
              <button type="button" className="ndcb-head-btn" onClick={() => setOpen(false)} title={t('close')} aria-label={t('close')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>

          {/* role="log" : le rôle prévu pour un transcript de conversation.
              Il porte aria-live="polite" implicite, ce qui fait enfin
              annoncer les réponses aux lecteurs d'écran. tabIndex={0} rend
              le fil parcourable au clavier, puisqu'il défile. */}
          <div className="ndcb-body" ref={bodyRef} role="log" tabIndex={0} aria-label={t('threadLabel')}>
            {msgs.map((m) => {
              if (m.kind === 'text') {
                return (
                  <div key={m.key} className={`ndcb-msg ${m.from}`} data-anchor={m.anchor ? '1' : undefined}>
                    <span className="sr-only">{m.from === 'bot' ? t('srBot') : t('srUser')}</span>
                    {m.text}
                  </div>
                );
              }
              if (m.kind === 'link') {
                // Navigation client : un <a> brut rechargeait la page et
                // détruisait la conversation que le bot venait d'établir.
                return (
                  <Link key={m.key} className="ndcb-link" href={m.href}>
                    {m.label}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                );
              }
              if (m.kind === 'choices') {
                return (
                  <div key={m.key} className="ndcb-choices" role="group" aria-label={t('clarify')}>
                    {m.ids.map((id) => {
                      const e = entries.find((x) => x.id === id);
                      if (!e) return null;
                      return (
                        <button key={id} type="button" onClick={() => onChip(e.id, e.question)}>
                          {e.question}
                        </button>
                      );
                    })}
                  </div>
                );
              }
              if (m.state !== 'pending') return null;
              return (
                <form key={m.key} className="ndcb-emailform" onSubmit={(ev) => onSubmitEmail(ev, m.question)} noValidate>
                  <label className="sr-only" htmlFor="ndcb-email">{t('emailLabel')}</label>
                  <input
                    ref={emailRef}
                    id="ndcb-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="send"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    aria-invalid={!!emailErr || undefined}
                    aria-describedby={emailErr ? 'ndcb-email-err' : undefined}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                  <label className="ndcb-consent">
                    <input ref={consentRef} type="checkbox" checked={consent} onChange={(ev) => setConsent(ev.target.checked)} />
                    <span>{t('consent')}</span>
                  </label>
                  {emailErr && <p id="ndcb-email-err" className="ndcb-err" role="alert">{emailErr}</p>}
                  <div className="ndcb-emailactions">
                    <button type="submit" className="ndcb-submit" disabled={sending}>
                      {sending ? t('emailSending') : t('emailSubmit')}
                    </button>
                    <button type="button" className="ndcb-decline" onClick={onDeclineEmail}>{t('emailSkip')}</button>
                  </div>
                </form>
              );
            })}

            {thinking && (
              <div className="ndcb-typing" aria-hidden="true"><span /><span /><span /></div>
            )}
            {/* Région live permanente : une région créée en même temps que son
                contenu n'est pas annoncée. Celle-ci existe toujours, et c'est
                son texte qui change. */}
            <p className="sr-only" role="status">{thinking ? t('typing') : ''}</p>
          </div>

          {!emailPending && !awaitingQuestion && suggestions.length > 0 && (
            <div className="ndcb-suggest" role="group" aria-label={t('suggestions')}>
              {suggestions.map((e) => (
                // aria-disabled et non disabled : un bouton qui devient
                // disabled pendant qu'on l'active perd le focus clavier.
                <button key={e.id} type="button" aria-disabled={thinking} onClick={() => onChip(e.id, e.question)}>
                  {e.question}
                </button>
              ))}
              <button type="button" aria-disabled={thinking} onClick={() => onChip('other', t('chipOther'))}>
                {t('chipOther')}
              </button>
            </div>
          )}

          <div className="ndcb-foot">
            <label className="sr-only" htmlFor="ndcb-input">{t('inputLabel')}</label>
            <input
              ref={inputRef}
              id="ndcb-input"
              type="text"
              enterKeyHint="send"
              placeholder={awaitingQuestion ? t('askQuestionPlaceholder') : t('inputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSend(); } }}
            />
            <button type="button" aria-label={t('send')} aria-disabled={thinking} onClick={onSend}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
