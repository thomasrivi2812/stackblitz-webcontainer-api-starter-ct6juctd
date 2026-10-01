/* =========================================================================
 * PAGES LÉGALES — 100 % administrables depuis WordPress
 * -------------------------------------------------------------------------
 * Mentions légales, Politique de protection des données personnelles et
 * Politique de cookies sont des Pages WordPress classiques (Pages → …) :
 * titre, contenu, image à la une. Le site les affiche sur :
 *   /mentions-legales
 *   /politique-de-protection-des-donnees-personnelles
 *   /politique-de-cookies
 * (et /en/… pour leurs traductions Polylang).
 *
 *  1. Création UNE SEULE FOIS des 3 pages FR + traductions EN (liées dans
 *     Polylang), pré-remplies avec les textes actuels du site. Une page qui
 *     existe déjà n'est jamais modifiée.
 *  2. Encadré d'aide dans l'éditeur de ces pages.
 *  3. Le slug (permalien) des pages FR est verrouillé : le site les retrouve
 *     par ce slug ; le changer ferait réafficher les textes par défaut.
 *  4. Rafraîchissement du site à chaque enregistrement (voir plus bas).
 * ====================================================================== */

if (!function_exists('ndc_legal_pages')) {
    function ndc_legal_pages() {
        return [
        'mentions-legales' => [
            'fr' => ['title' => 'Mentions légales', 'content' => <<<'NDC_HTML'
<h2>Éditeur du site</h2>
<p>Le site nationdatacenter.fr est édité par <strong>Nation Data Center</strong>, filiale du groupe Altarea.<br/>
[Forme juridique, capital social, RCS, SIREN, numéro de TVA et adresse du siège : à compléter.]</p>
<h2>Directeur de la publication</h2>
<p>[Nom et qualité du directeur de la publication : à compléter.]</p>
<h2>Hébergement</h2>
<p>Le site est hébergé sur l'infrastructure de Nation Data Center, en France. [Raison sociale, adresse et téléphone de l'hébergeur : à compléter.]</p>
<h2>Propriété intellectuelle</h2>
<p>L'ensemble des contenus du site (textes, images, logos, vidéos, structure) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable est interdite.</p>
<h2>Responsabilité</h2>
<p>Nation Data Center s'efforce d'assurer l'exactitude des informations publiées sur ce site, sans toutefois pouvoir garantir qu'elles soient exemptes d'erreurs ou d'omissions. Les informations sont fournies à titre indicatif et sont susceptibles d'évoluer.</p>
<h2>Données personnelles et cookies</h2>
<p>Voir la <a href="/politique-de-protection-des-donnees-personnelles">politique de protection des données personnelles</a> et la <a href="/politique-de-cookies">politique de cookies</a>.</p>
<h2>Contact</h2>
<p>Pour toute question relative au site, utilisez la <a href="/contact">page contact</a>.</p>
NDC_HTML
            ],
            'en' => ['slug' => 'legal-notice', 'title' => 'Legal notice', 'content' => <<<'NDC_HTML'
<h2>Publisher</h2>
<p>The website nationdatacenter.fr is published by <strong>Nation Data Center</strong>, a subsidiary of the Altarea group.<br/>
[Legal form, share capital, trade register (RCS), SIREN, VAT number and registered office address: to be completed.]</p>
<h2>Publication director</h2>
<p>[Name and position of the publication director: to be completed.]</p>
<h2>Hosting</h2>
<p>The website is hosted on Nation Data Center's infrastructure, in France. [Host's company name, address and phone number: to be completed.]</p>
<h2>Intellectual property</h2>
<p>All content on this website (texts, images, logos, videos, structure) is protected by intellectual property law. Any reproduction or representation, in whole or in part, without prior written authorisation is prohibited.</p>
<h2>Liability</h2>
<p>Nation Data Center strives to ensure the accuracy of the information published on this website but cannot guarantee that it is free of errors or omissions. Information is provided for guidance only and may change.</p>
<h2>Personal data and cookies</h2>
<p>See the <a href="/en/politique-de-protection-des-donnees-personnelles">privacy policy</a> and the <a href="/en/politique-de-cookies">cookie policy</a>.</p>
<h2>Contact</h2>
<p>For any question about the website, please use the <a href="/en/contact">contact page</a>.</p>
NDC_HTML
            ],
        ],
        'politique-de-protection-des-donnees-personnelles' => [
            'fr' => ['title' => 'Politique de protection des données personnelles', 'content' => <<<'NDC_HTML'
<h2>Responsable de traitement</h2>
<p><strong>Nation Data Center</strong>, filiale du groupe Altarea, est responsable des traitements de données personnelles réalisés sur ce site. [Adresse et coordonnées complètes : à compléter.]</p>
<h2>Données collectées</h2>
<p>Les formulaires du site (contact, question, téléchargement de brochure ou de document) et l'assistant en ligne collectent uniquement les données que vous renseignez : adresse e-mail, et le cas échéant nom, prénom, téléphone, entreprise et message. La page d'origine de la demande est également enregistrée.</p>
<h2>Finalités et bases légales</h2>
<ul>
<li>Répondre à vos demandes de contact et de renseignement (mesures précontractuelles / intérêt légitime) ;</li>
<li>Vous transmettre la documentation demandée (consentement) ;</li>
<li>Assurer le suivi commercial des demandes (intérêt légitime) ;</li>
<li>Mesurer l'audience du site (exemption de consentement pour la mesure strictement anonyme, consentement pour la mesure complète — voir la <a href="/politique-de-cookies">politique de cookies</a>).</li>
</ul>
<h2>Durées de conservation</h2>
<p>[Durées de conservation par finalité : à compléter — usuellement 3 ans après le dernier contact pour les prospects.]</p>
<h2>Destinataires et sous-traitants</h2>
<p>Les données sont destinées aux équipes commerciales et marketing de Nation Data Center. Elles sont hébergées en France sur l'infrastructure de Nation Data Center. Sous-traitants : Piano (mesure d'audience, France), Didomi (gestion du consentement, France). [Autres sous-traitants éventuels (CRM, e-mailing…) : à compléter.]</p>
<p>La protection anti-robots des formulaires est hébergée sur nos propres serveurs et ne transmet aucune donnée à un tiers.</p>
<h2>Vos droits</h2>
<p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez de droits d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité sur vos données. Pour les exercer : [adresse e-mail du référent données personnelles / DPO : à compléter]. Vous pouvez également saisir la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).</p>
NDC_HTML
            ],
            'en' => ['slug' => 'privacy-policy', 'title' => 'Privacy policy', 'content' => <<<'NDC_HTML'
<h2>Data controller</h2>
<p><strong>Nation Data Center</strong>, a subsidiary of the Altarea group, is the controller of the personal data processed on this website. [Full address and contact details: to be completed.]</p>
<h2>Data collected</h2>
<p>The website's forms (contact, question, brochure or document download) and the online assistant only collect the data you provide: e-mail address and, where applicable, first name, last name, phone number, company and message. The page from which the request was sent is also recorded.</p>
<h2>Purposes and legal bases</h2>
<ul>
<li>Answering your contact and information requests (pre-contractual measures / legitimate interest);</li>
<li>Sending you the documents you requested (consent);</li>
<li>Following up on requests commercially (legitimate interest);</li>
<li>Measuring website audience (consent exemption for strictly anonymous measurement, consent for full measurement — see the <a href="/en/politique-de-cookies">cookie policy</a>).</li>
</ul>
<h2>Retention periods</h2>
<p>[Retention periods per purpose: to be completed — usually 3 years after the last contact for prospects.]</p>
<h2>Recipients and processors</h2>
<p>Data is intended for Nation Data Center's sales and marketing teams. It is hosted in France on Nation Data Center's infrastructure. Processors: Piano (audience measurement, France), Didomi (consent management, France). [Other processors, if any (CRM, e-mailing…): to be completed.]</p>
<p>The forms' anti-bot protection is hosted on our own servers and does not send any data to third parties.</p>
<h2>Your rights</h2>
<p>Under the GDPR and the French Data Protection Act, you have the rights of access, rectification, erasure, objection, restriction and portability. To exercise them: [e-mail address of the data protection officer / contact: to be completed]. You may also lodge a complaint with the CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).</p>
NDC_HTML
            ],
        ],
        'politique-de-cookies' => [
            'fr' => ['title' => 'Politique de cookies', 'content' => <<<'NDC_HTML'
<h2>Qu'est-ce qu'un cookie&nbsp;?</h2>
<p>Un cookie est un petit fichier déposé sur votre appareil lors de la consultation d'un site, permettant notamment de mémoriser des préférences de navigation ou de mesurer l'audience.</p>
<h2>Cookies et traceurs utilisés sur ce site</h2>
<p>Ce site n'utilise <strong>aucun cookie publicitaire</strong>.</p>
<h3>Strictement nécessaires (sans consentement)</h3>
<ul>
<li><strong>NEXT_LOCALE</strong> (nationdatacenter.fr) — mémorise la langue d'affichage. Durée : session.</li>
<li><strong>didomi_token</strong> et cookies associés (Didomi) — mémorisent vos choix en matière de cookies. Durée : [à vérifier dans la console Didomi].</li>
<li>Assistant en ligne — la conversation est conservée dans le navigateur (stockage de session) pendant 30 minutes d'inactivité.</li>
</ul>
<h3>Mesure d'audience (Piano Analytics)</h3>
<ul>
<li><strong>_pcid</strong>, <strong>_pctx</strong>, <strong>_pprv</strong> (nationdatacenter.fr) — Durée : 13 mois.</li>
</ul>
<p>Sans votre consentement, la mesure fonctionne en mode <strong>exempté</strong> conformément aux recommandations de la CNIL : statistiques strictement anonymes, sans recoupement avec d'autres traitements ni transmission à des tiers. Si vous acceptez Piano dans le gestionnaire de cookies, la mesure devient complète.</p>
<p>Vous pouvez à tout moment <a href="#opposition-mesure-audience">vous opposer à la mesure d'audience</a> sur ce navigateur.</p>
<h3>Contenus tiers (avec votre consentement)</h3>
<ul>
<li><strong>YouTube</strong> et <strong>Vimeo</strong> — les vidéos de la page Documentation ne sont chargées qu'après votre accord (dans le gestionnaire de cookies ou au moment de lancer la vidéo). Ces plateformes peuvent alors déposer leurs propres cookies.</li>
</ul>
<p>La protection anti-robots des formulaires est hébergée sur nos propres serveurs : elle ne dépose aucun cookie et ne transmet aucune donnée à un tiers.</p>
<h2>Gérer vos choix</h2>
<p>Vous pouvez modifier vos choix à tout moment : <a href="#gerer-mes-cookies">gérer mes cookies</a> (également accessible en bas de chaque page). Vous pouvez aussi supprimer les cookies depuis les réglages de votre navigateur.</p>
<h2>Contact</h2>
<p>Pour toute question : voir la <a href="/politique-de-protection-des-donnees-personnelles">politique de protection des données personnelles</a>.</p>
NDC_HTML
            ],
            'en' => ['slug' => 'cookie-policy', 'title' => 'Cookie policy', 'content' => <<<'NDC_HTML'
<h2>What is a cookie?</h2>
<p>A cookie is a small file stored on your device when you visit a website, used for example to remember browsing preferences or to measure audience.</p>
<h2>Cookies and trackers used on this website</h2>
<p>This website uses <strong>no advertising cookies</strong>.</p>
<h3>Strictly necessary (no consent required)</h3>
<ul>
<li><strong>NEXT_LOCALE</strong> (nationdatacenter.fr) — remembers the display language. Duration: session.</li>
<li><strong>didomi_token</strong> and related cookies (Didomi) — remember your cookie choices. Duration: [to be checked in the Didomi console].</li>
<li>Online assistant — the conversation is kept in the browser (session storage) for 30 minutes of inactivity.</li>
</ul>
<h3>Audience measurement (Piano Analytics)</h3>
<ul>
<li><strong>_pcid</strong>, <strong>_pctx</strong>, <strong>_pprv</strong> (nationdatacenter.fr) — Duration: 13 months.</li>
</ul>
<p>Without your consent, measurement runs in <strong>exempt</strong> mode, in line with the CNIL's recommendations: strictly anonymous statistics, with no cross-referencing with other processing and no transfer to third parties. If you accept Piano in the cookie manager, full measurement is enabled.</p>
<p>You can <a href="#opposition-mesure-audience">opt out of audience measurement</a> on this browser at any time.</p>
<h3>Third-party content (with your consent)</h3>
<ul>
<li><strong>YouTube</strong> and <strong>Vimeo</strong> — videos on the Documentation page are only loaded once you agree (in the cookie manager or when starting the video). These platforms may then set their own cookies.</li>
</ul>
<p>The forms' anti-bot protection is hosted on our own servers: it sets no cookies and sends no data to third parties.</p>
<h2>Managing your choices</h2>
<p>You can change your choices at any time: <a href="#gerer-mes-cookies">manage my cookies</a> (also available at the bottom of every page). You can also delete cookies in your browser settings.</p>
<h2>Contact</h2>
<p>For any question, see the <a href="/en/politique-de-protection-des-donnees-personnelles">privacy policy</a>.</p>
NDC_HTML
            ],
        ],
        ];
    }
}

