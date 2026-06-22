'use client';

import { useState } from 'react';
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

const OBJETS = [
  'Demande de devis',
  'Visite de site',
  'Renseignements techniques',
  'Partenariat / presse',
  'Autre',
];

export function ContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.prenom.trim()) e.prenom = 'Le prénom est requis.';
    if (!form.nom.trim()) e.nom = 'Le nom est requis.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse e-mail invalide.';
    if (!form.objet) e.objet = 'Veuillez sélectionner un objet.';
    if (form.message.trim().length < 10) e.message = 'Votre message doit contenir au moins 10 caractères.';
    if (!form.consent) e.consent = 'Veuillez accepter la politique de confidentialité.';
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
        <h3>Message envoyé !</h3>
        <p>
          Merci pour votre message. Nos équipes vous répondront dans les plus
          brefs délais, généralement sous 24 heures.
        </p>
        <button className="btn btn-ghost" onClick={() => setStatus('idle')}>
          Envoyer un autre message
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
            Prénom <span className="contact-req">*</span>
          </label>
          <input
            id="prenom"
            className={`contact-input ${errors.prenom ? 'has-error' : ''}`}
            type="text"
            placeholder="Jean"
            value={form.prenom}
            onChange={(e) => update('prenom', e.target.value)}
          />
          {errors.prenom && <span className="contact-error">{errors.prenom}</span>}
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="nom">
            Nom <span className="contact-req">*</span>
          </label>
          <input
            id="nom"
            className={`contact-input ${errors.nom ? 'has-error' : ''}`}
            type="text"
            placeholder="Dupont"
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
            E-mail professionnel <span className="contact-req">*</span>
          </label>
          <input
            id="email"
            className={`contact-input ${errors.email ? 'has-error' : ''}`}
            type="email"
            placeholder="jean.dupont@entreprise.fr"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          {errors.email && <span className="contact-error">{errors.email}</span>}
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="telephone">
            Téléphone
          </label>
          <input
            id="telephone"
            className="contact-input"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={form.telephone}
            onChange={(e) => update('telephone', e.target.value)}
          />
        </div>
      </div>

      {/* Entreprise */}
      <div className="contact-field">
        <label className="contact-label" htmlFor="entreprise">
          Entreprise
        </label>
        <input
          id="entreprise"
          className="contact-input"
          type="text"
          placeholder="Nom de votre entreprise"
          value={form.entreprise}
          onChange={(e) => update('entreprise', e.target.value)}
        />
      </div>

      {/* Objet */}
      <div className="contact-field">
        <label className="contact-label" htmlFor="objet">
          Objet de votre demande <span className="contact-req">*</span>
        </label>
        <select
          id="objet"
          className={`contact-input contact-select ${errors.objet ? 'has-error' : ''}`}
          value={form.objet}
          onChange={(e) => update('objet', e.target.value)}
        >
          <option value="">— Sélectionnez un objet —</option>
          {OBJETS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errors.objet && <span className="contact-error">{errors.objet}</span>}
      </div>

      {/* Message */}
      <div className="contact-field">
        <label className="contact-label" htmlFor="message">
          Votre message <span className="contact-req">*</span>
        </label>
        <textarea
          id="message"
          className={`contact-input contact-textarea ${errors.message ? 'has-error' : ''}`}
          placeholder="Décrivez votre projet ou votre besoin…"
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
          J'accepte que mes données soient traitées par Nation Data Center pour
          répondre à ma demande, conformément à la{' '}
          <a href="/politique-de-confidentialite">politique de confidentialité</a>.
          <span className="contact-req"> *</span>
        </span>
      </label>
      {errors.consent && <span className="contact-error">{errors.consent}</span>}

      {/* Erreur globale */}
      {status === 'error' && (
        <div className="contact-global-error">
          Une erreur est survenue. Veuillez réessayer ou nous contacter directement par e-mail.
        </div>
      )}

      {/* Bouton */}
      <button
        className="btn btn-primary contact-submit"
        type="submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer mon message'}
      </button>
    </form>
  );
}
