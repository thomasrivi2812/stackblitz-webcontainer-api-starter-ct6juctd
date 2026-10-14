/**
 * NDC — E-mail de notification à chaque formulaire rempli
 * -------------------------------------------------------
 * À ajouter comme NOUVEAU snippet dans Code Snippets (« Exécuter partout »),
 * à côté du snippet NDC principal (qui enregistre les leads).
 *
 * À chaque lead reçu du site (contact, question, brochure, téléchargement),
 * envoie un e-mail récapitulatif aux destinataires choisis dans
 * Réglages → Notifications leads. L'e-mail part par wp_mail(), donc par
 * MAILJET si l'extension Mailjet est réglée pour envoyer les e-mails du site.
 * « Répondre » dans la messagerie répond directement au visiteur.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Réglages, avec valeurs par défaut. */
function ndc_lead_notify_settings() {
    $defaults = [
        'enabled' => 1,
        'to'      => get_option('admin_email'),
        'types'   => ['contact', 'question'],
    ];
    $opt = get_option('ndc_lead_notify', []);
    return is_array($opt) ? array_merge($defaults, $opt) : $defaults;
}

function ndc_lead_notify_type_labels() {
    return [
        'contact'  => 'Formulaire de contact',
        'question' => 'Question posée à l\'assistant',
        'brochure' => 'Demande de brochure',
        'download' => 'Téléchargement de document',
    ];
}

/** Adresses valides extraites du champ « destinataires » (virgules ou retours à la ligne). */
function ndc_lead_notify_recipients($raw) {
    $list = preg_split('/[\s,;]+/', (string) $raw, -1, PREG_SPLIT_NO_EMPTY);
    return array_values(array_filter(array_map('sanitize_email', $list), 'is_email'));
}

// 1. Repérer les leads créés pendant la requête…
add_action('wp_insert_post', function ($post_id, $post, $update) {
    if ($update || $post->post_type !== 'lead' || wp_is_post_revision($post_id)) {
        return;
    }
    $GLOBALS['ndc_leads_to_notify'][] = (int) $post_id;
}, 10, 3);

// 2. …et envoyer l'e-mail en fin de requête, une fois tous les champs du lead
//    enregistrés (le snippet principal les ajoute juste après la création).
add_action('shutdown', function () {
    if (empty($GLOBALS['ndc_leads_to_notify'])) {
        return;
    }
    foreach (array_unique($GLOBALS['ndc_leads_to_notify']) as $id) {
        ndc_lead_notify_send($id);
    }
});

function ndc_lead_notify_send($post_id, $test = false) {
    $s = ndc_lead_notify_settings();
    if (!$test && empty($s['enabled'])) {
        return false;
    }
    $to = ndc_lead_notify_recipients($s['to']);
    if (!$to) {
        return false;
    }

    $f = [];
    foreach (['type', 'email', 'prenom', 'nom', 'telephone', 'entreprise', 'objet', 'ressource', 'source_url', 'message'] as $k) {
        $f[$k] = $test ? '' : (string) get_post_meta($post_id, $k, true);
    }
    if ($test) {
        $f = array_merge($f, [
            'type' => 'contact', 'email' => 'visiteur@exemple.fr', 'prenom' => 'Jean', 'nom' => 'Dupont',
            'entreprise' => 'Exemple SAS', 'telephone' => '01 23 45 67 89', 'objet' => 'Demande d\'information',
            'message' => "Ceci est un e-mail de test des notifications de leads NDC.\nAucune action n'est nécessaire.",
            'source_url' => home_url('/'),
        ]);
    }
    if (!$test && !in_array($f['type'], (array) $s['types'], true)) {
        return false;
    }

    $labels = ndc_lead_notify_type_labels();
    $type_label = $labels[$f['type']] ?? ucfirst($f['type']);
    $who = trim($f['prenom'] . ' ' . $f['nom']) ?: $f['email'];
    $subject = sprintf('%s[NDC] %s — %s%s',
        $test ? '[TEST] ' : '',
        $type_label,
        $who,
        $f['entreprise'] !== '' ? ' (' . $f['entreprise'] . ')' : ''
    );

    $rows = [
        'Type'          => $type_label,
        'Prénom'        => $f['prenom'],
        'Nom'           => $f['nom'],
        'E-mail'        => $f['email'],
        'Téléphone'     => $f['telephone'],
        'Entreprise'    => $f['entreprise'],
        'Objet'         => $f['objet'],
        'Document'      => $f['ressource'],
        'Page d\'envoi' => $f['source_url'],
    ];
    $html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1b3360">';
    $html .= '<h2 style="margin:0 0 12px;font-size:18px">' . esc_html($type_label) . ' — nouveau lead</h2>';
    $html .= '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f1">';
    foreach ($rows as $label => $value) {
        if ($value === '') continue;
        $cell = $label === 'E-mail'
            ? '<a href="mailto:' . esc_attr($value) . '">' . esc_html($value) . '</a>'
            : ($label === 'Page d\'envoi' ? '<a href="' . esc_url($value) . '">' . esc_html($value) . '</a>' : esc_html($value));
        $html .= '<tr><th align="left" style="background:#f6f9fc;border:1px solid #e2e8f1;width:140px">' . esc_html($label) . '</th>'
               . '<td style="border:1px solid #e2e8f1">' . $cell . '</td></tr>';
    }
    $html .= '</table>';
    if ($f['message'] !== '') {
        $html .= '<h3 style="margin:16px 0 6px;font-size:15px">Message</h3>'
               . '<div style="white-space:pre-wrap;border-left:3px solid #2DAFE6;padding:8px 12px;background:#f6f9fc">' . esc_html($f['message']) . '</div>';
    }
    if (!$test) {
        $html .= '<p style="margin-top:16px"><a href="' . esc_url(admin_url('post.php?post=' . (int) $post_id . '&action=edit')) . '">Voir le lead dans WordPress</a></p>';
    }
    $html .= '<p style="color:#5d6b85;font-size:12px;margin-top:16px">« Répondre » écrit directement au visiteur.</p></div>';

    $headers = ['Content-Type: text/html; charset=UTF-8'];
    if (is_email($f['email'])) {
        $headers[] = 'Reply-To: ' . str_replace(["\r", "\n", '<', '>'], '', $who) . ' <' . $f['email'] . '>';
    }
    return wp_mail($to, $subject, $html, $headers);
}

