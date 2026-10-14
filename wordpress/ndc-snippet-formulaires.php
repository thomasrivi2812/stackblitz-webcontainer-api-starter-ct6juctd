/**
 * NDC — Formulaires V1 : routage, accusé de réception, accès aux ressources
 * ------------------------------------------------------------------------
 * Mise en œuvre de la « Spécification fonctionnelle synthétique — Formulaire
 * de contact et accès aux ressources documentaires » (v1.0, 6 octobre 2026).
 *
 * À ajouter comme NOUVEAU snippet dans Code Snippets (« Exécuter partout »),
 * à côté du snippet NDC principal (qui reçoit et enregistre les leads).
 *
 *  - Routage : chaque demande du formulaire de contact part par e-mail aux
 *    destinataires To / Cc / Bcc de sa typologie (Réglages → Formulaires NDC).
 *  - Accusé de réception générique au demandeur, en français ou en anglais.
 *  - Les e-mails partent par wp_mail(), donc par MAILJET si l'extension
 *    Mailjet est réglée pour envoyer les e-mails de WordPress.
 *  - Accès aux ressources : catégorie, langue, adresse du document, statut et
 *    UTM enregistrés ; vue Leads du site → Accès aux ressources (recherche,
 *    filtres, tri, export CSV). Aucun e-mail pour ce parcours.
 *  - Traçabilité : statut de chaque envoi conservé sur le lead.
 *  - Monday : hors périmètre V1 (aucun ticket créé).
 */

if (!defined('ABSPATH')) {
    exit;
}

/* =========================================================================
 * 1. Réglages (modifiables sans toucher au code)
 * ====================================================================== */

function ndc_forms_defaults() {
    return [
        'routes' => [
            ['label' => 'Demande de devis', 'label_en' => 'Request a quote',
             'to' => 'commercial@nationdatacenter.fr, yparat@nationdatacenter.fr', 'cc' => '',
             'bcc' => 'dmarton@nationdatacenter.fr, ndeuze@altarea.com'],
            ['label' => 'Renseignements techniques', 'label_en' => 'Technical information',
             'to' => 'swyrwiak@nationdatacenter.fr', 'cc' => 'dmarton@nationdatacenter.fr', 'bcc' => ''],
            ['label' => 'Fournisseurs', 'label_en' => 'Suppliers',
             'to' => 'swyrwiak@nationdatacenter.fr', 'cc' => 'dmarton@nationdatacenter.fr', 'bcc' => ''],
            ['label' => 'Partenariat / Presse', 'label_en' => 'Partnership / Press',
             'to' => 'cpiccioli@altarea.com', 'cc' => 'dmarton@nationdatacenter.fr', 'bcc' => ''],
            ['label' => 'Ressources humaines', 'label_en' => 'Human resources',
             'to' => 'dmarton@nationdatacenter.fr', 'cc' => '', 'bcc' => ''],
            ['label' => 'Autres', 'label_en' => 'Other',
             'to' => 'dmarton@nationdatacenter.fr', 'cc' => '', 'bcc' => ''],
        ],
        'subject'         => '[Site NDC] Nouvelle demande – {typologie} – {societe_ou_nom}',
        'questions'       => 1,
        'ack_enabled'     => 1,
        'ack_reply_to'    => '',
        'ack_subject_fr'  => '[Nation Data Center] Nous avons bien reçu votre demande',
        'ack_body_fr'     => "Bonjour,\n\nNous vous remercions pour votre message et l'intérêt que vous portez à Nation Data Center.\n\nVotre demande a bien été reçue et transmise à l'équipe concernée. Nos équipes reviendront vers vous dans les meilleurs délais.\n\nCordialement,\nL'équipe Nation Data Center",
        'ack_subject_en'  => '[Nation Data Center] We have received your request',
        'ack_body_en'     => "Hello,\n\nThank you for your message and for your interest in Nation Data Center.\n\nYour request has been received and forwarded to the relevant team. We will get back to you as soon as possible.\n\nKind regards,\nThe Nation Data Center team",
    ];
}

function ndc_forms_settings() {
    $opt = get_option('ndc_forms', []);
    return is_array($opt) ? array_merge(ndc_forms_defaults(), $opt) : ndc_forms_defaults();
}

/** Adresses valides d'un champ (séparées par virgules, points-virgules ou retours à la ligne). */
function ndc_forms_emails($raw) {
    $list = preg_split('/[\s,;]+/', (string) $raw, -1, PREG_SPLIT_NO_EMPTY);
    return array_values(array_unique(array_filter(array_map('sanitize_email', $list), 'is_email')));
}

/* =========================================================================
 * 2. Réception des leads : données complémentaires et correction du quota
 * ====================================================================== */

