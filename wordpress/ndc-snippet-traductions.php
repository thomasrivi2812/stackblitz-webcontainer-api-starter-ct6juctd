/**
 * NDC — Traductions (Polylang) : page anglaise pré-remplie
 * --------------------------------------------------------
 * Snippet Code Snippets (« Exécuter partout »).
 *
 * Avec Polylang (version gratuite), une traduction démarre VIDE et les blocs
 * de champs NDC (en-tête de page, etc.) n'apparaissaient pas tant que la
 * traduction n'était pas enregistrée. Désormais, quand on clique sur « + »
 * (Langues → English) pour créer la version anglaise :
 *  - les blocs de champs NDC de la page française s'affichent tout de suite ;
 *  - titre, contenu, extrait et champs NDC sont PRÉ-REMPLIS avec le texte
 *    français, à traduire ;
 *  - rien n'est modifié côté français.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** ID de la page/article d'origine pendant la création d'une traduction Polylang. */
function ndc_tr_source_id() {
    if (!is_admin() || empty($_GET['from_post']) || empty($_GET['new_lang'])) {
        return 0;
    }
    $id = (int) $_GET['from_post'];
    return ($id && current_user_can('edit_post', $id)) ? $id : 0;
}

// 1. Blocs de champs rattachés à la page d'origine : visibles sur sa traduction en cours de création.
add_filter('acf/location/rule_match/page', function ($match, $rule, $screen, $field_group) {
    if ($match || ($rule['operator'] ?? '') !== '==') {
        return $match;
    }
    $src = ndc_tr_source_id();
    return ($src && (string) $src === (string) ($rule['value'] ?? '')) ? true : $match;
}, 10, 4);

// 2. Titre, contenu et extrait repris de la version française (à traduire).
add_filter('default_title', function ($title) {
    $src = ndc_tr_source_id();
    return $src ? get_post_field('post_title', $src) : $title;
});
add_filter('default_content', function ($content) {
    $src = ndc_tr_source_id();
    return $src ? get_post_field('post_content', $src) : $content;
});
add_filter('default_excerpt', function ($excerpt) {
    $src = ndc_tr_source_id();
    return $src ? get_post_field('post_excerpt', $src) : $excerpt;
});

// 3. Champs ACF pré-remplis avec les valeurs françaises (textes, images, listes).
add_filter('acf/load_value', function ($value, $post_id, $field) {
    $src = ndc_tr_source_id();
    if (!$src || !is_numeric($post_id) || (int) $post_id === $src) {
        return $value;
    }
    // Uniquement la traduction en cours de création, et seulement les champs vides.
    if (get_post_status((int) $post_id) !== 'auto-draft' || ($value !== null && $value !== '' && $value !== false && $value !== [])) {
        return $value;
    }
    return function_exists('acf_get_value') ? acf_get_value($src, $field) : $value;
}, 20, 3);