// 3. Page Réglages → Notifications leads.
add_action('admin_init', function () {
    register_setting('ndc_lead_notify', 'ndc_lead_notify', [
        'type'              => 'array',
        'sanitize_callback' => function ($v) {
            $v = is_array($v) ? $v : [];
            $types = array_values(array_intersect(array_keys(ndc_lead_notify_type_labels()), (array) ($v['types'] ?? [])));
            return [
                'enabled' => empty($v['enabled']) ? 0 : 1,
                'to'      => implode(', ', ndc_lead_notify_recipients($v['to'] ?? '')),
                'types'   => $types,
            ];
        },
    ]);
});

add_action('admin_menu', function () {
    add_options_page('Notifications des leads', 'Notifications leads', 'manage_options', 'ndc-lead-notify', 'ndc_lead_notify_page');
});

// Bouton « Envoyer un e-mail de test ».
add_action('admin_post_ndc_lead_notify_test', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Accès refusé.');
    }
    check_admin_referer('ndc_lead_notify_test');
    $ok = ndc_lead_notify_send(0, true);
    wp_safe_redirect(add_query_arg('ndc_test', $ok ? 'ok' : 'ko', admin_url('options-general.php?page=ndc-lead-notify')));
    exit;
});

function ndc_lead_notify_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $s = ndc_lead_notify_settings();
    ?>
    <div class="wrap">
        <h1>Notifications des leads</h1>
        <?php if (isset($_GET['ndc_test'])) : ?>
            <div class="notice notice-<?php echo $_GET['ndc_test'] === 'ok' ? 'success' : 'error'; ?> is-dismissible"><p>
                <?php echo $_GET['ndc_test'] === 'ok'
                    ? 'E-mail de test envoyé : vérifiez la boîte de réception (et les indésirables).'
                    : 'Échec de l\'envoi : vérifiez les destinataires et les réglages de l\'extension Mailjet.'; ?>
            </p></div>
        <?php endif; ?>
        <p>Un e-mail récapitulatif est envoyé à chaque formulaire rempli sur le site. Il part par l'extension
            <strong>Mailjet</strong> (si elle est réglée pour envoyer les e-mails de WordPress).
            « Répondre » dans la messagerie écrit directement au visiteur.</p>
        <form method="post" action="options.php">
            <?php settings_fields('ndc_lead_notify'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">Notifications</th>
                    <td><label><input type="checkbox" name="ndc_lead_notify[enabled]" value="1" <?php checked(!empty($s['enabled'])); ?> />
                        Envoyer un e-mail à chaque nouveau lead</label></td>
                </tr>
                <tr>
                    <th scope="row"><label for="ndc-notify-to">Destinataires</label></th>
                    <td><textarea id="ndc-notify-to" name="ndc_lead_notify[to]" rows="3" class="large-text"><?php echo esc_textarea($s['to']); ?></textarea>
                        <p class="description">Une ou plusieurs adresses, séparées par des virgules. Ex. : commercial@nationdatacenter.fr</p></td>
                </tr>
                <tr>
                    <th scope="row">Formulaires concernés</th>
                    <td>
                        <?php foreach (ndc_lead_notify_type_labels() as $key => $label) : ?>
                            <label style="display:block;margin-bottom:4px">
                                <input type="checkbox" name="ndc_lead_notify[types][]" value="<?php echo esc_attr($key); ?>" <?php checked(in_array($key, (array) $s['types'], true)); ?> />
                                <?php echo esc_html($label); ?>
                            </label>
                        <?php endforeach; ?>
                    </td>
                </tr>
            </table>
            <?php submit_button('Enregistrer'); ?>
        </form>
        <hr />
        <h2>Tester</h2>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="ndc_lead_notify_test" />
            <?php wp_nonce_field('ndc_lead_notify_test'); ?>
            <p>Envoie un faux lead aux destinataires enregistrés ci-dessus (penser à enregistrer d'abord).</p>
            <?php submit_button('Envoyer un e-mail de test', 'secondary', 'submit', false); ?>
        </form>
    </div>
    <?php
}
