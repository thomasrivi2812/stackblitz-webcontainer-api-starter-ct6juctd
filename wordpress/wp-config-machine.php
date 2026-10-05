<?php
/**
 * wp-config.php — WordPress NDC sur la machine (core.nationdatacenter.fr)
 *
 * Modèle : remplacer chaque valeur « A_REMPLACER_… » puis copier ce fichier
 * en /srv/wordpress/wp-config.php. Ne jamais versionner la version remplie.
 */

// ** Base de données (MariaDB locale) ** //
define( 'DB_NAME', 'ndc_wp' );
define( 'DB_USER', 'ndc_wp' );
define( 'DB_PASSWORD', 'A_REMPLACER_mot_de_passe_mariadb' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );   // tables en utf8mb4 (l'ancien « utf8 » abîmait les émojis)
define( 'DB_COLLATE', '' );

/**
 * Clés de sécurité : NOUVELLES valeurs (les anciennes ont circulé).
 * Générer sur la machine :  sudo -u www-data wp config shuffle-salts
 * ou coller le résultat de https://api.wordpress.org/secret-key/1.1/salt/
 */
define( 'AUTH_KEY',         'A_REMPLACER' );
define( 'SECURE_AUTH_KEY',  'A_REMPLACER' );
define( 'LOGGED_IN_KEY',    'A_REMPLACER' );
define( 'NONCE_KEY',        'A_REMPLACER' );
define( 'AUTH_SALT',        'A_REMPLACER' );
define( 'SECURE_AUTH_SALT', 'A_REMPLACER' );
define( 'LOGGED_IN_SALT',   'A_REMPLACER' );
define( 'NONCE_SALT',       'A_REMPLACER' );

// Préfixe d'origine (InstaWP) : à conserver, les tables portent ce nom.
$table_prefix = 'iwpbdd2_';

/* Add any custom values between this line and the "stop editing" line. */

// ** Adresse du WordPress : prioritaire sur la base (supprime la redirection vers InstaWP) ** //
define( 'WP_HOME', 'https://core.nationdatacenter.fr' );
define( 'WP_SITEURL', 'https://core.nationdatacenter.fr' );

// HTTPS derrière un proxy / répartiteur éventuel : évite les boucles de redirection.
if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ) {
	$_SERVER['HTTPS'] = 'on';
}
define( 'FORCE_SSL_ADMIN', true );

// ** Sécurité et exploitation ** //
define( 'WP_ENVIRONMENT_TYPE', 'production' );
define( 'DISALLOW_FILE_EDIT', true );      // pas d'édition de code depuis l'admin
define( 'DISABLE_WP_CRON', true );         // cron système : */5 * * * * www-data wp --path=/srv/wordpress cron event run --due-now
define( 'WP_AUTO_UPDATE_CORE', 'minor' );  // correctifs de sécurité automatiques (désactivés chez InstaWP)
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

// ** Liaison avec le site Next.js (mêmes valeurs que dans son .env.production) ** //
define( 'NDC_LEAD_SECRET', 'A_REMPLACER_meme_valeur_que_LEAD_SHARED_SECRET' );
define( 'NDC_NEXT_URL', 'https://nationdatacenter.fr' );
define( 'NDC_REVALIDATE_SECRET', 'A_REMPLACER_meme_valeur_que_REVALIDATE_SECRET' );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