// Le snippet principal n'enregistre que ses champs historiques : on garde le
// corps complet de la requête pour les champs ajoutés (catégorie, langue…).
// Son quota « 10 demandes / 10 min par IP » voit TOUTES les demandes venir
// de la même adresse (le serveur du site) : au-delà de 10 visiteurs en
// 10 minutes, les leads étaient refusés. Le site applique déjà sa propre
// limite par visiteur ; on neutralise donc ce quota pour les appels
// authentifiés par le secret partagé.
add_filter('rest_request_before_callbacks', function ($response, $handler, $request) {
    if ($request instanceof WP_REST_Request && $request->get_route() === '/ndc/v1/lead') {
        $params = $request->get_json_params();
        $GLOBALS['ndc_lead_params'] = is_array($params) ? $params : [];
        if (defined('NDC_LEAD_SECRET') && NDC_LEAD_SECRET !== '') {
            add_filter('pre_transient_ndc_lead_rl_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown'), '__return_zero');
        }
    }
    return $response;
}, 10, 3);

add_action('wp_insert_post', function ($post_id, $post, $update) {
    if ($update || $post->post_type !== 'lead' || wp_is_post_revision($post_id)) {
        return;
    }
    // Données de la requête qui a créé CE lead (associées tout de suite).
    $GLOBALS['ndc_leads_new'][(int) $post_id] = $GLOBALS['ndc_lead_params'] ?? [];
}, 10, 3);

// En fin de requête : le snippet principal a fini d'enregistrer les champs.
add_action('shutdown', function () {
    if (empty($GLOBALS['ndc_leads_new'])) {
        return;
    }
    foreach ($GLOBALS['ndc_leads_new'] as $id => $params) {
        ndc_forms_process_lead($id, $params);
    }
});

function ndc_forms_process_lead($post_id, array $p) {
    $text = function ($k, $max) use ($p) {
        return mb_substr(sanitize_text_field((string) ($p[$k] ?? '')), 0, $max);
    };
    $source = (string) get_post_meta($post_id, 'source_url', true);
    $langue = in_array($p['langue'] ?? '', ['fr', 'en'], true)
        ? $p['langue']
        : (preg_match('#://[^/]+/en(/|$|\?)#', $source) ? 'en' : 'fr');

    $extra = [
        'categorie'     => $text('categorie', 80),
        'langue'        => $langue,
        'ressource_url' => esc_url_raw((string) ($p['ressource_url'] ?? '')),
        'utm_source'    => $text('utm_source', 100),
        'utm_medium'    => $text('utm_medium', 100),
        'utm_campaign'  => $text('utm_campaign', 100),
        'utm_term'      => $text('utm_term', 100),
        'utm_content'   => $text('utm_content', 100),
    ];
    foreach ($extra as $k => $v) {
        if ($v !== '') update_post_meta($post_id, $k, $v);
    }

    $type = (string) get_post_meta($post_id, 'type', true);
    // Accès aux ressources : la demande est enregistrée, le site ouvre le
    // document. Aucun e-mail (ni accusé ni document) pour ce parcours.
    if (in_array($type, ['brochure', 'download'], true)) {
        update_post_meta($post_id, 'statut_acces', 'ouvert');
        return;
    }

    $s = ndc_forms_settings();
    if ($type === 'contact' || ($type === 'question' && !empty($s['questions']))) {
        ndc_forms_send_internal($post_id, $type);
    }
    if ($type === 'contact' && !empty($s['ack_enabled'])) {
        ndc_forms_send_ack($post_id, $langue);
    }
}

/* =========================================================================
 * 3. E-mails (routage interne et accusé de réception)
 * ====================================================================== */

/** Envoi via wp_mail (Mailjet) ; renvoie [succès, message d'erreur]. */
function ndc_forms_mail($to, $subject, $html, array $headers) {
    $GLOBALS['ndc_mail_error'] = '';
    $catch = function ($wp_error) {
        $GLOBALS['ndc_mail_error'] = $wp_error instanceof WP_Error ? $wp_error->get_error_message() : 'erreur inconnue';
    };
    add_action('wp_mail_failed', $catch);
    $headers[] = 'Content-Type: text/html; charset=UTF-8';
    $ok = wp_mail($to, $subject, $html, $headers);
    remove_action('wp_mail_failed', $catch);
    $err = $ok ? '' : ($GLOBALS['ndc_mail_error'] ?: 'wp_mail a renvoyé false');
    if (!$ok) {
        error_log('[NDC formulaires] Échec d\'envoi « ' . $subject . ' » : ' . $err);
    }
    return [$ok, $err];
}

function ndc_forms_trace($post_id, $key, $ok, $err, $recipients) {
    update_post_meta($post_id, $key, [
        'statut'       => $ok ? 'envoyé' : 'échec',
        'date'         => current_time('mysql'),
        'destinataires'=> $recipients,
        'erreur'       => $err,
    ]);
}

