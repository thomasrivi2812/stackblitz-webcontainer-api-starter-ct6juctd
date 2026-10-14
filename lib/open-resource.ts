// Accès à un document (brochure, plaquette, livret, document d'article).
// Spécification formulaires V1 :
//  - la demande est enregistrée dans WordPress AVANT l'ouverture du document ;
//  - en cas d'échec : message d'erreur, document NON ouvert ;
//  - ouverture dans un nouvel onglet (comportement target=_blank) ;
//  - aucun document ni lien n'est envoyé par e-mail.
//
// À appeler directement dans le gestionnaire du clic : l'onglet est ouvert
// tout de suite (vide) puis dirigé vers le document une fois l'enregistrement
// confirmé — sinon le navigateur bloquerait l'ouverture comme une pop-up.
import { sendLead, type LeadType } from './send-lead';

export type ResourceRequest = {
  type: Extract<LeadType, 'brochure' | 'download'>;
  email: string;
  /** Nom du document tel qu'affiché (titre du livret, de la plaquette…). */
  ressource: string;
  /** Catégorie : Brochure, Plaquette data center, Livret, Document d'article. */
  categorie: string;
  /** Langue du document (= langue de la page). */
  langue: string;
  /** Adresse du document à ouvrir. */
  url: string;
};

/** 'opened' : document ouvert · 'blocked' : enregistré mais onglet bloqué (afficher le lien) · 'error' : non enregistré. */
export type ResourceResult = 'opened' | 'blocked' | 'error';

export async function openResource(r: ResourceRequest): Promise<ResourceResult> {
  // Onglet ouvert pendant le clic (sinon bloqué), sans accès à cette page.
  const tab = window.open('', '_blank');
  if (tab) {
    try {
      tab.opener = null;
      tab.document.title = '…';
    } catch {
      /* sans conséquence */
    }
  }
  const absolute = new URL(r.url, window.location.href).href;
  const ok = await sendLead({
    type: r.type,
    email: r.email,
    ressource: r.ressource,
    categorie: r.categorie,
    langue: r.langue,
    ressource_url: absolute,
  });
  if (!ok) {
    tab?.close();
    return 'error';
  }
  if (tab && !tab.closed) {
    tab.location.href = absolute;
    return 'opened';
  }
  return 'blocked';
}
