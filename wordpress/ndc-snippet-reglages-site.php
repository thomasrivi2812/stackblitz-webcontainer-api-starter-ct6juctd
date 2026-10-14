/**
 * NDC — Réglages du site : version anglaise, Portail client, réseaux sociaux
 * -------------------------------------------------------------------------
 * Snippet Code Snippets (« Exécuter partout »). REMPLACE le contenu du
 * snippet « NDC — Version anglaise » (même case à cocher, mêmes données).
 *
 * Page Réglages → Site NDC :
 *  - Version anglaise affichée ou masquée (sélecteur FR/EN, /en/…).
 *  - Adresse du bouton « Portail client » (en-tête et pied de page).
 *  - Liens LinkedIn, YouTube, Vimeo du pied de page (vide = icône masquée).
 * Le site lit ces réglages via GraphQL (ndcSiteSettings) et se met à jour
 * après l'enregistrement (immédiatement si NDC_NEXT_URL / NDC_REVALIDATE_SECRET
 * sont définis dans wp-config.php, sinon sous 5 minutes).
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Liens éditables : clé => [libellé, aide]. */
function ndc_site_link_fields() {
    return [
        'portal_url'   => ['Portail client', 'Bouton « Portail Client » (menu Ressources et pied de page). Vide = bouton masqué.'],
        'linkedin_url' => ['LinkedIn', 'Ex. https://www.linkedin.com/company/nation-data-center-groupe-altarea/'],
        'youtube_url'  => ['YouTube', 'Ex. https://www.youtube.com/@… — vide = icône masquée.'],
        'vimeo_url'    => ['Vimeo', 'Ex. https://vimeo.com/nationdatacenter — vide = icône masquée.'],
    ];
}

function ndc_site_links() {
    $v = get_option('ndc_site_links', []);
    return is_array($v) ? $v : [];
}

// 1. Réglages enregistrés en base.
add_action('admin_init', function () {
    register_setting('ndc_site', 'ndc_en_enabled', [
        'type'              => 'boolean',
        'default'           => false,
        'sanitize_callback' => function ($v) {
            return empty($v) ? 0 : 1;
        },
    ]);
    register_setting('ndc_site', 'ndc_site_links', [
        'type'              => 'array',
        'sanitize_callback' => function ($v) {
            $out = [];
            foreach (array_keys(ndc_site_link_fields()) as $k) {
                $url = esc_url_raw(trim((string) ($v[$k] ?? '')), ['http', 'https']);
                $out[$k] = $url;
            }
            return $out;
        },
    ]);
});

// 2. Page Réglages → Site NDC.
add_action('admin_menu', function () {
    add_options_page('Réglages du site NDC', 'Site NDC', 'manage_options', 'ndc-site', 'ndc_site_settings_page');
});

function ndc_site_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $on = (bool) get_option('ndc_en_enabled', false);
    $links = ndc_site_links();
    ?>
    <div class="wrap">
        <h1>Réglages du site NDC</h1>
        <form method="post" action="options.php">
            <?php settings_fields('ndc_site'); ?>

            <h2>Version anglaise</h2>
            <p>Tant que la traduction n'est pas complète, laissez-la <strong>masquée</strong> : le sélecteur FR/EN n'apparaît pas
                et les adresses <code>/en/…</code> renvoient vers la page française. Les pages anglaises restent modifiables ici.</p>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">Version anglaise</th>
                    <td><label><input type="checkbox" name="ndc_en_enabled" value="1" <?php checked($on); ?> />
                        Afficher la version anglaise sur le site</label>
                        <p class="description">État actuel : <strong><?php echo $on ? 'visible' : 'masquée'; ?></strong>.</p></td>
                </tr>
            </table>

            <h2>Portail client et réseaux sociaux</h2>
            <p>Adresses complètes, commençant par <code>https://</code>. Un champ vide masque le bouton ou l'icône correspondante.</p>
            <table class="form-table" role="presentation">
                <?php foreach (ndc_site_link_fields() as $k => [$label, $help]) : ?>
                    <tr>
                        <th scope="row"><label for="ndc-<?php echo esc_attr($k); ?>"><?php echo esc_html($label); ?></label></th>
                        <td><input id="ndc-<?php echo esc_attr($k); ?>" type="url" class="large-text" name="ndc_site_links[<?php echo esc_attr($k); ?>]"
                                   value="<?php echo esc_attr($links[$k] ?? ''); ?>" placeholder="https://" />
                            <p class="description"><?php echo esc_html($help); ?></p></td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <p class="description">Après enregistrement, le site se met à jour en une minute environ (vérifier en navigation privée).</p>
            <?php submit_button('Enregistrer'); ?>
        </form>
    </div>
    <?php
}

// 3. Lecture par le site (GraphQL) : { ndcSiteSettings { enEnabled portalUrl linkedinUrl youtubeUrl vimeoUrl } }.
add_action('graphql_register_types', function () {
    register_graphql_object_type('NdcSiteSettings', [
        'description' => 'Réglages du site NDC pilotés depuis WordPress.',
        'fields'      => [
            'enEnabled'   => ['type' => 'Boolean', 'description' => 'Version anglaise visible sur le site.'],
            'portalUrl'   => ['type' => 'String', 'description' => 'Adresse du Portail client.'],
            'linkedinUrl' => ['type' => 'String', 'description' => 'Page LinkedIn.'],
            'youtubeUrl'  => ['type' => 'String', 'description' => 'Chaîne YouTube.'],
            'vimeoUrl'    => ['type' => 'String', 'description' => 'Chaîne Vimeo.'],
        ],
    ]);
    register_graphql_field('RootQuery', 'ndcSiteSettings', [
        'type'    => 'NdcSiteSettings',
        'resolve' => function () {
            $l = ndc_site_links();
            return [
                'enEnabled'   => (bool) get_option('ndc_en_enabled', false),
                'portalUrl'   => $l['portal_url'] ?? '',
                'linkedinUrl' => $l['linkedin_url'] ?? '',
                'youtubeUrl'  => $l['youtube_url'] ?? '',
                'vimeoUrl'    => $l['vimeo_url'] ?? '',
            ];
        },
    ]);
});

// 4. Rafraîchissement du site à l'enregistrement (une seule fois par requête).
function ndc_site_settings_revalidate() {
    static $done = false;
    if ($done || !defined('NDC_NEXT_URL') || !defined('NDC_REVALIDATE_SECRET') || NDC_REVALIDATE_SECRET === '') {
        return;
    }
    $done = true;
    add_action('shutdown', function () {
        wp_remote_post(rtrim(NDC_NEXT_URL, '/') . '/api/revalidate', [
            'timeout'  => 5,
            'blocking' => false,
            'headers'  => ['Content-Type' => 'application/json'],
            'body'     => wp_json_encode(['secret' => NDC_REVALIDATE_SECRET, 'path' => '/']),
        ]);
    });
}
foreach (['ndc_en_enabled', 'ndc_site_links'] as $opt) {
    add_action('update_option_' . $opt, 'ndc_site_settings_revalidate');
    add_action('add_option_' . $opt, 'ndc_site_settings_revalidate');
}