/** Typologie (ligne de routage) correspondant à l'objet choisi, sinon « Autres ». */
function ndc_forms_route_for($objet) {
    $routes = ndc_forms_settings()['routes'];
    $norm = function ($v) { return mb_strtolower(trim((string) $v)); };
    foreach ($routes as $r) {
        if ($norm($objet) !== '' && ($norm($objet) === $norm($r['label']) || $norm($objet) === $norm($r['label_en'] ?? ''))) {
            return $r;
        }
    }
    foreach ($routes as $r) {
        if ($norm($r['label']) === 'autres') return $r;
    }
    return end($routes) ?: ['label' => 'Autres', 'to' => get_option('admin_email'), 'cc' => '', 'bcc' => ''];
}

function ndc_forms_lead_fields($post_id) {
    $f = [];
    foreach (['type', 'email', 'prenom', 'nom', 'telephone', 'entreprise', 'objet', 'message', 'source_url',
              'utm_source', 'utm_medium', 'utm_campaign'] as $k) {
        $f[$k] = (string) get_post_meta($post_id, $k, true);
    }
    $f['date'] = wp_date('d/m/Y à H:i', get_post_time('U', true, $post_id) ?: time());
    return $f;
}

function ndc_forms_internal_html($f, $typologie, $post_id = 0) {
    $nom = trim($f['nom'] . ' ' . $f['prenom']);
    $rows = [
        'Typologie'         => $typologie,
        'Nom et prénom'     => $nom,
        'Société'           => $f['entreprise'],
        'E-mail'            => $f['email'],
        'Téléphone'         => $f['telephone'],
        'Date et heure'     => $f['date'],
        'Page d\'origine'   => $f['source_url'],
        'Source (UTM)'      => trim(implode(' / ', array_filter([$f['utm_source'], $f['utm_medium'], $f['utm_campaign']]))),
    ];
    $h = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1b3360">';
    $h .= '<h2 style="margin:0 0 12px;font-size:18px">Nouvelle demande – ' . esc_html($typologie) . '</h2>';
    $h .= '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f1">';
    foreach ($rows as $label => $v) {
        if ($v === '') continue;
        if ($label === 'E-mail') $cell = '<a href="mailto:' . esc_attr($v) . '">' . esc_html($v) . '</a>';
        elseif ($label === 'Page d\'origine') $cell = '<a href="' . esc_url($v) . '">' . esc_html($v) . '</a>';
        else $cell = esc_html($v);
        $h .= '<tr><th align="left" style="background:#f6f9fc;border:1px solid #e2e8f1;width:150px">' . esc_html($label) . '</th><td style="border:1px solid #e2e8f1">' . $cell . '</td></tr>';
    }
    $h .= '</table>';
    if ($f['message'] !== '') {
        $h .= '<h3 style="margin:16px 0 6px;font-size:15px">Message</h3><div style="white-space:pre-wrap;border-left:3px solid #2DAFE6;padding:8px 12px;background:#f6f9fc">' . esc_html($f['message']) . '</div>';
    }
    if ($post_id) {
        $h .= '<p style="margin-top:16px"><a href="' . esc_url(admin_url('post.php?post=' . (int) $post_id . '&action=edit')) . '">Voir la demande dans WordPress</a></p>';
    }
    return $h . '<p style="color:#5d6b85;font-size:12px">« Répondre » écrit directement au demandeur.</p></div>';
}

function ndc_forms_subject($tpl, $f, $typologie) {
    $nom = trim($f['prenom'] . ' ' . $f['nom']) ?: $f['email'];
    return strtr($tpl, [
        '{typologie}'      => $typologie,
        '{societe_ou_nom}' => $f['entreprise'] !== '' ? $f['entreprise'] : $nom,
        '{societe}'        => $f['entreprise'],
        '{nom}'            => $nom,
    ]);
}

function ndc_forms_send_internal($post_id, $type) {
    $s = ndc_forms_settings();
    $f = ndc_forms_lead_fields($post_id);
    $route = ndc_forms_route_for($type === 'question' ? 'Autres' : $f['objet']);
    $typologie = $type === 'question' ? 'Question (assistant du site)' : ($f['objet'] !== '' ? $f['objet'] : $route['label']);

    $to = ndc_forms_emails($route['to']);
    $cc = ndc_forms_emails($route['cc'] ?? '');
    $bcc = ndc_forms_emails($route['bcc'] ?? '');
    $recipients = 'To: ' . implode(', ', $to) . ($cc ? ' | Cc: ' . implode(', ', $cc) : '') . ($bcc ? ' | Bcc: ' . implode(', ', $bcc) : '');
    if (!$to) {
        error_log('[NDC formulaires] Aucun destinataire pour la typologie « ' . $route['label'] . ' »');
        ndc_forms_trace($post_id, '_ndc_mail_interne', false, 'aucun destinataire configuré', $recipients);
        return;
    }
    $headers = [];
    foreach ($cc as $a) $headers[] = 'Cc: ' . $a;
    foreach ($bcc as $a) $headers[] = 'Bcc: ' . $a;
    if (is_email($f['email'])) {
        $who = str_replace(["\r", "\n", '<', '>', '"'], '', trim($f['prenom'] . ' ' . $f['nom']));
        $headers[] = 'Reply-To: ' . ($who !== '' ? $who . ' ' : '') . '<' . $f['email'] . '>';
    }
    [$ok, $err] = ndc_forms_mail($to, ndc_forms_subject($s['subject'], $f, $typologie), ndc_forms_internal_html($f, $typologie, $post_id), $headers);
    ndc_forms_trace($post_id, '_ndc_mail_interne', $ok, $err, $recipients);
}

