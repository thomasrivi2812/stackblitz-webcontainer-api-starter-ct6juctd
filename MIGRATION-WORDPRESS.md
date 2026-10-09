# Migration WordPress : InstaWP → machine NDC (MariaDB)

Objectif : déplacer le WordPress (contenus, médias, extensions, snippets,
leads) de `ndc-site-test.instawp.site` vers la machine, avec une base MariaDB,
puis rebrancher le site Next.js dessus. Le site public reste en ligne pendant
toute l'opération (il sert ses pages depuis son cache).

## 0. À décider avant vendredi

| Question | Recommandation |
|---|---|
| Domaine du WordPress | **`core.nationdatacenter.fr`** (validé ; HTTPS, certificat Let's Encrypt) |
| Même machine que le site ? | Oui possible ; voir l'**alerte images** au § 6 |
| Accès public | Médias (`/wp-content/uploads`) **publics** : les PDF/brochures sont liés directement. `/wp-admin` et `/wp-login.php` restreints (IP / VPN) |
| Versions | PHP 8.2 ou 8.3 (FPM), MariaDB 10.11 ou 11.4 (LTS), même version de WordPress que sur InstaWP |
| Accès InstaWP | Vérifier qui a les accès (et SSH/WP-CLI si proposé) — **un site InstaWP peut expirer** : faire une sauvegarde complète dès maintenant |

## 1. Inventaire (à faire dès maintenant, sur InstaWP)

- [ ] Version de WordPress et de PHP (Outils → Santé du site → Info).
- [ ] Liste des extensions **et versions** (WPGraphQL, WPGraphQL for ACF,
      WPGraphQL Polylang, ACF / SCF, Polylang, Code Snippets…). Repérer les
      extensions propres à InstaWP (ex. « InstaWP Connect ») : à ne pas migrer.
- [ ] Préfixe des tables (`wp_` ou autre, dans `wp-config.php`) : à conserver.
- [ ] Snippets actifs (Code Snippets) : ils sont en base, ils suivront ; en
      garder une copie texte.
- [ ] Réglages Polylang (langues, URL), réglages WPGraphQL.
- [ ] **Sauvegarde complète** téléchargée : base SQL + `wp-content/`.

## 2. Préparer la machine (avant vendredi)

```bash
# Paquets (Debian/Ubuntu) — adapter aux versions disponibles
apt install nginx mariadb-server php8.3-fpm php8.3-mysql php8.3-gd php8.3-curl \
  php8.3-mbstring php8.3-xml php8.3-zip php8.3-intl php8.3-imagick
# WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp
mariadb-secure-installation
```

Base et utilisateur dédiés :

```sql
CREATE DATABASE ndc_wp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ndc_wp'@'localhost' IDENTIFIED BY '<mot de passe long>';
GRANT ALL PRIVILEGES ON ndc_wp.* TO 'ndc_wp'@'localhost';
FLUSH PRIVILEGES;
```

Bloc nginx du WordPress (extrait) :

```nginx
server {
  listen 443 ssl http2;
  server_name core.nationdatacenter.fr;
  root /srv/wordpress;
  index index.php;
  client_max_body_size 64m;                 # téléversement des PDF

  location = /xmlrpc.php { deny all; }      # inutile, cible d'attaques
  location ~ ^/(wp-admin|wp-login\.php) {   # back-office réservé
    allow <IP bureau / VPN>; deny all;
    try_files $uri $uri/ /index.php?$args;
    location ~ \.php$ { include fastcgi_params; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; fastcgi_pass unix:/run/php/php8.3-fpm.sock; }
  }
  location / { try_files $uri $uri/ /index.php?$args; }
  location ~ \.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
  }
}
```

`/graphql` et `/wp-json/ndc/v1/lead` doivent rester accessibles au site Next
(ne pas les mettre derrière la restriction d'IP).

## 3. Jour J — gel et export (InstaWP)

1. **Prévenir l'équipe : plus aucune modification dans le WordPress** InstaWP
   jusqu'à la fin de la migration (sinon elle serait perdue).
2. Exporter la base :
   - avec WP-CLI : `wp db export ndc.sql --default-character-set=utf8mb4`
   - sinon phpMyAdmin (export SQL complet) ou une extension de migration
     (Duplicator, Migrate Guru…).
3. Récupérer `wp-content/` (uploads, plugins, themes ; **sans** les
   extensions InstaWP).

## 4. Jour J — import (machine)

```bash
cd /srv/wordpress
wp core download --version=<même version qu'InstaWP> --locale=fr_FR
wp config create --dbname=ndc_wp --dbuser=ndc_wp --dbpass='<…>' --dbprefix=<préfixe d'origine>
# copier wp-content/ récupéré, puis :
chown -R www-data:www-data wp-content/uploads
```

⚠️ **Collation MySQL 8 → MariaDB** : si le dump contient `utf8mb4_0900_ai_ci`
(MySQL 8), MariaDB peut refuser l'import. Le corriger avant :
`sed -i 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g' ndc.sql`

```bash
wp db import ndc.sql
# Remplacer l'ancienne adresse partout (gère les données sérialisées ACF) :
wp search-replace 'https://ndc-site-test.instawp.site' 'https://core.nationdatacenter.fr' \
  --all-tables --precise --skip-columns=guid --dry-run   # vérifier le nombre de remplacements
wp search-replace 'https://ndc-site-test.instawp.site' 'https://core.nationdatacenter.fr' \
  --all-tables --precise --skip-columns=guid
wp rewrite flush
wp plugin list            # tout doit être actif comme sur InstaWP
wp plugin deactivate <extensions InstaWP> && wp plugin delete <…>
```

À ajouter dans `wp-config.php` :

```php
define('WP_HOME', 'https://core.nationdatacenter.fr');
define('WP_SITEURL', 'https://core.nationdatacenter.fr');
define('FORCE_SSL_ADMIN', true);
define('DISALLOW_FILE_EDIT', true);          // pas d'édition de code depuis l'admin
define('WP_ENVIRONMENT_TYPE', 'production');
define('DISABLE_WP_CRON', true);             // remplacé par le cron système ci-dessous

// Secrets partagés avec le site Next (valeurs NEUVES, identiques des deux côtés)
define('NDC_LEAD_SECRET', '<= LEAD_SHARED_SECRET du site>');
define('NDC_NEXT_URL', 'https://nationdatacenter.fr');
define('NDC_REVALIDATE_SECRET', '<= REVALIDATE_SECRET du site>');
```

> Le secret des formulaires est aujourd'hui écrit **en clair dans le snippet**
> (`NDC_LEAD_SECRET`). Le définir dans `wp-config.php` (prioritaire sur le
> snippet) avec une **nouvelle** valeur : l'ancienne a circulé.

Régénérer les clés de sécurité (`wp config shuffle-salts`) et ajouter le cron :
`*/5 * * * * www-data wp --path=/srv/wordpress cron event run --due-now`

## 5. Contrôles WordPress

```bash
curl -s https://core.nationdatacenter.fr/graphql -H 'content-type: application/json' \
  -d '{"query":"{ datacenters(first: 3) { nodes { title } } }"}'
```

- [ ] Connexion à l'admin, médias visibles, PDF téléchargeables.
- [ ] Polylang : pages FR/EN toujours liées.
- [ ] Snippets actifs ; extension SMTP configurée (mails de l'admin).

## 6. Rebrancher le site Next

Dans `.env.production` du site :

```
WORDPRESS_GRAPHQL_ENDPOINT=https://core.nationdatacenter.fr/graphql
LEAD_SHARED_SECRET=<nouvelle valeur>
REVALIDATE_SECRET=<nouvelle valeur>
```

Retirer `NODE_EXTRA_CA_CERTS` (spécifique InstaWP), puis **recompiler** (le
domaine WordPress est intégré à la compilation : CSP, images) :
`systemctl stop ndc-front && npm run build && systemctl start ndc-front`

⚠️ **Alerte images (WordPress sur la même machine)** : si, depuis la machine,
`core.nationdatacenter.fr` résout vers une IP locale ou privée
(`getent hosts core.nationdatacenter.fr` → `127.x`, `10.x`, `192.168.x`,
`172.16-31.x`), l'optimiseur d'images de Next refuse de les télécharger et
**toutes les images WordPress disparaissent**. Dans ce cas, ajouter
`NDC_IMAGES_ALLOW_LOCAL_IP=1` dans `.env.production` et recompiler.

Vérifications : `curl https://nationdatacenter.fr/api/health?deep=1` →
`"wordpress":true`, puis la liste « Vérifications après déploiement » de
`DEPLOIEMENT.md` (formulaire → lead reçu dans le nouveau WordPress, modification
d'une page WP → visible sur le site).

## 6 bis. Dépannage : « La réponse n'est pas une réponse JSON valide »

L'éditeur enregistre via `/wp-json/…` et a reçu autre chose que du JSON.
F12 → Réseau → requête en rouge (`pages/123`, `posts/…`) → onglet Réponse :

| La réponse contient | Cause | Correctif |
|---|---|---|
| Page 404 **nginx** | `/wp-json` non routé vers WordPress | `location / { try_files $uri $uri/ /index.php?$args; }` puis `wp rewrite flush` |
| `Warning:` / `Deprecated:` / `Notice:` avant le `{` | Erreurs PHP affichées (souvent `Constant WP_HOME already defined`) | Supprimer les `define` en double dans `wp-config.php` ; `WP_DEBUG_DISPLAY` à false + `@ini_set('display_errors','0')` |
| `413 Request Entity Too Large` | Contenu trop gros pour nginx | `client_max_body_size 64m;` |
| `403` nginx / page HTML de connexion | Restriction d'IP ou HTTPS non détecté (cookie sécurisé ignoré) | Laisser `/wp-json` hors restriction ; vérifier `is_ssl()` |
| URL de la requête en `http://` (bloquée) | HTTPS non détecté par PHP | Voir `$_SERVER['HTTPS']` / `fastcgi_param HTTPS on;` |

Test rapide : `curl -s https://core.nationdatacenter.fr/wp-json/ | head -c 200` doit
commencer par `{"name":`.

## 7. Après la migration

- [ ] Sauvegardes quotidiennes : `mariadb-dump ndc_wp | gzip` + copie de
      `wp-content/uploads`, conservées hors de la machine ; **tester une
      restauration**.
- [ ] Mises à jour mineures automatiques ; extensions à jour.
- [ ] Laisser le WordPress InstaWP en lecture seule quelques jours (retour
      arrière : remettre l'ancien `WORDPRESS_GRAPHQL_ENDPOINT` et recompiler),
      puis le supprimer.
