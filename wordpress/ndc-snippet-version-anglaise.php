/**
 * NDC — Version anglaise du site : afficher / masquer
 * ---------------------------------------------------
 * À ajouter comme NOUVEAU snippet dans Code Snippets (« Exécuter partout »),
 * à côté du snippet NDC principal.
 *
 * Ajoute la page Réglages → Version anglaise, avec une case à cocher.
 *  - Décochée (par défaut) : le site n'affiche pas le sélecteur FR/EN, et les
 *    adresses /en/… renvoient vers la page française.
 *  - Cochée : la version anglaise est visible.
 * Le site lit ce réglage via GraphQL (ndcSiteSettings { enEnabled }) et se met
 * à jour en une minute environ après l'enregistrement.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Le réglage (enregistré en base, option « ndc_en_enabled »).
add_action('admin_init', function () {
    register_setting('ndc_version_anglaise', 'ndc_en_enabled', [
        'type'              => 'boolean',
        'default'           => false,
        'sanitize_callback' => function ($v) {
            return empty($v) ? 0 : 1;
        },
    ]);
});

// 2. La page Réglages → Version anglaise.
add_action('admin_menu', function () {
    add_options_page(
        'Version anglaise du site',
        'Version anglaise',
        'manage_options',
        'ndc-version-anglaise',
        'ndc_version_anglaise_page'
    );
});

function ndc_version_anglaise_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $on = (bool) get_option('ndc_en_enabled', false);
    ?>
    <div class="wrap">
        <h1>Version anglaise du site</h1>
        <p>Tant que la traduction n'est pas complète, laissez la version anglaise <strong>masquée</strong> :
            le sélecteur FR/EN n'apparaît pas sur le site et les adresses <code>/en/…</code> renvoient
            vers la page française. Les pages anglaises restent modifiables ici, dans WordPress.</p>
        <form method="post" action="options.php">
            <?php settings_fields('ndc_version_anglaise'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">Version anglaise</th>
                    <td>
                        <label>
                            <input type="checkbox" name="ndc_en_enabled" value="1" <?php checked($on); ?> />
                            Afficher la version anglaise sur le site
                        </label>
                        <p class="description">
                            État actuel : <strong><?php echo $on ? 'visible' : 'masquée'; ?></strong>.
                            Après enregistrement, le site se met à jour en une minute environ
                            (recharger la page en navigation privée pour vérifier).
                        </p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Enregistrer'); ?>
        </form>
    </div>
    <?php
}

// 3. Lecture par le site (GraphQL) : { ndcSiteSettings { enEnabled } }.
add_action('graphql_register_types', function () {
    register_graphql_object_type('NdcSiteSettings', [
        'description' => 'Réglages du site NDC pilotés depuis WordPress.',
        'fields'      => [
            'enEnabled' => [
                'type'        => 'Boolean',
                'description' => 'Version anglaise visible sur le site.',
            ],
        ],
    ]);
    register_graphql_field('RootQuery', 'ndcSiteSettings', [
        'type'    => 'NdcSiteSettings',
        'resolve' => function () {
            return ['enEnabled' => (bool) get_option('ndc_en_enabled', false)];
        },
    ]);
});

// 4. Rafraîchissement du site quand la case change (même mécanisme que pour
//    les contenus : constantes NDC_NEXT_URL / NDC_REVALIDATE_SECRET du wp-config).
function ndc_version_anglaise_revalidate() {
    if (!defined('NDC_NEXT_URL') || !defined('NDC_REVALIDATE_SECRET') || NDC_REVALIDATE_SECRET === '') {
        return;
    }
    wp_remote_post(rtrim(NDC_NEXT_URL, '/') . '/api/revalidate', [
        'timeout'  => 5,
        'blocking' => false,
        'headers'  => ['Content-Type' => 'application/json'],
        'body'     => wp_json_encode(['secret' => NDC_REVALIDATE_SECRET, 'path' => '/']),
    ]);
}
add_action('update_option_ndc_en_enabled', 'ndc_version_anglaise_revalidate');
add_action('add_option_ndc_en_enabled', 'ndc_version_anglaise_revalidate');