function ndc_forms_ack_html($body) {
    return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1b3360">'
         . nl2br(esc_html($body)) . '</div>';
}

function ndc_forms_send_ack($post_id, $langue) {
    $s = ndc_forms_settings();
    $email = (string) get_post_meta($post_id, 'email', true);
    if (!is_email($email)) {
        return;
    }
    $en = $langue === 'en';
    $headers = [];
    $reply = ndc_forms_emails($s['ack_reply_to']);
    if ($reply) $headers[] = 'Reply-To: ' . $reply[0];
    [$ok, $err] = ndc_forms_mail($email, $en ? $s['ack_subject_en'] : $s['ack_subject_fr'], ndc_forms_ack_html($en ? $s['ack_body_en'] : $s['ack_body_fr']), $headers);
    ndc_forms_trace($post_id, '_ndc_mail_accuse', $ok, $err, $email . ($en ? ' (EN)' : ' (FR)'));
}

/* =========================================================================
 * 4. Page Réglages → Formulaires NDC
 * ====================================================================== */

add_action('admin_init', function () {
    register_setting('ndc_forms', 'ndc_forms', [
        'type'              => 'array',
        'sanitize_callback' => function ($v) {
            $v = is_array($v) ? $v : [];
            $d = ndc_forms_defaults();
            $routes = [];
            foreach ((array) ($v['routes'] ?? []) as $r) {
                $label = sanitize_text_field($r['label'] ?? '');
                if ($label === '') continue;
                $routes[] = [
                    'label'    => $label,
                    'label_en' => sanitize_text_field($r['label_en'] ?? ''),
                    'to'       => implode(', ', ndc_forms_emails($r['to'] ?? '')),
                    'cc'       => implode(', ', ndc_forms_emails($r['cc'] ?? '')),
                    'bcc'      => implode(', ', ndc_forms_emails($r['bcc'] ?? '')),
                ];
            }
            return [
                'routes'         => $routes ?: $d['routes'],
                'subject'        => sanitize_text_field($v['subject'] ?? '') ?: $d['subject'],
                'questions'      => empty($v['questions']) ? 0 : 1,
                'ack_enabled'    => empty($v['ack_enabled']) ? 0 : 1,
                'ack_reply_to'   => implode(', ', ndc_forms_emails($v['ack_reply_to'] ?? '')),
                'ack_subject_fr' => sanitize_text_field($v['ack_subject_fr'] ?? '') ?: $d['ack_subject_fr'],
                'ack_body_fr'    => sanitize_textarea_field($v['ack_body_fr'] ?? '') ?: $d['ack_body_fr'],
                'ack_subject_en' => sanitize_text_field($v['ack_subject_en'] ?? '') ?: $d['ack_subject_en'],
                'ack_body_en'    => sanitize_textarea_field($v['ack_body_en'] ?? '') ?: $d['ack_body_en'],
            ];
        },
    ]);
});

add_action('admin_menu', function () {
    add_options_page('Formulaires NDC', 'Formulaires NDC', 'manage_options', 'ndc-formulaires', 'ndc_forms_settings_page');
    add_submenu_page('edit.php?post_type=lead', 'Accès aux ressources', 'Accès aux ressources', 'manage_options', 'ndc-acces-ressources', 'ndc_forms_resources_page');
});