/* 1. Création des pages (une seule fois ; relançable en supprimant l'option
 *    « ndc_legal_pages_created_v1 »). Priorité 20 : après Polylang. */
add_action('init', function () {
    if (get_option('ndc_legal_pages_created_v1') === '1') {
        return;
    }
    $has_pll = function_exists('pll_set_post_language') && function_exists('pll_save_post_translations');
    $langs   = function_exists('pll_languages_list') ? (array) pll_languages_list(['fields' => 'slug']) : [];

    foreach (ndc_legal_pages() as $slug => $page) {
        // Page FR : existante (par son slug) ou créée.
        $fr = get_page_by_path($slug, OBJECT, 'page');
        $fr_id = $fr ? (int) $fr->ID : 0;
        if (!$fr_id) {
            $fr_id = wp_insert_post([
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_name'    => $slug,
                'post_title'   => $page['fr']['title'],
                'post_content' => $page['fr']['content'],
            ]);
            if (is_wp_error($fr_id) || !$fr_id) {
                continue;
            }
            if ($has_pll) {
                pll_set_post_language($fr_id, 'fr');
            }
        }

        // Traduction EN : créée seulement si Polylang gère l'anglais et
        // qu'aucune traduction n'existe déjà.
        if (!$has_pll || !in_array('en', $langs, true)) {
            continue;
        }
        $translations = function_exists('pll_get_post_translations') ? (array) pll_get_post_translations($fr_id) : [];
        if (!empty($translations['en'])) {
            continue;
        }
        $en_id = wp_insert_post([
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_name'    => $page['en']['slug'],
            'post_title'   => $page['en']['title'],
            'post_content' => $page['en']['content'],
        ]);
        if (is_wp_error($en_id) || !$en_id) {
            continue;
        }
        pll_set_post_language($en_id, 'en');
        $translations['fr'] = $fr_id;
        $translations['en'] = (int) $en_id;
        pll_save_post_translations($translations);
    }
    update_option('ndc_legal_pages_created_v1', '1');
}, 20);

