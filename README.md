# NDC — Front Next.js (scaffold étape 2)

Front Next.js (App Router) qui consomme le back-office WordPress headless via GraphQL.
Conçu pour tourner **sans installation locale** dans StackBlitz, et basculer sur tes vraies
données dès que tu renseignes l'endpoint GraphQL.

## Lancer dans StackBlitz (aucune installation)

1. Va sur https://stackblitz.com
2. Crée un projet, ou ouvre https://stackblitz.com/fork/nextjs puis remplace les fichiers par ceux de ce dossier (glisser-déposer le contenu du zip).
3. StackBlitz installe les dépendances et démarre tout seul. Le site s'affiche avec des **données d'exemple**.
4. Ouvre la page `/datacenters` pour voir la liste.

> Astuce : tu peux aussi pousser ce dossier sur un dépôt GitHub à toi, puis l'ouvrir via `https://stackblitz.com/github/TON-UTILISATEUR/TON-REPO`. C'est aussi comme ça que tu **restes propriétaire du code**.

## Brancher tes vraies données

1. Copie `.env.local.example` en `.env.local`.
2. Renseigne l'URL de ton endpoint WordPress GraphQL, par exemple :
   ```
   WORDPRESS_GRAPHQL_ENDPOINT=https://ton-site.instawp.xyz/graphql
   ```
3. Redémarre le serveur de dev. Le bandeau en haut de `/datacenters` passe de « données d'exemple » à « données en direct ».

> ⚠️ L'endpoint de WordPress Playground n'est **pas** joignable depuis ce front (il vit uniquement dans ton navigateur). Il faut un WordPress persistant et public (InstaWP, ou l'hébergement Alterway final).

## Structure

```
app/
  layout.tsx            En-tête, pied, typographie (charte NDC)
  page.tsx              Accueil (hero)
  datacenters/page.tsx  Liste des data centers (branchée GraphQL)
  globals.css           Variables de charte (marine / turquoise / blanc)
lib/
  wordpress.ts          Client GraphQL, types, requête, normalisation du statut
  sample-data.ts        Données d'exemple (repli sans API)
```

## Prochaines étapes prévues

- Passer la requête sur ACF Pro (KPI, caractéristiques, bénéfices, médias).
- Page de détail par data center (`/datacenters/[slug]`).
- Carte interactive sur l'accueil (latitude/longitude déjà dans le modèle).
- Multilingue FR/EN via Polylang.
- Génération des types TypeScript depuis le schéma GraphQL (codegen).
