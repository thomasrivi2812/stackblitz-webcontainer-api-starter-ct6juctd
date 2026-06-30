'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { sendLead } from '@/lib/send-lead';

type FormData = {
  prenom: string;
  nom: string;
  email: string;
  entreprise: string;
  telephone: string;
  objet: string;
  message: string;
  consent: boolean;
};

const INITIAL: FormData = {
  prenom: '',
  nom: '',
  email: '',
  entreprise: '',
  telephone: '',
  objet: '',
  message: '',
  consent: false,
};

// La valeur envoyée reste stable (FR) quelle que soit la langue → données de lead
// inchangées ; seul le libellé affiché est traduit via labelKey.
const OBJETS: { value: string; labelKey: string }[] = [
  { value: 'Demande de devis', labelKey: 'objDevis' },
  { value: 'Visite de site', labelKey: 'objVisite' },
  { value: 'Renseignements techniques', labelKey: 'objTech' },
  { value: 'Partenariat / presse', labelKey: 'objPartenariat' },
  { value: 'Autre', labelKey: 'objAutre' },
];

export function ContactForm() {
  const t = useTranslations('contactForm');
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.prenom.trim()) e.prenom = t('errFirstName');
    if (!form.nom.trim()) e.nom = t('errLastName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('errEmail');
    if (!form.objet) e.objet = t('errSubject');
    if (form.message.trim().length < 10) e.message = t('errMessage');
    if (!form.consent) e.consent = t('errConsent');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending');

    const ok = await sendLead({
      type: 'contact',
      email: form.email,
      prenom: form.prenom,
      nom: form.nom,
      telephone: form.telephone,
      entreprise: form.entreprise,
      objet: form.objet,
      message: form.message,
    });

    if (ok) {
      setStatus('done');
      setForm(INITIAL);
    } else {
      setStatus('error');
    }
  }

  /* ── Confirmation ── */
  if (status === 'done') {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>{t('successTitle')}</h3>
        <p>{t('successText')}</p>
        <button className="btn btn-ghost" onClick={() => setStatus('idle')}>
          {t('successAgain')}
        </button>
      </div>
    );
  }

  /* ── Formulaire ── */
  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Prénom + Nom */}
      <div className="contact-row">
        <div className="contact-field">
          <label className="contact-label" htmlFor="prenom">
            {t('firstName')} <span className="contact-req">*</span>
          </label>
          <input
            id="prenom"
            className={`contact-input ${errors.prenom ? 'has-error' : ''}`}
            type="text"
            placeholder={t('firstNamePlaceholder')}
            value={form.prenom}
            onChange={(e) => update('prenom', e.target.value)}
          />
          {errors.prenom && <span className="contact-error">{errors.prenom}</span>}
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="nom">
            {t('lastName')} <span className="contact-req">*</span>
          </label>
          <input
            id="nom"
            className={`contact-input ${errors.nom ? 'has-error' : ''}`}
            type="text"
            placeholder={t('lastNamePlaceholder')}
            value={form.nom}
            onChange={(e) => update('nom', e.target.value)}
          />
          {errors.nom && <span className="contact-error">{errors.nom}</span>}
        </div>
      </div>

      {/* Email + Téléphone */}
      <div className="contact-row">
        <div className="contact-field">
          <label className="contact-label" htmlFor="email">
            {t('email')} <span className="contact-req">*</span>
          </label>
          <input
            id="email"
            className={`contact-input ${errors.email ? 'has-error' : ''}`}
            type="email"
            placeholder={t('emailPlaceholder')}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          {errors.email && <span className="contact-error">{errors.email}</span>}
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="telephone">
            {t('phone')}
          </label>
          <input
            id="telephone"
            className="contact-input"
            type="tel"
            placeholder={t('phonePlaceholder')}
            value={form.telephone}
            onChange={(e) => update('telephone', e.target.value)}
          />
        </div>
      </div>

      {/* Entreprise */}
      <div className="contact-field">
        <label className="contact-label" htmlFor="entreprise">
          {t('company')}
        </label>
        <input
          id="entreprise"
          className="contact-input"
          type="text"
          placeholder={t('companyPlaceholder')}
          value={form.entreprise}
          onChange={(e) => update('entreprise', e.target.value)}
        />
      </div>

      {/* Objet */}
      <div className="contact-field">
        <label className="contact-label" htmlFor="objet">
          {t('subject')} <span className="contact-req">*</span>
        </label>
        <select
          id="objet"
          className={`contact-input contact-select ${errors.objet ? 'has-error' : ''}`}
          value={form.objet}
          onChange={(e) => update('objet', e.target.value)}
        >
          <option value="">{t('subjectPlaceholder')}</option>
          {OBJETS.map((o) => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </select>
        {errors.objet && <span className="contact-error">{errors.objet}</span>}
      </div>

      {/* Message */}
      <div className="contact-field">
        <label className="contact-label" htmlFor="message">
          {t('message')} <span className="contact-req">*</span>
        </label>
        <textarea
          id="message"
          className={`contact-input contact-textarea ${errors.message ? 'has-error' : ''}`}
          placeholder={t('messagePlaceholder')}
          rows={6}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
        />
        {errors.message && <span className="contact-error">{errors.message}</span>}
      </div>

      {/* Consentement */}
      <label className={`contact-consent ${errors.consent ? 'has-error' : ''}`}>
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => update('consent', e.target.checked)}
        />
        <span>
          {t('consent1')}{' '}
          <a href="/politique-de-confidentialite">{t('consentLink')}</a>.
          <span className="contact-req"> *</span>
        </span>
      </label>
      {errors.consent && <span className="contact-error">{errors.consent}</span>}

      {/* Erreur globale */}
      {status === 'error' && (
        <div className="contact-global-error">
          {t('globalError')}
        </div>
      )}

      {/* Bouton */}
      <button
        className="btn btn-primary contact-submit"
        type="submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