/** Slug FR de la page (elle-même ou la page FR dont elle est la traduction). */
if (!function_exists('ndc_legal_fr_slug')) {
    function ndc_legal_fr_slug($post_id) {
        $fr_id = function_exists('pll_get_post') ? (pll_get_post($post_id, 'fr') ?: $post_id) : $post_id;
        $slug  = get_post_field('post_name', $fr_id);
        return array_key_exists($slug, ndc_legal_pages()) ? $slug : null;
    }
}

/* 2. Encadré d'aide dans l'éditeur des pages légales. */
add_action('add_meta_boxes_page', function ($post) {
    $slug = ndc_legal_fr_slug($post->ID);
    if (!$slug) {
        return;
    }
    add_meta_box('ndc_legal_help', 'Page légale — affichage sur le site', function ($post) use ($slug) {
        $lang = function_exists('pll_get_post_language') ? pll_get_post_language($post->ID) : 'fr';
        $path = ($lang === 'en' ? '/en/' : '/') . $slug;
        echo '<p>Affichée sur <strong>' . esc_html($path) . '</strong>. Titre, contenu et image à la une sont repris tels quels ; la date de dernière mise à jour est ajoutée automatiquement.</p>';
        echo '<p><strong>Liens spéciaux</strong> (insérer un lien avec ces adresses) :</p>';
        echo '<ul style="list-style:disc;margin-left:1.2em">'
            . '<li><code>#gerer-mes-cookies</code> — ouvre le gestionnaire de cookies (Didomi)</li>'
            . '<li><code>#opposition-mesure-audience</code> — opposition à la mesure d\'audience (Piano)</li>'
            . '</ul>';
        if ($lang !== 'en') {
            echo '<p style="color:#b32d2e">Ne pas modifier le permalien : il est verrouillé, le site retrouve la page par celui-ci.</p>';
        }
    }, 'page', 'side', 'high');
});