// Bouton de test : tout part vers l'administrateur connecté uniquement.
add_action('admin_post_ndc_forms_test', function () {
    if (!current_user_can('manage_options')) wp_die('Accès refusé.');
    check_admin_referer('ndc_forms_test');
    $s = ndc_forms_settings();
    $me = wp_get_current_user()->user_email;
    $idx = (int) ($_POST['route'] ?? 0);
    $route = $s['routes'][$idx] ?? $s['routes'][0];
    $f = [
        'type' => 'contact', 'email' => 'visiteur@exemple.fr', 'prenom' => 'Jean', 'nom' => 'Dupont',
        'telephone' => '01 23 45 67 89', 'entreprise' => 'Exemple SAS', 'objet' => $route['label'],
        'message' => "Message de test des formulaires NDC.\nAucune action n'est nécessaire.",
        'source_url' => home_url('/contact'), 'utm_source' => '', 'utm_medium' => '', 'utm_campaign' => '',
        'date' => wp_date('d/m/Y à H:i'),
    ];
    $note = '<p style="font-family:Arial;font-size:13px;background:#fff7e0;padding:8px 12px"><strong>TEST</strong> — en réel, cet e-mail partirait à : '
          . esc_html('To: ' . $route['to'] . ($route['cc'] ? ' | Cc: ' . $route['cc'] : '') . ($route['bcc'] ? ' | Bcc: ' . $route['bcc'] : '')) . '</p>';
    [$ok1] = ndc_forms_mail($me, '[TEST] ' . ndc_forms_subject($s['subject'], $f, $route['label']), $note . ndc_forms_internal_html($f, $route['label']), []);
    [$ok2] = ndc_forms_mail($me, '[TEST] ' . $s['ack_subject_fr'], ndc_forms_ack_html($s['ack_body_fr']), []);
    wp_safe_redirect(add_query_arg('ndc_test', ($ok1 && $ok2) ? 'ok' : 'ko', admin_url('options-general.php?page=ndc-formulaires')));
    exit;
});

function ndc_forms_settings_page() {
    if (!current_user_can('manage_options')) return;
    $s = ndc_forms_settings();
    $routes = array_merge($s['routes'], [['label' => '', 'label_en' => '', 'to' => '', 'cc' => '', 'bcc' => '']]);
    $n = 'ndc_forms';
    ?>
    <div class="wrap">
        <h1>Formulaires NDC</h1>
        <?php if (isset($_GET['ndc_test'])) : ?>
            <div class="notice notice-<?php echo $_GET['ndc_test'] === 'ok' ? 'success' : 'error'; ?> is-dismissible"><p><?php
                echo $_GET['ndc_test'] === 'ok'
                    ? 'E-mails de test envoyés à votre adresse (' . esc_html(wp_get_current_user()->user_email) . ') : vérifiez la réception et les indésirables.'
                    : 'Échec de l\'envoi : vérifiez les réglages de l\'extension Mailjet (envoi des e-mails WordPress, expéditeur validé).';
            ?></p></div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php settings_fields('ndc_forms'); ?>

            <h2>Routage du formulaire de contact</h2>
            <p>L'objet choisi par le visiteur détermine les destinataires. Un objet inconnu part vers la ligne « Autres ».
                Plusieurs adresses : séparées par des virgules. Pour supprimer une ligne, videz sa typologie.</p>
            <table class="widefat striped" style="max-width:1200px">
                <thead><tr><th>Typologie (FR)</th><th>Libellé anglais</th><th>Destinataire(s) To</th><th>Copie Cc</th><th>Copie cachée Bcc</th></tr></thead>
                <tbody>
                <?php foreach ($routes as $i => $r) : ?>
                    <tr>
                        <td><input type="text" class="regular-text" style="width:100%" name="<?php echo $n; ?>[routes][<?php echo $i; ?>][label]" value="<?php echo esc_attr($r['label']); ?>" placeholder="Nouvelle typologie" /></td>
                        <td><input type="text" style="width:100%" name="<?php echo $n; ?>[routes][<?php echo $i; ?>][label_en]" value="<?php echo esc_attr($r['label_en'] ?? ''); ?>" /></td>
                        <td><textarea rows="2" style="width:100%" name="<?php echo $n; ?>[routes][<?php echo $i; ?>][to]"><?php echo esc_textarea($r['to']); ?></textarea></td>
                        <td><textarea rows="2" style="width:100%" name="<?php echo $n; ?>[routes][<?php echo $i; ?>][cc]"><?php echo esc_textarea($r['cc'] ?? ''); ?></textarea></td>
                        <td><textarea rows="2" style="width:100%" name="<?php echo $n; ?>[routes][<?php echo $i; ?>][bcc]"><?php echo esc_textarea($r['bcc'] ?? ''); ?></textarea></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>

            <table class="form-table" role="presentation">
                <tr><th scope="row"><label for="ndc-subject">Objet de l'e-mail interne</label></th>
                    <td><input id="ndc-subject" type="text" class="large-text" name="<?php echo $n; ?>[subject]" value="<?php echo esc_attr($s['subject']); ?>" />
                        <p class="description">Variables : <code>{typologie}</code>, <code>{societe_ou_nom}</code>, <code>{societe}</code>, <code>{nom}</code>.</p></td></tr>
                <tr><th scope="row">Questions de l'assistant</th>
                    <td><label><input type="checkbox" name="<?php echo $n; ?>[questions]" value="1" <?php checked(!empty($s['questions'])); ?> />
                        Envoyer aussi les questions posées à l'assistant du site (vers la ligne « Autres », sans accusé de réception)</label></td></tr>
            </table>

            <h2>Accusé de réception au demandeur</h2>
            <table class="form-table" role="presentation">
                <tr><th scope="row">Envoi</th>
                    <td><label><input type="checkbox" name="<?php echo $n; ?>[ack_enabled]" value="1" <?php checked(!empty($s['ack_enabled'])); ?> />
                        Envoyer un accusé de réception pour chaque demande du formulaire de contact</label>
                        <p class="description">En anglais si la demande vient de la version anglaise du site. L'adresse d'expédition est celle réglée dans Mailjet (à valider dans Mailjet).</p></td></tr>
                <tr><th scope="row"><label for="ndc-reply">Adresse de réponse</label></th>
                    <td><input id="ndc-reply" type="email" class="regular-text" name="<?php echo $n; ?>[ack_reply_to]" value="<?php echo esc_attr($s['ack_reply_to']); ?>" placeholder="ex. contact@nationdatacenter.fr" />
                        <p class="description">Facultatif : adresse qui reçoit la réponse si le demandeur répond à l'accusé.</p></td></tr>
                <tr><th scope="row">Français</th>
                    <td><input type="text" class="large-text" name="<?php echo $n; ?>[ack_subject_fr]" value="<?php echo esc_attr($s['ack_subject_fr']); ?>" /><br /><br />
                        <textarea class="large-text" rows="9" name="<?php echo $n; ?>[ack_body_fr]"><?php echo esc_textarea($s['ack_body_fr']); ?></textarea></td></tr>
                <tr><th scope="row">Anglais</th>
                    <td><input type="text" class="large-text" name="<?php echo $n; ?>[ack_subject_en]" value="<?php echo esc_attr($s['ack_subject_en']); ?>" /><br /><br />
                        <textarea class="large-text" rows="9" name="<?php echo $n; ?>[ack_body_en]"><?php echo esc_textarea($s['ack_body_en']); ?></textarea></td></tr>
            </table>
            <?php submit_button('Enregistrer'); ?>
        </form>

        <hr />
        <h2>Tester</h2>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="ndc_forms_test" />
            <?php wp_nonce_field('ndc_forms_test'); ?>
            <p>Envoie à <strong>votre adresse uniquement</strong> l'e-mail interne d'une typologie (avec la liste des destinataires réels) et l'accusé de réception.
                Enregistrez d'abord vos modifications.</p>
            <select name="route"><?php foreach ($s['routes'] as $i => $r) echo '<option value="' . (int) $i . '">' . esc_html($r['label']) . '</option>'; ?></select>
            <?php submit_button('Envoyer les e-mails de test', 'secondary', 'submit', false); ?>
        </form>
    </div>
    <?php
}

