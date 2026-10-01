# Déploiement du site NDC (Next.js 16) sur une machine

Site Next.js (App Router) qui lit ses contenus dans WordPress (GraphQL) et les
met en cache (ISR, 5 min). Un seul processus Node, derrière un nginx en HTTPS.

## 1. Prérequis

- **Node.js ≥ 20.9** (22 LTS recommandé, voir `.nvmrc`) et npm.
- **HTTPS obligatoire** en production : le captcha ALTCHA calcule dans le
  navigateur via une API que celui-ci n'expose qu'en HTTPS.
- **Accès sortant vers WordPress** depuis la machine, **au build et en
  fonctionnement** : le build échoue volontairement si WordPress ne répond pas
  (pour ne jamais publier les données d'exemple).
- Accès sortant vers `i.ytimg.com` (vignettes vidéo, optimisées par le serveur).
- Disque : ~1 Go (dépendances + build + cache d'images plafonné à 500 Mo).

## 2. Installation

```bash
unzip ndc-front.zip && cd ndc-front
npm ci                       # installe les dépendances (dev comprises : nécessaires au build)
cp .env.local.example .env.production   # puis compléter, voir § 3
npm run build
npx next start -p 3000 -H localhost   # derrière nginx (§ 5)
```

> ⚠️ **Toujours `-H localhost`, jamais `-H 127.0.0.1`** : avec une adresse IP,
> Next traite la réécriture interne des URL françaises (`/contact` →
> `/fr/contact`) comme une requête externe et **toutes les pages FR bouclent en
> redirection 307**. Sans `-H`, le serveur écoute sur toutes les interfaces
> (fonctionne, mais fermer alors le port 3000 au pare-feu).

## 3. Variables d'environnement (`.env.production`)

À renseigner **avant** `npm run build` (certaines sont lues à la compilation).

| Variable | Obligatoire | Rôle |
|---|---|---|
| `WORDPRESS_GRAPHQL_ENDPOINT` | **oui** | `https://<wordpress>/graphql` |
| `REVALIDATE_SECRET` | **oui** | Secret partagé avec le hook WordPress de revalidation |
| `LEAD_SHARED_SECRET` | **oui** | Secret partagé avec l'endpoint WordPress des formulaires |
| `ALTCHA_HMAC_SECRET` | non | Secret du captcha ; obligatoire seulement si plusieurs instances |
| `TRUSTED_PROXY_HOPS` | non | Nombre de proxys devant Next (défaut 1 = un nginx) |
| `NODE_EXTRA_CA_CERTS` | cas InstaWP | `./certs/instawp-ca.pem` si WordPress est hébergé chez InstaWP |
| `WP_LIVE` | non | `1` = aucun cache (édition en direct) ; `0` en temps normal |

Déjà intégrés dans le code, **rien à renseigner** : Piano Analytics
(site 642163, collecte `tjtxkkw.pa-cd.com`), Didomi (clé + notice), ALTCHA.
Pour une **recette** : `NEXT_PUBLIC_PIANO_COLLECT_DOMAIN=off` et
`NEXT_PUBLIC_DIDOMI_API_KEY=off` évitent de polluer les statistiques et
consentements de production (puis rebuild).

Générer un secret : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 4. Un seul processus Node

Lancer **une seule instance** (pas de mode cluster pm2, pas de plusieurs
conteneurs) : la limite d'envois des formulaires, l'anti-rejeu du captcha et
le cache des pages sont en mémoire / sur le disque local. Une instance tient
largement la charge d'un site vitrine (pages servies depuis le cache).

### Service systemd (exemple)

```ini
# /etc/systemd/system/ndc-front.service
[Unit]
Description=Site NDC (Next.js)
After=network-online.target

[Service]
WorkingDirectory=/srv/ndc-front
Environment=NODE_ENV=production
ExecStart=/usr/bin/npx next start -p 3000 -H localhost
Restart=always
RestartSec=5
User=ndc

[Install]
WantedBy=multi-user.target
```

`systemctl enable --now ndc-front` · logs : `journalctl -u ndc-front -f`

## 5. nginx (exemple)

```nginx
# Limite de requêtes par IP (anti-abus des formulaires et des URL inventées)
limit_req_zone $binary_remote_addr zone=ndc:10m rate=20r/s;

server {                       # http → https, www → domaine nu
  listen 80;
  server_name nationdatacenter.fr www.nationdatacenter.fr;
  return 301 https://nationdatacenter.fr$request_uri;
}
server {
  listen 443 ssl http2;
  server_name www.nationdatacenter.fr;
  # ssl_certificate … ;
  return 301 https://nationdatacenter.fr$request_uri;
}
server {
  listen 443 ssl http2;
  server_name nationdatacenter.fr;
  # ssl_certificate / ssl_certificate_key … ;

  client_max_body_size 1m;

  location / {
    limit_req zone=ndc burst=40 nodelay;
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    # IP réelle du visiteur (lue par /api/lead, cf. TRUSTED_PROXY_HOPS)
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Next compresse déjà les réponses et pose les en-têtes de cache des fichiers
statiques (`/_next/static`, immuables) et les en-têtes de sécurité (CSP, HSTS…).

## 6. Mise à jour

```bash
systemctl stop ndc-front       # le build remplace .next : ne pas compiler sous le serveur en marche
# remplacer le code (nouveau zip ou git pull), en conservant .env.production
npm ci && npm run build
systemctl start ndc-front
```

Coupure ≈ durée du build (~1 min). Pour zéro coupure : compiler dans un
nouveau dossier puis basculer un lien symbolique et redémarrer.

## 7. Vérifications après déploiement

```bash
curl -s https://nationdatacenter.fr/api/health            # {"ok":true,…}
curl -s https://nationdatacenter.fr/api/health?deep=1     # "wordpress":true
curl -sI https://nationdatacenter.fr/ | grep -i content-security-policy
curl -s -X POST https://nationdatacenter.fr/api/revalidate \
  -H 'content-type: application/json' -d '{"secret":"<REVALIDATE_SECRET>"}'   # {"ok":true…}
```

Dans un navigateur :
- [ ] Pages FR et EN, fiche data center, carte, sélecteur de langue.
- [ ] Bannière Didomi à la première visite ; « Gérer mes cookies » en pied de page.
- [ ] Formulaire de contact envoyé → lead reçu dans WordPress.
- [ ] Outil réseau (F12), filtre `pa-cd.com` : envois Piano, `visitor_privacy_mode`
      = `exempt` avant consentement, `optin` après acceptation de Piano.
- [ ] Vidéo (page Documentation) : écran de consentement si YouTube/Vimeo refusés.
- [ ] Modifier un contenu dans WordPress → visible sur le site (revalidation).

Supervision conseillée : sonde sur `/api/health` (toutes les minutes) et
`/api/health?deep=1` (alerte si WordPress ne répond plus).

## 8. Côté WordPress

- Hook de revalidation : `POST /api/revalidate` avec `{"secret": …, "path": "/"}`
  (tout le site) ou un chemin précis (`/actualites`) — les versions FR et EN
  sont rafraîchies.
- Endpoint des formulaires `POST /wp-json/ndc/v1/lead` avec le même
  `LEAD_SHARED_SECRET`.
- Politique de cookies : retirer `_GRECAPTCHA` (Google), ajouter les cookies
  Piano `_pcid`, `_pctx`, `_pprv` (13 mois).