/* 3. Verrouillage du slug des pages légales FR. */
add_filter('wp_insert_post_data', function ($data, $postarr) {
    if (($data['post_type'] ?? '') !== 'page' || empty($postarr['ID'])) {
        return $data;
    }
    $current = get_post_field('post_name', (int) $postarr['ID']);
    if ($current && array_key_exists($current, ndc_legal_pages()) && $data['post_name'] !== $current) {
        $data['post_name'] = $current;
    }
    return $data;
}, 10, 2);

/* =========================================================================
 * RAFRAÎCHISSEMENT DU SITE à chaque enregistrement
 *   Appelle POST {NDC_NEXT_URL}/api/revalidate dès qu'un contenu publié est
 *   enregistré, mis à la corbeille ou dépublié : le site affiche la
 *   modification immédiatement (sinon : sous 5 min max, cache du site).
 *   À définir dans wp-config.php (inactif sinon) :
 *     define('NDC_NEXT_URL', 'https://nationdatacenter.fr');
 *     define('NDC_REVALIDATE_SECRET', '…même valeur que REVALIDATE_SECRET côté site…');
 * ====================================================================== */
if (!function_exists('ndc_revalidate_next')) {
    function ndc_revalidate_next($post_id) {
        if (!defined('NDC_NEXT_URL') || !defined('NDC_REVALIDATE_SECRET') || NDC_REVALIDATE_SECRET === '') {
            return;
        }
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }
        $type = get_post_type($post_id);
        if (!$type || in_array($type, ['lead', 'nav_menu_item', 'revision', 'customize_changeset', 'wp_global_styles'], true)) {
            return;
        }
        // Envoi unique, en fin de requête : après l'enregistrement du post ET
        // de ses champs ACF (sinon le site pourrait relire l'ancienne version).
        static $scheduled = false;
        if ($scheduled) {
            return;
        }
        $scheduled = true;
        add_action('shutdown', function () {
            wp_remote_post(rtrim(NDC_NEXT_URL, '/') . '/api/revalidate', [
                'timeout'  => 5,
                'blocking' => false,
                'headers'  => ['Content-Type' => 'application/json'],
                // « / » = tout le site : menus, pied de page et pages liées inclus.
                'body'     => wp_json_encode(['secret' => NDC_REVALIDATE_SECRET, 'path' => '/']),
            ]);
        });
    }
    add_action('transition_post_status', function ($new, $old, $post) {
        if ($new === 'publish' || $old === 'publish') {
            ndc_revalidate_next($post->ID);
        }
    }, 10, 3);
}