/* =========================================================================
 * 5. Suivi sur la fiche du lead
 * ====================================================================== */

add_action('add_meta_boxes', function () {
    add_meta_box('ndc_lead_suivi', 'Suivi (accès et envois)', function ($post) {
        $rows = [
            'Catégorie'          => get_post_meta($post->ID, 'categorie', true),
            'Langue'             => strtoupper((string) get_post_meta($post->ID, 'langue', true)),
            'Adresse du document'=> get_post_meta($post->ID, 'ressource_url', true),
            'Statut de l\'accès' => get_post_meta($post->ID, 'statut_acces', true),
            'UTM'                => trim(implode(' / ', array_filter([
                get_post_meta($post->ID, 'utm_source', true), get_post_meta($post->ID, 'utm_medium', true),
                get_post_meta($post->ID, 'utm_campaign', true), get_post_meta($post->ID, 'utm_term', true),
                get_post_meta($post->ID, 'utm_content', true),
            ]))),
        ];
        foreach (['_ndc_mail_interne' => 'E-mail interne', '_ndc_mail_accuse' => 'Accusé de réception'] as $k => $label) {
            $t = get_post_meta($post->ID, $k, true);
            if (is_array($t)) {
                $rows[$label] = sprintf('%s le %s — %s%s', $t['statut'], $t['date'], $t['destinataires'], $t['erreur'] ? ' — ' . $t['erreur'] : '');
            }
        }
        echo '<table class="widefat striped"><tbody>';
        $any = false;
        foreach ($rows as $label => $v) {
            if ($v === '' || $v === null) continue;
            $any = true;
            echo '<tr><th style="width:160px">' . esc_html($label) . '</th><td>' . esc_html($v) . '</td></tr>';
        }
        if (!$any) echo '<tr><td>Aucune information complémentaire.</td></tr>';
        echo '</tbody></table>';
    }, 'lead', 'normal', 'default');
});

/* =========================================================================
 * 6. Vue « Accès aux ressources » (Leads du site → Accès aux ressources)
 * ====================================================================== */

