# Formulaires V1 — mise en œuvre de la spécification

Spécification : « Formulaire de contact et accès aux ressources documentaires » (v1.0, 6 octobre 2026).

## Installation

1. **WordPress** : Code Snippets → Ajouter → coller `wordpress/ndc-snippet-formulaires.php`
   (« Exécuter partout »), enregistrer et activer. Le snippet NDC principal reste inchangé.
2. **Mailjet** : extension réglée pour envoyer les e-mails de WordPress, adresse d'expédition validée.
3. **Réglages → Formulaires NDC** : vérifier la matrice de routage (préremplie), l'accusé de réception,
   puis « Envoyer les e-mails de test » (tout part vers l'administrateur connecté uniquement).
4. **Site** : déployer la nouvelle version (ouverture des documents, champs complémentaires).

## Correspondance avec la spécification

| Exigence | Mise en œuvre |
|---|---|
| Routage To / Cc / Bcc par typologie, paramétrable | Réglages → Formulaires NDC (matrice préremplie). Objet inconnu → « Autres » |
| Contenu de l'e-mail interne, objet `[Site NDC] Nouvelle demande – {typologie} – {société ou nom}` | Typologie, nom et prénom, société, e-mail, téléphone, message, date et heure, page d'origine, UTM ; « Répondre » écrit au demandeur |
| Accusé de réception générique via Mailjet | Pour toute demande du formulaire de contact ; FR ou EN selon la page ; textes et adresse de réponse modifiables |
| Ressources : e-mail professionnel + case, contrôle du format | Fenêtres brochure, plaquette, livret, document d'article |
| Enregistrement AVANT ouverture, échec → message et pas de document | `lib/open-resource.ts` (onglet ouvert au clic, dirigé vers le document après confirmation de WordPress) |
| Ouverture dans un nouvel onglet, aucun document par e-mail | Oui ; aucun e-mail pour ce parcours |
| Données : date, e-mail, document, catégorie, langue, URL, page d'origine, statut, UTM | Champs du lead (+ UTM mémorisés dès la page d'arrivée, `lib/utm.ts`) |
| Vue « Téléchargements / accès aux ressources » : recherche, filtres document / période / langue, tri, export CSV, accès administrateurs | Leads du site → Accès aux ressources |
| Traçabilité des envois | Encadré « Suivi (accès et envois) » sur chaque lead : statut, date, destinataires, erreur ; échecs aussi dans le journal PHP |
| Sécurité | Validation côté serveur (site + WordPress), captcha ALTCHA, champ piège, limites d'envoi |
| Monday | Hors V1 : aucun ticket créé |

## Correctif inclus

Le snippet principal limitait à 10 demandes par tranche de 10 minutes **pour tout le site** (toutes les
demandes arrivent de l'adresse du serveur du site). Le snippet Formulaires neutralise ce quota pour les
appels authentifiés par le secret partagé ; le site limite déjà les envois par visiteur.
