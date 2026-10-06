# Publier une bannière d'actualité sur l'accueil

La bannière d'actualité est un bandeau affiché **juste sous le grand visuel
(hero) de la page d'accueil**. Elle sert à mettre en avant une information
chaude : ouverture d'un site, événement, communiqué, nouvelle offre.

Elle se publie et se retire **depuis WordPress, sans intervention technique**.

---

## Où la trouver

1. Dans WordPress : **Pages → Accueil** (slug `accueil`).
2. Descendre jusqu'au bloc **« Accueil — Contenu éditorial (NDC) »**
   (zone « Boîtes méta » sous l'éditeur).
3. Cliquer sur l'onglet **« Bannière actualité »**.

> La page d'accueil anglaise a sa propre bannière : ouvrir sa traduction
> (encadré **Langues** à droite → English) et remplir le même onglet en anglais.

---

## Afficher ou masquer la bannière

Le premier champ, **« Afficher la bannière »**, est un interrupteur :

| Position | Effet |
|---|---|
| **Masquée** | Bannière retirée du site. Les champs ci-dessous sont cachés dans l'admin, **mais leur contenu est conservé** : on peut préparer une annonce à l'avance. |
| **Visible** | Les champs apparaissent ; la bannière s'affiche sur le site dès l'enregistrement. |

---

## Les champs, un par un

| Champ | Obligatoire | À quoi il sert | Conseils |
|---|---|---|---|
| **Titre** | **Oui** | L'annonce elle-même, en gros. | Une phrase courte et concrète (120 caractères max). Ex. « Le data center de Rennes ouvre ses portes le 14 octobre ». **Sans titre, la bannière ne s'affiche pas**, même sur « Visible ». |
| **Pastille** | Non | Petite étiquette rouge en tête de bandeau. | « Nouveau », « Événement », « Communiqué »… (24 caractères max). Vide = « À la une ». |
| **Texte** | Non | Une ligne de contexte sous le titre. | Tronqué à 1 ligne sur ordinateur, 2 sur mobile : aller à l'essentiel (160 caractères max). |
| **Lien** | Non | Page vers laquelle mène la bannière. | Page du site : chemin commençant par `/` (ex. `/offres`, `/actualites/ouverture-rennes`). Site externe : adresse complète `https://…`. **Vide = bannière non cliquable, sans bouton.** Sur la bannière anglaise, préfixer par `/en` (ex. `/en/offres`). |
| **Libellé du bouton** | Non | Texte du bouton à droite. | « Lire l'article », « S'inscrire », « Voir le communiqué »… (32 caractères max). Vide = « Lire la suite ». N'apparaît que si un lien est renseigné. |
| **Vignette** | Non | Petite image décorative à droite. | Affichée en 96 × 64 px, **masquée sur mobile**. Ne pas y mettre de texte : elle n'est pas lue par les lecteurs d'écran. |
| **Tonalité** | Non | Couleur du bandeau. | **Marine** : annonce courante (par défaut). **Rouge** : à réserver aux vraies urgences. **Clair** : annonce douce, sur fond blanc. |
| **Masquer après le** | Non | Date de fin automatique. | La bannière reste visible **toute la journée indiquée** puis disparaît d'elle-même : plus d'annonce périmée oubliée en ligne. Vide = affichée jusqu'à ce qu'on la repasse sur « Masquée ». |

---

## Publier une annonce, pas à pas

1. Pages → **Accueil** → onglet **Bannière actualité**.
2. Passer **« Afficher la bannière »** sur **Visible**.
3. Remplir au minimum le **Titre** ; idéalement un **Lien** et une date
   **« Masquer après le »**.
4. Cliquer sur **Enregistrer** (en haut à droite).
5. Vérifier sur le site (fenêtre de navigation privée).
6. Recommencer sur la page **Accueil anglaise** si l'annonce doit aussi
   paraître en anglais.

**Délai d'affichage** : immédiat lorsque le rafraîchissement automatique du
site est configuré ; sinon **5 minutes maximum**.

## Retirer une annonce

- Repasser **« Afficher la bannière »** sur **Masquée** puis **Enregistrer** ;
- ou laisser la date **« Masquer après le »** faire le travail.

---

## Bonnes pratiques

- **Une seule annonce à la fois** : la bannière n'en affiche qu'une.
- **Toujours une date de fin** pour un événement daté.
- **Rouge = exceptionnel** : utilisée en permanence, elle n'attire plus l'œil.
- Vérifier que le **lien** fonctionne avant d'enregistrer (ouvrir l'adresse
  dans un autre onglet).

## Si la bannière ne s'affiche pas

| Vérification | |
|---|---|
| L'interrupteur est-il sur **Visible** ? | |
| Le **Titre** est-il rempli ? | Sans titre, rien ne s'affiche. |
| La date **« Masquer après le »** est-elle passée ? | La vider ou la repousser. |
| Est-ce la bonne langue ? | La page Accueil FR et la page Accueil EN ont chacune leur bannière. |
| Moins de 5 minutes depuis l'enregistrement ? | Patienter, puis recharger en navigation privée. |