/** Paramètres de filtre/tri lus dans l'URL (vue et export). */
function ndc_forms_res_filters() {
    $g = function ($k) { return isset($_GET[$k]) ? sanitize_text_field(wp_unslash($_GET[$k])) : ''; };
    $orderby = in_array($g('orderby'), ['date', 'email', 'ressource', 'langue', 'statut_acces'], true) ? $g('orderby') : 'date';
    return [
        's'       => $g('s'),
        'doc'     => $g('doc'),
        'lang'    => in_array($g('lang'), ['fr', 'en'], true) ? $g('lang') : '',
        'from'    => preg_match('/^\d{4}-\d{2}-\d{2}$/', $g('from')) ? $g('from') : '',
        'to'      => preg_match('/^\d{4}-\d{2}-\d{2}$/', $g('to')) ? $g('to') : '',
        'orderby' => $orderby,
        'order'   => strtolower($g('order')) === 'asc' ? 'ASC' : 'DESC',
    ];
}

function ndc_forms_res_query(array $f, $paged = 1, $per_page = 50) {
    $meta = ['relation' => 'AND', ['key' => 'type', 'value' => ['brochure', 'download'], 'compare' => 'IN']];
    if ($f['s'] !== '')    $meta[] = ['key' => 'email', 'value' => $f['s'], 'compare' => 'LIKE'];
    if ($f['doc'] !== '')  $meta[] = ['key' => 'ressource', 'value' => $f['doc']];
    if ($f['lang'] !== '') $meta[] = ['key' => 'langue', 'value' => $f['lang']];
    $args = [
        'post_type' => 'lead', 'post_status' => 'publish', 'meta_query' => $meta,
        'posts_per_page' => $per_page, 'paged' => $paged, 'orderby' => 'date', 'order' => $f['order'],
    ];
    $date = [];
    if ($f['from'] !== '') $date['after'] = $f['from'];
    if ($f['to'] !== '')   $date['before'] = $f['to'];
    if ($date) $args['date_query'] = [array_merge($date, ['inclusive' => true])];
    if ($f['orderby'] === 'date') {
        return new WP_Query($args);
    }
    // Tri sur un champ (e-mail, document…) : fait ici, pour garder aussi les
    // demandes anciennes où ce champ est vide.
    $all = new WP_Query(array_merge($args, ['posts_per_page' => -1, 'paged' => 1, 'fields' => 'ids']));
    $ids = $all->posts;
    $key = $f['orderby'];
    usort($ids, function ($a, $b) use ($key, $f) {
        $c = strcasecmp((string) get_post_meta($a, $key, true), (string) get_post_meta($b, $key, true));
        return $f['order'] === 'ASC' ? $c : -$c;
    });
    $total = count($ids);
    if ($per_page > 0) $ids = array_slice($ids, ($paged - 1) * $per_page, $per_page);
    $q = new WP_Query();
    $q->posts = array_map('get_post', $ids);
    $q->post_count = count($q->posts);
    $q->found_posts = $total;
    $q->max_num_pages = $per_page > 0 ? (int) ceil($total / $per_page) : 1;
    return $q;
}

function ndc_forms_res_row($id) {
    $src = trim(implode(' / ', array_filter([get_post_meta($id, 'utm_source', true), get_post_meta($id, 'utm_medium', true), get_post_meta($id, 'utm_campaign', true)])));
    return [
        'date'      => get_the_date('d/m/Y H:i', $id),
        'email'     => (string) get_post_meta($id, 'email', true),
        'ressource' => (string) get_post_meta($id, 'ressource', true),
        'categorie' => (string) get_post_meta($id, 'categorie', true),
        'langue'    => strtoupper((string) get_post_meta($id, 'langue', true)),
        'source'    => $src !== '' ? $src : (string) get_post_meta($id, 'source_url', true),
        'statut'    => (string) get_post_meta($id, 'statut_acces', true) ?: 'ouvert',
        'url'       => (string) get_post_meta($id, 'ressource_url', true),
        'page'      => (string) get_post_meta($id, 'source_url', true),
    ];
}

