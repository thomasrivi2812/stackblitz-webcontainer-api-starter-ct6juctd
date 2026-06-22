// Helper client partagé par tous les formulaires/modales du site.
// Envoie la capture vers /api/lead (qui relaie ensuite vers WordPress).

export type LeadType = 'contact' | 'question' | 'brochure' | 'download';

export type LeadPayload = {
  type: LeadType;
  email: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  entreprise?: string;
  objet?: string;
  message?: string;
  ressource?: string;
  /** Champ honeypot anti-spam (doit rester vide). */
  hp?: string;
};

export async function sendLead(payload: LeadPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        source_url: typeof window !== 'undefined' ? window.location.href : '',
      }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    return Boolean(res.ok && data.ok);
  } catch {
    return false;
  }
}