function ndc_forms_resources_page() {
    if (!current_user_can('manage_options')) return;
    global $wpdb;
    $f = ndc_forms_res_filters();
    $paged = max(1, (int) ($_GET['paged'] ?? 1));
    $q = ndc_forms_res_query($f, $paged);
    $docs = $wpdb->get_col("SELECT DISTINCT pm.meta_value FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id
        WHERE p.post_type = 'lead' AND pm.meta_key = 'ressource' AND pm.meta_value <> '' ORDER BY pm.meta_value");
    $base = admin_url('edit.php?post_type=lead&page=ndc-acces-ressources');
    $keep = array_filter(['s' => $f['s'], 'doc' => $f['doc'], 'lang' => $f['lang'], 'from' => $f['from'], 'to' => $f['to']]);
    $sort = function ($key, $label) use ($f, $base, $keep) {
        $order = ($f['orderby'] === $key && $f['order'] === 'DESC') ? 'asc' : 'desc';
        $arrow = $f['orderby'] === $key ? ($f['order'] === 'DESC' ? ' ↓' : ' ↑') : '';
        return '<a href="' . esc_url(add_query_arg(array_merge($keep, ['orderby' => $key, 'order' => $order]), $base)) . '">' . esc_html($label) . $arrow . '</a>';
    };
    $export = wp_nonce_url(add_query_arg(array_merge($keep, ['action' => 'ndc_export_ressources', 'orderby' => $f['orderby'], 'order' => strtolower($f['order'])]), admin_url('admin-post.php')), 'ndc_export_ressources');
    ?>
    <div class="wrap">
        <h1 class="wp-heading-inline">Téléchargements / accès aux ressources</h1>
        <a href="<?php echo esc_url($export); ?>" class="page-title-action">⬇ Exporter (CSV / Excel)</a>
        <hr class="wp-header-end" />
        <form method="get" style="margin:12px 0;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <input type="hidden" name="post_type" value="lead" />
            <input type="hidden" name="page" value="ndc-acces-ressources" />
            <input type="search" name="s" value="<?php echo esc_attr($f['s']); ?>" placeholder="Rechercher un e-mail" />
            <select name="doc"><option value="">Tous les documents</option>
                <?php foreach ($docs as $d) echo '<option value="' . esc_attr($d) . '"' . selected($f['doc'], $d, false) . '>' . esc_html($d) . '</option>'; ?>
            </select>
            <select name="lang">
                <option value="">Toutes les langues</option>
                <option value="fr" <?php selected($f['lang'], 'fr'); ?>>Français</option>
                <option value="en" <?php selected($f['lang'], 'en'); ?>>Anglais</option>
            </select>
            <label>Du <input type="date" name="from" value="<?php echo esc_attr($f['from']); ?>" /></label>
            <label>au <input type="date" name="to" value="<?php echo esc_attr($f['to']); ?>" /></label>
            <button class="button">Filtrer</button>
            <?php if ($keep) : ?><a class="button-link" href="<?php echo esc_url($base); ?>">Réinitialiser</a><?php endif; ?>
        </form>
        <p><?php echo (int) $q->found_posts; ?> demande(s).</p>
        <table class="widefat striped">
            <thead><tr>
                <th><?php echo $sort('date', 'Date et heure'); ?></th>
                <th><?php echo $sort('email', 'E-mail'); ?></th>
                <th><?php echo $sort('ressource', 'Document'); ?></th>
                <th>Catégorie</th>
                <th><?php echo $sort('langue', 'Langue'); ?></th>
                <th>Source</th>
                <th><?php echo $sort('statut_acces', 'Statut'); ?></th>
            </tr></thead>
            <tbody>
            <?php if (!$q->have_posts()) : ?>
                <tr><td colspan="7">Aucune demande d'accès pour ces critères.</td></tr>
            <?php endif; ?>
            <?php foreach ($q->posts as $p) : $r = ndc_forms_res_row($p->ID); ?>
                <tr>
                    <td><a href="<?php echo esc_url(get_edit_post_link($p->ID)); ?>"><?php echo esc_html($r['date']); ?></a></td>
                    <td><?php echo esc_html($r['email']); ?></td>
                    <td><?php echo $r['url'] ? '<a href="' . esc_url($r['url']) . '" target="_blank" rel="noopener">' . esc_html($r['ressource']) . '</a>' : esc_html($r['ressource']); ?></td>
                    <td><?php echo esc_html($r['categorie']); ?></td>
                    <td><?php echo esc_html($r['langue']); ?></td>
                    <td><?php echo esc_html($r['source']); ?></td>
                    <td><?php echo esc_html($r['statut']); ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        <?php
        $links = paginate_links([
            'base' => add_query_arg('paged', '%#%', add_query_arg(array_merge($keep, ['orderby' => $f['orderby'], 'order' => strtolower($f['order'])]), $base)),
            'format' => '', 'current' => $paged, 'total' => max(1, (int) $q->max_num_pages),
        ]);
        if ($links) echo '<div class="tablenav"><div class="tablenav-pages">' . $links . '</div></div>';
        ?>
    </div>
    <?php
}

add_action('admin_post_ndc_export_ressources', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('ndc_export_ressources')) {
        wp_die('Action non autorisée.');
    }
    $q = ndc_forms_res_query(ndc_forms_res_filters(), 1, -1);
    nocache_headers();
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="acces-ressources-ndc-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // accents corrects dans Excel
    fputcsv($out, ['Date et heure', 'E-mail', 'Document', 'Catégorie', 'Langue', 'Adresse du document', 'Page d\'origine', 'Source (UTM)', 'Statut'], ';');
    foreach ($q->posts as $p) {
        $r = ndc_forms_res_row($p->ID);
        $utm = trim(implode(' / ', array_filter([get_post_meta($p->ID, 'utm_source', true), get_post_meta($p->ID, 'utm_medium', true), get_post_meta($p->ID, 'utm_campaign', true)])));
        fputcsv($out, [$r['date'], $r['email'], $r['ressource'], $r['categorie'], $r['langue'], $r['url'], $r['page'], $utm, $r['statut']], ';');
    }
    fclose($out);
    exit;
});
