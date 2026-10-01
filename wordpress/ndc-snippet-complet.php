/**
 * NDC — Datacenters (+ Certifications, Home ACF, Groupe & Equipe editables)
 * Accueil : Brochure, Logo du site, Image section Pourquoi choisir NDC (engImage).
 * Pages groupe/equipes editables ; statuts DC ; poles equipe renommes.
 *
 * MISE À JOUR — documents téléversés :
 * les groupes « document » des Articles et des fiches Datacenter acceptent
 * désormais un FICHIER téléversé depuis la médiathèque (sous-champ « fichier »),
 * en plus du lien externe historique (sous-champ « url », conservé pour les
 * documents déjà renseignés et pour les fichiers hébergés ailleurs).
 * Le fichier téléversé est prioritaire sur le lien.
 *
 * MISE À JOUR — pages légales administrables (voir la fin du fichier) :
 * Mentions légales, Politique de protection des données personnelles et
 * Politique de cookies sont créées une fois (FR + EN liées dans Polylang),
 * modifiables dans Pages ; slug FR verrouillé ; rafraîchissement du site à
 * chaque enregistrement (constantes NDC_NEXT_URL / NDC_REVALIDATE_SECRET).
 */

if (!defined('ABSPATH')) {
    exit;
}

/* =========================================================================
 * Helper : règle de localisation ACF ciblant la page de slug $slug ET toutes
 * ses traductions Polylang. Avec Polylang chaque langue a un slug différent
 * (ex. « accueil » en FR, « accueil-2 » en EN) : on part de la page trouvée
 * puis on récupère toutes ses traductions par leur ID (indépendant du slug).
 * Repli : si aucune page trouvée, on cible l'ID 0 → le groupe ne s'affiche
 * nulle part (jamais « toutes les pages », pour ne rien polluer).
 * ====================================================================== */
if (!function_exists('ndc_acf_page_location')) {
    function ndc_acf_page_location($slug) {
        $found = get_posts([
            'post_type'        => 'page',
            'name'             => $slug,
            'post_status'      => 'any',
            'posts_per_page'   => 1,
            'fields'           => 'ids',
            'suppress_filters' => true, // ignore le filtre de langue Polylang
        ]);
        $ids = [];
        if (!empty($found)) {
            $base = (int) $found[0];
            $ids  = [$base];
            if (function_exists('pll_get_post_translations')) {
                $tr = pll_get_post_translations($base);
                if (!empty($tr)) {
                    $ids = array_map('intval', array_values($tr));
                }
            }
            $ids = array_values(array_unique($ids));
        }
        if (empty($ids)) {
            return [[['param' => 'page', 'operator' => '==', 'value' => '0']]];
        }
        $loc = [];
        foreach ($ids as $id) {
            // chaque règle dans son propre tableau = condition « OU »
            $loc[] = [['param' => 'page', 'operator' => '==', 'value' => (string) $id]];
        }
        return $loc;
    }
}

/* =========================================================================
 * CPT datacenter
 * ====================================================================== */
add_action('init', function () {
    register_post_type('datacenter', [
        'label'               => 'Datacenters',
        'labels'              => ['name' => 'Datacenters', 'singular_name' => 'Datacenter'],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-building',
        'supports'            => ['title', 'editor', 'thumbnail', 'page-attributes'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'datacenter',
        'graphql_plural_name' => 'datacenters',
    ]);
});

/* =========================================================================
 * CPT faq  → query : faqs { nodes { title faqFields { reponse } } }
 *   Le TITRE de la question fait office de question affichée.
 *   'page-attributes' active l'ordre manuel (menu_order) pour trier la FAQ.
 * ====================================================================== */
add_action('init', function () {
    register_post_type('faq', [
        'label'               => 'FAQ',
        'labels'              => ['name' => 'FAQ', 'singular_name' => 'Question', 'add_new_item' => 'Ajouter une question'],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-editor-help',
        'supports'            => ['title', 'page-attributes'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'faq',
        'graphql_plural_name' => 'faqs',
    ]);
});

/* =========================================================================
 * Champs ACF
 * ====================================================================== */
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    /* ---- Datacenter ---- */
    acf_add_local_field_group([
        'key'                => 'group_ndc_datacenter',
        'title'              => 'Datacenter — champs',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'datacenterFields',
        'location'           => [[['param' => 'post_type', 'operator' => '==', 'value' => 'datacenter']]],
        'fields' => [
            ['key' => 'field_ndc_ville',     'label' => 'Ville',     'name' => 'ville',     'type' => 'text'],
            ['key' => 'field_ndc_region',    'label' => 'Région',    'name' => 'region',    'type' => 'text'],
            [
                'key' => 'field_ndc_statut', 'label' => 'Statut', 'name' => 'statut', 'type' => 'select',
                'choices' => ['livre' => 'Opérationnel', 'construction' => 'En cours', 'avenir' => 'À venir'],
                'return_format' => 'value', 'multiple' => 0, 'ui' => 1,
            ],
            ['key' => 'field_ndc_accroche',  'label' => 'Accroche',  'name' => 'accroche',  'type' => 'text'],
            ['key' => 'field_ndc_latitude',  'label' => 'Latitude',  'name' => 'latitude',  'type' => 'number', 'step' => 'any'],
            ['key' => 'field_ndc_longitude', 'label' => 'Longitude', 'name' => 'longitude', 'type' => 'number', 'step' => 'any'],
            ['key' => 'field_ndc_puissance', 'label' => 'Puissance', 'name' => 'puissance', 'type' => 'text'],
            ['key' => 'field_ndc_description', 'label' => 'Description', 'name' => 'description', 'type' => 'textarea'],
            [
                'key' => 'field_ndc_kpis', 'label' => 'KPIs', 'name' => 'kpis', 'type' => 'repeater', 'layout' => 'table',
                'button_label' => 'Ajouter un KPI',
                'sub_fields' => [
                    ['key' => 'field_ndc_kpi_label',  'label' => 'Label',  'name' => 'label',  'type' => 'text'],
                    ['key' => 'field_ndc_kpi_valeur', 'label' => 'Valeur', 'name' => 'valeur', 'type' => 'text'],
                    ['key' => 'field_ndc_kpi_unite',  'label' => 'Unité',  'name' => 'unite',  'type' => 'text'],
                ],
            ],
            [
                'key' => 'field_ndc_caracs', 'label' => 'Caractéristiques', 'name' => 'caracteristiques', 'type' => 'repeater', 'layout' => 'table',
                'button_label' => 'Ajouter une caractéristique',
                'sub_fields' => [
                    ['key' => 'field_ndc_carac_cat',      'label' => 'Catégorie', 'name' => 'categorie', 'type' => 'text'],
                    ['key' => 'field_ndc_carac_intitule', 'label' => 'Intitulé',  'name' => 'intitule',  'type' => 'text'],
                    ['key' => 'field_ndc_carac_detail',   'label' => 'Détail',    'name' => 'detail',    'type' => 'text'],
                ],
            ],
            [
                'key' => 'field_ndc_benefices', 'label' => 'Bénéfices', 'name' => 'benefices', 'type' => 'repeater', 'layout' => 'block',
                'button_label' => 'Ajouter un bénéfice',
                'sub_fields' => [
                    ['key' => 'field_ndc_benef_titre', 'label' => 'Titre', 'name' => 'titre', 'type' => 'text'],
                    ['key' => 'field_ndc_benef_texte', 'label' => 'Texte', 'name' => 'texte', 'type' => 'textarea'],
                ],
            ],
            /* ---- Document de la fiche : fichier téléversé OU lien externe ----
             *  Le sous-champ « fichier » (médiathèque) est prioritaire ; « url »
             *  reste là pour les documents déjà saisis et pour un fichier hébergé
             *  ailleurs. Les clés (key) sont inchangées : aucune donnée n'est perdue.
             */
            [
                'key' => 'field_ndc_document', 'label' => 'Document (brochure)', 'name' => 'document', 'type' => 'group', 'layout' => 'block',
                'sub_fields' => [
                    [
                        'key'                => 'field_ndc_doc_fichier',
                        'label'              => 'Fichier',
                        'name'               => 'fichier',
                        'type'               => 'file',
                        'return_format'      => 'array',
                        'library'            => 'all',
                        'mime_types'         => 'pdf,doc,docx,xls,xlsx,ppt,pptx,zip',
                        'instructions'       => 'Téléverse le document depuis la médiathèque. C\'est la façon normale de procéder : le fichier reste dans la médiathèque et peut être remplacé sans changer le lien.',
                        'required'           => 0,
                        'show_in_graphql'    => 1,
                        'graphql_field_name' => 'fichier',
                    ],
                    [
                        'key' => 'field_ndc_doc_url', 'label' => 'Lien externe (optionnel)', 'name' => 'url', 'type' => 'url',
                        'instructions' => 'À remplir uniquement si le document est hébergé ailleurs. Ignoré dès qu\'un fichier est téléversé ci-dessus.',
                        'required' => 0,
                    ],
                    [
                        'key' => 'field_ndc_doc_titre', 'label' => 'Titre affiché', 'name' => 'titre', 'type' => 'text',
                        'instructions' => 'Nom du document tel qu\'il apparaît sur le site (ex. « Plaquette — NDC Rennes 1 »).',
                        'required' => 0,
                    ],
                ],
            ],
            [
                'key' => 'field_ndc_dc_photos',
                'label' => 'Galerie photos (bas de page)',
                'name' => 'dc_photos',
                'type' => 'repeater',
                'instructions' => 'Photos affichées en bas de la fiche du data center. Glisser-déposer pour changer l ordre. Vide = pas de galerie.',
                'layout' => 'table',
                'button_label' => 'Ajouter une photo',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'photos',
                'sub_fields' => [
                    [
                        'key' => 'field_ndc_dc_photos_photo',
                        'label' => 'Photo',
                        'name' => 'photo',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'photo',
                    ],
                ],
            ],
        ],
    ]);

    /* ---- FAQ : un seul champ « reponse » (le titre = la question) ---- */
    acf_add_local_field_group([
        'key'                => 'group_ndc_faq',
        'title'              => 'FAQ — réponse',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'faqFields',
        'location'           => [[['param' => 'post_type', 'operator' => '==', 'value' => 'faq']]],
        'fields' => [
            [
                'key' => 'field_ndc_faq_reponse', 'label' => 'Réponse', 'name' => 'reponse',
                'type' => 'textarea', 'rows' => 4,
                'instructions' => 'Le titre de la question (ci-dessus) sert de question affichée.',
            ],
        ],
    ]);

    /* ---- Article : document à télécharger (sur les Articles natifs) ----
     *  query : post → articleFields { document { fichier { node { mediaItemUrl } } url titre } }
     *  Comme pour les data centers : fichier téléversé prioritaire, lien externe en repli.
     */
    acf_add_local_field_group([
        'key'                => 'group_ndc_article',
        'title'              => 'Article — champs',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'articleFields',
        'location'           => [[['param' => 'post_type', 'operator' => '==', 'value' => 'post']]],
        'fields' => [
            [
                'key' => 'field_ndc_art_document', 'label' => 'Document à télécharger', 'name' => 'document',
                'type' => 'group', 'layout' => 'block',
                'sub_fields' => [
                    [
                        'key'                => 'field_ndc_art_doc_fichier',
                        'label'              => 'Fichier',
                        'name'               => 'fichier',
                        'type'               => 'file',
                        'return_format'      => 'array',
                        'library'            => 'all',
                        'mime_types'         => 'pdf,doc,docx,xls,xlsx,ppt,pptx,zip',
                        'instructions'       => 'Téléverse le document depuis la médiathèque. Le lecteur devra saisir son e-mail pour l\'obtenir : chaque téléchargement crée un lead.',
                        'required'           => 0,
                        'show_in_graphql'    => 1,
                        'graphql_field_name' => 'fichier',
                    ],
                    [
                        'key' => 'field_ndc_art_doc_url', 'label' => 'Lien externe (optionnel)', 'name' => 'url', 'type' => 'url',
                        'instructions' => 'À remplir uniquement si le document est hébergé ailleurs. Ignoré dès qu\'un fichier est téléversé ci-dessus.',
                        'required' => 0,
                    ],
                    [
                        'key' => 'field_ndc_art_doc_titre', 'label' => 'Titre affiché', 'name' => 'titre', 'type' => 'text',
                        'instructions' => 'Nom du document tel qu\'il apparaît dans l\'encart de téléchargement en fin d\'article.',
                        'required' => 0,
                    ],
                ],
            ],
            [
                'key' => 'field_ndc_art_auteur', 'label' => 'Auteur (nom affiché)', 'name' => 'auteur', 'type' => 'text',
                'instructions' => 'Nom libre du rédacteur. Laisse vide pour garder l\'auteur WordPress par défaut.',
            ],
        ],
    ]);
});

/* =========================================================================
 * CPT certification  → query : certifications { nodes { title certificationFields { ... } } }
 *   Le TITRE du post = nom de la certif (ex. « ISO 27001 »).
 *   'page-attributes' active l'ordre manuel (menu_order).
 * ====================================================================== */
add_action('init', function () {
    register_post_type('certification', [
        'label'               => 'Certifications',
        'labels'              => ['name' => 'Certifications', 'singular_name' => 'Certification'],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-awards',
        'supports'            => ['title', 'thumbnail', 'page-attributes'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'certification',
        'graphql_plural_name' => 'certifications',
    ]);
});

/* =========================================================================
 * CPT membre  → query : membres { nodes { title featuredImage membreFields { ... } } }
 *   Le TITRE du post = nom du membre. La PHOTO = image à la une (featuredImage).
 *   'page-attributes' active l'ordre manuel (menu_order).
 * ====================================================================== */
add_action('init', function () {
    register_post_type('membre', [
        'label'               => 'Équipe',
        'labels'              => ['name' => 'Équipe', 'singular_name' => 'Membre', 'add_new_item' => 'Ajouter un membre'],
        'public'              => true,
        'has_archive'         => false,
        'menu_icon'           => 'dashicons-groups',
        'supports'            => ['title', 'thumbnail', 'page-attributes'],
        'show_in_rest'        => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'membre',
        'graphql_plural_name' => 'membres',
    ]);
});

/* =========================================================================
 * Champs ACF — Certifications, Équipe & page Groupe Altarea
 * ====================================================================== */
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    /* ---- Certification (le titre du post = nom de la certif) ---- */
    acf_add_local_field_group([
        'key'                => 'group_ndc_certification',
        'title'              => 'Certification — champs',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'certificationFields',
        'location'           => [[['param' => 'post_type', 'operator' => '==', 'value' => 'certification']]],
        'fields' => [
            [
                'key' => 'field_ndc_cert_categorie', 'label' => 'Catégorie', 'name' => 'categorie', 'type' => 'select',
                'choices' => [
                    'securite'     => 'Sécurité de l\'information',
                    'sante'        => 'Santé',
                    'souverainete' => 'Souveraineté',
                    'energie'      => 'Énergie / Environnement',
                    'qualite'      => 'Qualité',
                    'conception'   => 'Conception / Tier',
                ],
                'return_format' => 'value', 'multiple' => 0, 'ui' => 1,
            ],
            ['key' => 'field_ndc_cert_description', 'label' => 'Description', 'name' => 'description', 'type' => 'textarea', 'rows' => 3],
            ['key' => 'field_ndc_cert_garantie',    'label' => 'Ce que ça garantit', 'name' => 'garantie', 'type' => 'text'],
            [
                'key' => 'field_ndc_cert_statut', 'label' => 'Statut', 'name' => 'statut', 'type' => 'select',
                'choices' => ['conforme' => 'Conforme', 'en-cours' => 'En cours', 'vise' => 'Visé'],
                'return_format' => 'value', 'multiple' => 0, 'ui' => 1,
            ],
            [
                'key' => 'field_ndc_cert_souverainete', 'label' => 'Enjeu souveraineté', 'name' => 'souverainete', 'type' => 'true_false', 'ui' => 1,
                'instructions' => 'Coche pour mettre en avant cette certif dans l\'éclairage souveraineté (SecNumCloud, HDS, hébergement national).',
            ],
            [
                'key' => 'field_ndc_cert_logo', 'label' => 'Logo / badge (optionnel)', 'name' => 'logo', 'type' => 'image',
                'return_format' => 'array', 'preview_size' => 'medium',
            ],
        ],
    ]);

    /* ---- Membre (le titre du post = nom ; la photo = image à la une) ---- */
    acf_add_local_field_group([
        'key'                => 'group_ndc_membre',
        'title'              => 'Membre — champs',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'membreFields',
        'location'           => [[['param' => 'post_type', 'operator' => '==', 'value' => 'membre']]],
        'fields' => [
            ['key' => 'field_ndc_mb_poste', 'label' => 'Poste', 'name' => 'poste', 'type' => 'text'],
            [
                'key' => 'field_ndc_mb_pole', 'label' => 'Pôle', 'name' => 'pole', 'type' => 'select',
                'choices' => [
                    'directionTechnique' => 'Direction Technique',
                    'directionGenerale'  => 'Direction Générale',
                    'operations'         => 'Opérations',
                    'commerce'           => 'Commerce',
                    'exploitation'       => 'Exploitation',
                    'developpement'      => 'Développement',
                    'transverse'         => 'Transverse',
                ],
                'return_format' => 'value', 'multiple' => 0, 'ui' => 1,
            ],
            ['key' => 'field_ndc_mb_bio',      'label' => 'Bio courte', 'name' => 'bio', 'type' => 'textarea', 'rows' => 3],
            ['key' => 'field_ndc_mb_linkedin', 'label' => 'LinkedIn (URL, optionnel)', 'name' => 'linkedin', 'type' => 'url'],
        ],
    ]);

    /* ---- Groupe Altarea : la PAGE « groupe » 100 % éditable ----
     *  Crée une Page WordPress avec le permalien « groupe » puis remplis ces
     *  champs : chaque section du front (hero, chiffres, métiers, engagement,
     *  CTA final) lit son texte ici, avec repli sur les textes par défaut du
     *  site quand un champ est vide.
     *  Localisation : page « groupe » + traductions Polylang.
     *  query : pages(where:{name:"groupe"}) { nodes { groupeFields { ... } } }
     */
    acf_add_local_field_group([
        'key'                => 'group_ndc_groupe',
        'title'              => 'Page Groupe Altarea — Contenu éditorial (NDC)',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'groupeFields',
        'location'           => ndc_acf_page_location('groupe'),
        'fields' => [
            ['key' => 'field_ndc_grp_tab_hero', 'label' => 'Hero', 'name' => '', 'type' => 'tab', 'placement' => 'top'],
            ['key' => 'field_ndc_grp_hero_eyebrow', 'label' => 'Hero — Sur-titre', 'name' => 'hero_eyebrow', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroEyebrow'],
            ['key' => 'field_ndc_grp_hero_title', 'label' => 'Hero — Titre', 'name' => 'hero_title', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroTitle'],
            ['key' => 'field_ndc_grp_hero_lead', 'label' => 'Hero — Accroche', 'name' => 'hero_lead', 'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'graphql_field_name' => 'heroLead'],
            ['key' => 'field_ndc_grp_hero_cta1_label', 'label' => 'Hero — CTA principal (libellé)', 'name' => 'hero_cta1_label', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroCta1Label'],
            ['key' => 'field_ndc_grp_hero_cta1_url', 'label' => 'Hero — CTA principal (URL)', 'name' => 'hero_cta1_url', 'type' => 'text', 'instructions' => 'Par défaut : https://altarea.com', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroCta1Url'],
            ['key' => 'field_ndc_grp_hero_cta2_label', 'label' => 'Hero — CTA secondaire (libellé)', 'name' => 'hero_cta2_label', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroCta2Label'],
            ['key' => 'field_ndc_grp_hero_cta2_url', 'label' => 'Hero — CTA secondaire (URL)', 'name' => 'hero_cta2_url', 'type' => 'text', 'instructions' => 'Par défaut : #engagement (ancre vers la section Engagement).', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroCta2Url'],
            ['key' => 'field_ndc_grp_hero_image', 'label' => 'Hero — Image', 'name' => 'hero_image', 'type' => 'image', 'return_format' => 'array', 'instructions' => 'Visuel du hero. Vide = cadre par défaut.', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroImage'],
            ['key' => 'field_ndc_grp_hero_caption_title', 'label' => 'Hero — Légende (titre)', 'name' => 'hero_caption_title', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroCaptionTitle'],
            ['key' => 'field_ndc_grp_hero_caption_sub', 'label' => 'Hero — Légende (sous-texte)', 'name' => 'hero_caption_sub', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'heroCaptionSub'],

            ['key' => 'field_ndc_grp_tab_kpi', 'label' => 'Chiffres clés', 'name' => '', 'type' => 'tab', 'placement' => 'top'],
            ['key' => 'field_ndc_grp_kpi_title', 'label' => 'Bandeau chiffres — Titre', 'name' => 'kpi_title', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'kpiTitle'],
            ['key' => 'field_ndc_grp_kpi_meta', 'label' => 'Bandeau chiffres — Mention (source/année)', 'name' => 'kpi_meta', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'kpiMeta'],
            [
                'key' => 'field_ndc_grp_chiffres', 'label' => 'Chiffres clés', 'name' => 'chiffres', 'type' => 'repeater', 'layout' => 'table',
                'min' => 0, 'max' => 6, 'button_label' => 'Ajouter un chiffre',
                'instructions' => 'Vide = chiffres par défaut du site (CA, % logement, collaborateurs, rang).',
                'show_in_graphql' => 1, 'graphql_field_name' => 'chiffres',
                'sub_fields' => [
                    ['key' => 'field_ndc_grp_chiffre_valeur', 'label' => 'Valeur', 'name' => 'valeur', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'valeur'],
                    ['key' => 'field_ndc_grp_chiffre_unite',  'label' => 'Unité',  'name' => 'unite',  'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'unite'],
                    ['key' => 'field_ndc_grp_chiffre_label',  'label' => 'Label',  'name' => 'label',  'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'label'],
                ],
            ],

            ['key' => 'field_ndc_grp_tab_metiers', 'label' => 'Nos métiers', 'name' => '', 'type' => 'tab', 'placement' => 'top'],
            ['key' => 'field_ndc_grp_metiers_eyebrow', 'label' => 'Métiers — Sur-titre', 'name' => 'metiers_eyebrow', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'metiersEyebrow'],
            ['key' => 'field_ndc_grp_metiers_title', 'label' => 'Métiers — Titre', 'name' => 'metiers_title', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'metiersTitle'],
            ['key' => 'field_ndc_grp_metiers_lead', 'label' => 'Métiers — Texte d\'intro', 'name' => 'metiers_lead', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'graphql_field_name' => 'metiersLead'],
            [
                'key' => 'field_ndc_grp_metiers', 'label' => 'Métiers (cartes)', 'name' => 'metiers', 'type' => 'repeater', 'layout' => 'block',
                'min' => 0, 'max' => 8, 'button_label' => 'Ajouter un métier',
                'instructions' => 'Vide = les 4 métiers par défaut du site.',
                'show_in_graphql' => 1, 'graphql_field_name' => 'metiers',
                'sub_fields' => [
                    ['key' => 'field_ndc_grp_metier_titre', 'label' => 'Titre', 'name' => 'titre', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'titre'],
                    ['key' => 'field_ndc_grp_metier_desc',  'label' => 'Description', 'name' => 'desc', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'graphql_field_name' => 'desc'],
                    [
                        'key' => 'field_ndc_grp_metier_image',
                        'label' => 'Image',
                        'name' => 'image',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Visuel de la carte métier (tu peux reprendre les visuels d altarea.com/activites). Vide = pas d image.',
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'image',
                    ],
                ],
            ],

            ['key' => 'field_ndc_grp_tab_eng', 'label' => 'Engagement bas carbone', 'name' => '', 'type' => 'tab', 'placement' => 'top'],
            ['key' => 'field_ndc_grp_eng_eyebrow', 'label' => 'Engagement — Sur-titre', 'name' => 'eng_eyebrow', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'engEyebrow'],
            ['key' => 'field_ndc_grp_eng_title', 'label' => 'Engagement — Titre', 'name' => 'eng_title', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'engTitle'],
            ['key' => 'field_ndc_grp_eng_lead', 'label' => 'Engagement — Texte d\'intro', 'name' => 'eng_lead', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'graphql_field_name' => 'engLead'],
            ['key' => 'field_ndc_grp_eng_stat_value', 'label' => 'Engagement — Statistique (valeur)', 'name' => 'eng_stat_value', 'type' => 'text', 'instructions' => 'Ex. « -46 % ».', 'show_in_graphql' => 1, 'graphql_field_name' => 'engStatValue'],
            ['key' => 'field_ndc_grp_eng_stat_label', 'label' => 'Engagement — Statistique (légende)', 'name' => 'eng_stat_label', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'engStatLabel'],
            [
                'key' => 'field_ndc_grp_engagements', 'label' => 'Engagements (cartes)', 'name' => 'engagements', 'type' => 'repeater', 'layout' => 'block',
                'min' => 0, 'max' => 8, 'button_label' => 'Ajouter un engagement',
                'instructions' => 'Vide = les 4 engagements par défaut du site.',
                'show_in_graphql' => 1, 'graphql_field_name' => 'engagements',
                'sub_fields' => [
                    ['key' => 'field_ndc_grp_eng_titre', 'label' => 'Titre', 'name' => 'titre', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'titre'],
                    ['key' => 'field_ndc_grp_eng_desc',  'label' => 'Description', 'name' => 'desc', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'graphql_field_name' => 'desc'],
                ],
            ],

            ['key' => 'field_ndc_grp_tab_final', 'label' => 'CTA final', 'name' => '', 'type' => 'tab', 'placement' => 'top'],
            ['key' => 'field_ndc_grp_final_title', 'label' => 'CTA final — Titre', 'name' => 'final_title', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'finalTitle'],
            ['key' => 'field_ndc_grp_final_lead', 'label' => 'CTA final — Texte', 'name' => 'final_lead', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'graphql_field_name' => 'finalLead'],
            ['key' => 'field_ndc_grp_final_cta_label', 'label' => 'CTA final — Bouton (libellé)', 'name' => 'final_cta_label', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'finalCtaLabel'],
            ['key' => 'field_ndc_grp_final_cta_url', 'label' => 'CTA final — Bouton (URL)', 'name' => 'final_cta_url', 'type' => 'text', 'instructions' => 'Par défaut : https://altarea.com', 'show_in_graphql' => 1, 'graphql_field_name' => 'finalCtaUrl'],
        ],
    ]);

    /* ---- Page « Notre équipe » : en-tête éditable ----
     *  Crée une Page WordPress avec le permalien « equipes ». Les MEMBRES,
     *  eux, se gèrent dans le CPT « Membres » (nom, poste, pôle, bio,
     *  LinkedIn, photo = image mise en avant, ordre = glisser-déposer).
     *  query : pages(where:{name:"equipes"}) { nodes { equipesFields { ... } } }
     */
    acf_add_local_field_group([
        'key'                => 'group_ndc_equipes',
        'title'              => 'Page Notre équipe — En-tête (NDC)',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'equipesFields',
        'location'           => ndc_acf_page_location('equipes'),
        'fields' => [
            ['key' => 'field_ndc_eq_eyebrow', 'label' => 'Sur-titre', 'name' => 'eq_eyebrow', 'type' => 'text', 'instructions' => 'Vide = texte par défaut du site.', 'show_in_graphql' => 1, 'graphql_field_name' => 'eyebrow'],
            ['key' => 'field_ndc_eq_titre', 'label' => 'Titre (H1)', 'name' => 'eq_titre', 'type' => 'text', 'show_in_graphql' => 1, 'graphql_field_name' => 'titre'],
            ['key' => 'field_ndc_eq_intro', 'label' => 'Texte d\'introduction', 'name' => 'eq_intro', 'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'graphql_field_name' => 'intro'],
            [
                'key' => 'field_ndc_eq_poles_ordre',
                'label' => 'Ordre d affichage des pôles',
                'name' => 'eq_poles_ordre',
                'type' => 'repeater',
                'instructions' => 'Glisser-déposer les lignes pour choisir l ordre des sections sur la page. Vide = ordre par défaut du site. Un pôle absent de la liste est affiché à la fin.',
                'layout' => 'table',
                'button_label' => 'Ajouter un pôle',
                'show_in_graphql' => 1,
                'graphql_field_name' => 'polesOrdre',
                'sub_fields' => [
                    [
                        'key' => 'field_ndc_eq_poles_ordre_pole',
                        'label' => 'Pôle',
                        'name' => 'pole',
                        'type' => 'select',
                        'choices' => [
                            'directionTechnique' => 'Direction Technique',
                            'directionGenerale'  => 'Direction Générale',
                            'operations'         => 'Opérations',
                            'commerce'           => 'Commerce',
                            'exploitation'       => 'Exploitation',
                            'developpement'      => 'Développement',
                            'transverse'         => 'Transverse',
                        ],
                        'return_format' => 'value',
                        'ui' => 1,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'pole',
                    ],
                ],
            ],
        ],
    ]);

    /*  Page « Nos data centers » (liste des sites) — bandeau visite affiché
     *  sous la grille : carte du réseau + texte + bouton « Demander une visite ».
     *  Chaque champ vide = texte par défaut du site.
     *  query : pages(where:{name:"datacenters"}) { nodes { datacentersPageFields { ... } } }
     */
    acf_add_local_field_group([
        'key'                => 'group_ndc_dc_page',
        'title'              => 'Page Nos data centers — Bandeau visite (NDC)',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'datacentersPageFields',
        'location'           => ndc_acf_page_location('datacenters'),
        'fields' => [
            ['key' => 'field_ndc_dcp_tab1', 'label' => 'En-tête de page', 'type' => 'tab'],
            ['key' => 'field_ndc_dcp_eyebrow', 'label' => 'Sur-titre', 'name' => 'dcp_eyebrow', 'type' => 'text', 'instructions' => 'Ex. « Le réseau NDC ». Vide = texte par défaut du site.', 'show_in_graphql' => 1, 'graphql_field_name' => 'eyebrow'],
            ['key' => 'field_ndc_dcp_titre', 'label' => 'Titre', 'name' => 'dcp_titre', 'type' => 'text', 'instructions' => 'Ex. « Nos data centers ».', 'show_in_graphql' => 1, 'graphql_field_name' => 'titre'],
            ['key' => 'field_ndc_dcp_intro', 'label' => 'Texte d\'introduction', 'name' => 'dcp_intro', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'graphql_field_name' => 'intro'],
            ['key' => 'field_ndc_dcp_tab2', 'label' => 'Bandeau visite', 'type' => 'tab'],
            ['key' => 'field_ndc_dcp_visit_eyebrow', 'label' => 'Sur-titre du bandeau', 'name' => 'dcp_visit_eyebrow', 'type' => 'text', 'instructions' => 'Ex. « Sur le terrain ». Vide = texte par défaut du site.', 'show_in_graphql' => 1, 'graphql_field_name' => 'visitEyebrow'],
            ['key' => 'field_ndc_dcp_visit_titre', 'label' => 'Titre du bandeau', 'name' => 'dcp_visit_titre', 'type' => 'text', 'instructions' => 'Ex. « Venez visiter nos data centers ».', 'show_in_graphql' => 1, 'graphql_field_name' => 'visitTitle'],
            ['key' => 'field_ndc_dcp_visit_texte', 'label' => 'Texte du bandeau', 'name' => 'dcp_visit_texte', 'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'graphql_field_name' => 'visitText'],
            ['key' => 'field_ndc_dcp_visit_cta', 'label' => 'Libellé du bouton', 'name' => 'dcp_visit_cta', 'type' => 'text', 'instructions' => 'Ex. « Demander une visite ». Le bouton mène à la page contact.', 'show_in_graphql' => 1, 'graphql_field_name' => 'visitCta'],
        ],
    ]);
});

/* Page « datacenters » (liste des sites) créée une seule fois : porte les
   champs du bandeau visite ci-dessus (Pages → Nos data centers). */
add_action('init', function () {
    if (get_option('ndc_datacenters_page_created') === '1') {
        return;
    }
    if (!get_page_by_path('datacenters', OBJECT, 'page')) {
        $id = wp_insert_post([
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_name'    => 'datacenters',
            'post_title'   => 'Nos data centers',
            'post_content' => '',
        ]);
        if (!is_wp_error($id) && function_exists('pll_set_post_language')) {
            pll_set_post_language($id, 'fr');
        }
    }
    update_option('ndc_datacenters_page_created', '1');
}, 5);

/* Page « services » créée une seule fois + groupe « En-tête » de la page
   /services (sur-titre, titre H1, intro), exposé sous servicesPageFields. */
add_action('init', function () {
    if (get_option('ndc_services_page_created') === '1') {
        return;
    }
    if (!get_page_by_path('services', OBJECT, 'page')) {
        $id = wp_insert_post([
            'post_type'    => 'page',
            'post_status'  => 'publish',
            'post_name'    => 'services',
            'post_title'   => 'Nos services',
            'post_content' => '',
        ]);
        if (!is_wp_error($id) && function_exists('pll_set_post_language')) {
            pll_set_post_language($id, 'fr');
        }
    }
    update_option('ndc_services_page_created', '1');
}, 5);

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }
    acf_add_local_field_group([
        'key'                => 'group_ndc_services_page',
        'title'              => 'Page Nos services — En-tête (NDC)',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'servicesPageFields',
        'location'           => ndc_acf_page_location('services'),
        'fields' => [
            ['key' => 'field_ndc_svp_eyebrow', 'label' => 'Sur-titre', 'name' => 'svp_eyebrow', 'type' => 'text', 'instructions' => 'Ex. « Nos services ». Vide = texte par défaut du site.', 'show_in_graphql' => 1, 'graphql_field_name' => 'eyebrow'],
            ['key' => 'field_ndc_svp_titre', 'label' => 'Titre (H1)', 'name' => 'svp_titre', 'type' => 'text', 'instructions' => 'Ex. « Une infrastructure et des équipes à votre service ».', 'show_in_graphql' => 1, 'graphql_field_name' => 'titre'],
            ['key' => 'field_ndc_svp_intro', 'label' => 'Texte d\'introduction', 'name' => 'svp_intro', 'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'graphql_field_name' => 'intro'],
        ],
    ]);
});

/* Champ « Ordre sur l'accueil » sur les ARTICLES : permet de choisir quels
   articles apparaissent en premier dans la section Actualités de l'accueil
   (1 = grand article à la une). Vide = ordre chronologique habituel.
   La pastille de catégorie vient des catégories natives de l'article. */
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }
    acf_add_local_field_group([
        'key'                => 'group_ndc_actu',
        'title'              => 'Article — Accueil (NDC)',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'actuFields',
        'position'           => 'side',
        'location'           => [[['param' => 'post_type', 'operator' => '==', 'value' => 'post']]],
        'fields' => [
            [
                'key' => 'field_ndc_actu_home_ordre',
                'label' => 'Ordre sur l\'accueil',
                'name' => 'actu_home_ordre',
                'type' => 'number',
                'instructions' => '1 = grand article à la une, 2 et 3 ensuite. Les articles numérotés passent devant les autres ; vide = ordre chronologique.',
                'required' => 0,
                'min' => 1,
                'step' => 1,
                'show_in_graphql' => 1,
                'graphql_field_name' => 'homeOrdre',
            ],
        ],
    ]);
});

/* =========================================================================
 * CPT « lead » — captures du site (contact, question, brochure, download)
 *   Privé : visible uniquement dans l'admin WP (Leads), pas en front ni en GraphQL.
 * ====================================================================== */
add_action('init', function () {
    register_post_type('lead', [
        'label'               => 'Leads',
        'labels'              => [
            'name'               => 'Leads',
            'singular_name'      => 'Lead',
            'menu_name'          => 'Leads du site',
            'all_items'          => 'Tous les leads',
            'add_new_item'       => 'Ajouter un lead',
            'edit_item'          => 'Détail du lead',
            'view_item'          => 'Voir le lead',
            'search_items'       => 'Rechercher un lead',
            'not_found'          => 'Aucun lead pour le moment.',
        ],
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_icon'           => 'dashicons-email-alt',
        'menu_position'       => 26,
        'has_archive'         => false,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'show_in_rest'        => false,
        'show_in_graphql'     => false,
        'supports'            => ['title'],
        'capability_type'     => 'post',
    ]);
});

/** Libellés lisibles pour le type de demande (réutilisés liste + colonne + REST). */
function ndc_lead_type_label($type) {
    $labels = [
        'contact'  => 'Formulaire de contact',
        'question' => 'Question (pop-in)',
        'brochure' => 'Téléchargement brochure',
        'download' => 'Téléchargement document',
    ];
    return $labels[$type] ?? $type;
}

/* Colonnes personnalisées dans la liste des Leads (admin) */
add_filter('manage_lead_posts_columns', function ($cols) {
    return [
        'cb'              => $cols['cb'] ?? '<input type="checkbox" />',
        'title'           => 'Lead',
        'lead_type'       => 'Reçu via',
        'lead_email'      => 'E-mail',
        'lead_entreprise' => 'Entreprise',
        'date'            => 'Reçu le',
    ];
});
add_action('manage_lead_posts_custom_column', function ($col, $post_id) {
    if ($col === 'lead_type')       echo esc_html(ndc_lead_type_label(get_post_meta($post_id, 'type', true)));
    if ($col === 'lead_email')      echo esc_html(get_post_meta($post_id, 'email', true));
    if ($col === 'lead_entreprise') echo esc_html(get_post_meta($post_id, 'entreprise', true) ?: '—');
}, 10, 2);

/* =========================================================================
 * Export Excel/CSV des Leads — bouton au-dessus de la liste « Leads du site »
 * ====================================================================== */

/** Ajoute le bouton « Exporter en Excel (CSV) » au-dessus de la liste des leads. */
add_action('restrict_manage_posts', function ($post_type) {
    if ($post_type !== 'lead') return;
    $url = wp_nonce_url(admin_url('admin-post.php?action=ndc_export_leads'), 'ndc_export_leads');
    echo '<a href="' . esc_url($url) . '" class="button" style="margin-left:6px">⬇ Exporter en Excel (CSV)</a>';
});

/** Génère et envoie le fichier CSV (compatible Excel) avec tous les leads. */
add_action('admin_post_ndc_export_leads', function () {
    if (!current_user_can('edit_posts') || !check_admin_referer('ndc_export_leads')) {
        wp_die('Action non autorisée.');
    }

    $posts = get_posts([
        'post_type'      => 'lead',
        'post_status'    => 'publish',
        'numberposts'    => -1,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    nocache_headers();
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="leads-ndc-' . date('Y-m-d') . '.csv"');

    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // BOM : accents corrects à l'ouverture dans Excel

    $headers = ['Date', 'Reçu via', 'Prénom', 'Nom', 'E-mail', 'Téléphone', 'Entreprise', 'Objet', 'Ressource', 'Page d\'origine', 'Message'];
    fputcsv($out, $headers, ';');

    foreach ($posts as $p) {
        fputcsv($out, [
            get_the_date('d/m/Y H:i', $p),
            ndc_lead_type_label(get_post_meta($p->ID, 'type', true)),
            get_post_meta($p->ID, 'prenom', true),
            get_post_meta($p->ID, 'nom', true),
            get_post_meta($p->ID, 'email', true),
            get_post_meta($p->ID, 'telephone', true),
            get_post_meta($p->ID, 'entreprise', true),
            get_post_meta($p->ID, 'objet', true),
            get_post_meta($p->ID, 'ressource', true),
            get_post_meta($p->ID, 'source_url', true),
            get_post_meta($p->ID, 'message', true),
        ], ';');
    }

    fclose($out);
    exit;
});

/* Affiche tous les champs du lead sous le titre, dans l'éditeur */
add_action('add_meta_boxes', function () {
    add_meta_box('ndc_lead_details', 'Détails du lead', function ($post) {
        $fields = ['type', 'email', 'prenom', 'nom', 'telephone', 'entreprise', 'objet', 'ressource', 'source_url', 'message'];
        $field_labels = [
            'type' => 'Reçu via', 'email' => 'E-mail', 'prenom' => 'Prénom', 'nom' => 'Nom',
            'telephone' => 'Téléphone', 'entreprise' => 'Entreprise', 'objet' => 'Objet',
            'ressource' => 'Ressource', 'source_url' => 'Page d\'origine', 'message' => 'Message',
        ];
        echo '<table class="widefat striped"><tbody>';
        foreach ($fields as $f) {
            $val = get_post_meta($post->ID, $f, true);
            if ($val === '') continue;
            $display = $f === 'type' ? ndc_lead_type_label($val) : $val;
            echo '<tr><th style="width:160px">' . esc_html($field_labels[$f] ?? $f) . '</th><td>' . nl2br(esc_html($display)) . '</td></tr>';
        }
        echo '</tbody></table>';
    }, 'lead', 'normal', 'high');
});


/* =========================================================================
 * Endpoint REST : POST /wp-json/ndc/v1/lead
 *   Reçoit le JSON depuis Next.js (/api/lead) et crée une Demande.
 *
 *   SÉCURITÉ — secret partagé :
 *   Définis la même valeur des deux côtés :
 *     - WordPress : la constante NDC_LEAD_SECRET ci-dessous,
 *     - Next.js   : la variable d'environnement LEAD_SHARED_SECRET (Vercel).
 *   Si le secret est défini, tout POST sans en-tête X-NDC-Lead-Token valide
 *   est rejeté (403) → les bots qui taperaient l'URL WP en direct sont bloqués.
 * ====================================================================== */
if (!defined('NDC_LEAD_SECRET')) {
    // ⚠️ Remplace par une longue chaîne aléatoire, IDENTIQUE à LEAD_SHARED_SECRET côté Vercel.
    define('NDC_LEAD_SECRET', 'cd2defe56420ca3dc04ac3471552fc3919cd3d3b23c900444aa11fff0f775b29');
}

add_action('rest_api_init', function () {
    register_rest_route('ndc/v1', '/lead', [
        'methods'             => 'POST',
        // Vérifie le secret partagé (si configuré) AVANT d'exécuter le callback.
        // Le secret est lu dans le CORPS JSON (champ « token »), pas dans un en-tête :
        // l'hébergeur (WAF) coupe la connexion sur les en-têtes custom de type token.
        'permission_callback' => function (WP_REST_Request $req) {
            $secret = NDC_LEAD_SECRET;
            if ($secret === '') {
                return true; // pas encore configuré : on laisse passer (à activer en prod)
            }
            $params = $req->get_json_params();
            $sent = is_array($params) ? ($params['token'] ?? '') : '';
            if (is_string($sent) && hash_equals($secret, $sent)) {
                return true;
            }
            return new WP_Error('ndc_forbidden', 'Jeton manquant ou invalide.', ['status' => 403]);
        },
        'callback'            => function (WP_REST_Request $req) {
            /* Rate limiting basique par IP (10 demandes / 10 min) via transient. */
            $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $key = 'ndc_lead_rl_' . md5($ip);
            $count = (int) get_transient($key);
            if ($count >= 10) {
                return new WP_REST_Response(['ok' => false, 'error' => 'rate_limited'], 429);
            }
            set_transient($key, $count + 1, 10 * MINUTE_IN_SECONDS);

            $p = $req->get_json_params();
            if (!is_array($p)) {
                return new WP_REST_Response(['ok' => false, 'error' => 'invalid_body'], 400);
            }

            /* Honeypot : champ caché « hp » qui doit rester vide. */
            if (!empty($p['hp'])) {
                return new WP_REST_Response(['ok' => true], 200); // on simule un succès
            }

            $allowed_types = ['contact', 'question', 'brochure', 'download'];
            $type  = sanitize_text_field($p['type'] ?? '');
            $email = sanitize_email($p['email'] ?? '');

            if (!in_array($type, $allowed_types, true)) {
                return new WP_REST_Response(['ok' => false, 'error' => 'invalid_type'], 400);
            }
            if (!is_email($email)) {
                return new WP_REST_Response(['ok' => false, 'error' => 'invalid_email'], 400);
            }

            $prenom     = sanitize_text_field($p['prenom'] ?? '');
            $nom        = sanitize_text_field($p['nom'] ?? '');
            $telephone  = sanitize_text_field($p['telephone'] ?? '');
            $entreprise = sanitize_text_field($p['entreprise'] ?? '');
            $objet      = sanitize_text_field($p['objet'] ?? '');
            $ressource  = sanitize_text_field($p['ressource'] ?? '');
            $source_url = esc_url_raw($p['source_url'] ?? '');
            $message    = sanitize_textarea_field($p['message'] ?? '');

            $labels = [
                'contact'  => 'Contact',
                'question' => 'Question',
                'brochure' => 'Brochure',
                'download' => 'Téléchargement',
            ];
            $who = trim($prenom . ' ' . $nom);
            if ($who === '') $who = $email;
            $title = sprintf('[%s] %s', $labels[$type], $who);
            // Téléchargements : la nature du document apparaît dans le titre du lead.
            if ($ressource !== '' && in_array($type, ['brochure', 'download'], true)) {
                $title .= ' — ' . $ressource;
            }

            $post_id = wp_insert_post([
                'post_type'   => 'lead',
                'post_status' => 'publish',
                'post_title'  => $title,
            ], true);

            if (is_wp_error($post_id)) {
                return new WP_REST_Response(['ok' => false, 'error' => 'insert_failed'], 500);
            }

            foreach (compact('type', 'email', 'prenom', 'nom', 'telephone', 'entreprise', 'objet', 'ressource', 'source_url', 'message') as $k => $v) {
                if ($v !== '') update_post_meta($post_id, $k, $v);
            }

            return new WP_REST_Response(['ok' => true, 'id' => $post_id], 201);
        },
    ]);
});

/* =========================================================================
 * Champs ACF — Page ACCUEIL (contenu éditorial complet de la home)
 *   Groupe « homeFields » ciblé sur la page « accueil » + ses traductions.
 *   query : pages(where:{name:"accueil"}) { nodes { homeFields { ... } } }
 *   Remplace l'ancien import SCF du même groupe (à supprimer côté SCF).
 * ====================================================================== */
add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key'                => 'group_ndc_home_fields',
        'title'              => 'Accueil — Contenu éditorial (NDC)',
        'show_in_graphql'    => 1,
        'graphql_field_name' => 'homeFields',
        'location'           => ndc_acf_page_location('accueil'),
        'menu_order'         => 0,
        'position'           => 'normal',
        'style'              => 'default',
        'label_placement'    => 'top',
        'instruction_placement' => 'label',
        'active'             => true,
        'description'        => 'Contenu éditorial complet de la page d\'accueil (slug « accueil »). Tous les champs sont optionnels : un champ vide retombe sur le texte par défaut (FR/EN).',
        'fields' => [
                    [
                        'key' => 'field_ndc_home_tab_hero',
                        'label' => 'Hero',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_eyebrow',
                        'label' => 'Hero — Sur-titre (eyebrow)',
                        'name' => 'heroEyebrow',
                        'type' => 'text',
                        'instructions' => 'Petit texte au-dessus du titre principal (ex. « Souverain · Responsable · De proximité »).',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_title',
                        'label' => 'Hero — Titre',
                        'name' => 'heroTitle',
                        'type' => 'text',
                        'instructions' => 'Titre principal du hero. Laisser vide pour garder le titre par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_lead',
                        'label' => 'Hero — Texte d\'accroche',
                        'name' => 'heroLead',
                        'type' => 'textarea',
                        'rows' => 3,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroLead',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_cta_primary_label',
                        'label' => 'Hero — CTA principal (libellé)',
                        'name' => 'heroCtaPrimaryLabel',
                        'type' => 'text',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroCtaPrimaryLabel',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_cta_primary_url',
                        'label' => 'Hero — CTA principal (lien)',
                        'name' => 'heroCtaPrimaryUrl',
                        'type' => 'url',
                        'instructions' => 'Laisser vide pour pointer vers /datacenters.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroCtaPrimaryUrl',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_cta_secondary_label',
                        'label' => 'Hero — CTA secondaire (libellé)',
                        'name' => 'heroCtaSecondaryLabel',
                        'type' => 'text',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroCtaSecondaryLabel',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_cta_secondary_url',
                        'label' => 'Hero — CTA secondaire (lien)',
                        'name' => 'heroCtaSecondaryUrl',
                        'type' => 'url',
                        'instructions' => 'Laisser vide pour pointer vers /contact.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroCtaSecondaryUrl',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_image',
                        'label' => 'Hero — Image',
                        'name' => 'heroImage',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroImage',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_images',
                        'label' => 'Hero — Images supplémentaires (diaporama)',
                        'name' => 'heroImages',
                        'type' => 'repeater',
                        'layout' => 'block',
                        'button_label' => 'Ajouter une image au diaporama',
                        'instructions' => 'Ces images s\'AJOUTENT à l\'image ci-dessus et défilent en fondu enchaîné. Laisser vide = image unique, comme avant. Renseigner le texte alternatif de chaque média dans la bibliothèque : c\'est lui qui est lu par les lecteurs d\'écran et indexé par les moteurs.',
                        'required' => 0,
                        'min' => 0,
                        'max' => 8,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroImages',
                        'sub_fields' => [
                            [
                                'key' => 'field_ndc_home_hero_img_item',
                                'label' => 'Image',
                                'name' => 'image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'library' => 'all',
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'image',
                            ],
                        ],
                    ],
                    [
                        'key' => 'field_ndc_home_hero_slide_interval',
                        'label' => 'Hero — Durée d\'affichage d\'une image (secondes)',
                        'name' => 'heroSlideInterval',
                        'type' => 'number',
                        'instructions' => 'Temps avant de passer à l\'image suivante. Entre 3 et 20 secondes. Vide = 6 secondes.',
                        'default_value' => '',
                        'min' => 3,
                        'max' => 20,
                        'step' => 1,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroSlideInterval',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_caption_title',
                        'label' => 'Hero — Légende (titre)',
                        'name' => 'heroCaptionTitle',
                        'type' => 'text',
                        'instructions' => 'Ex. « Rennes — site livré ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroCaptionTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_hero_caption_sub',
                        'label' => 'Hero — Légende (sous-texte)',
                        'name' => 'heroCaptionSub',
                        'type' => 'text',
                        'instructions' => 'Sous-texte affiché sous le titre de la légende hero (ex. « 3 MW · PUE 1,2 »). Laisser vide pour garder la valeur par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'heroCaptionSub',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_banniere',
                        'label' => 'Bannière actualité',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_banner_active',
                        'label' => 'Afficher la bannière',
                        'name' => 'bannerActive',
                        'type' => 'true_false',
                        'instructions' => 'Bandeau affiché juste sous le hero de l\'accueil, pour une actualité chaude : annonce, événement, ouverture de site. Décocher le retire immédiatement du site — le contenu ci-dessous est conservé et peut être préparé à l\'avance.',
                        'ui' => 1,
                        'ui_on_text' => 'Visible',
                        'ui_off_text' => 'Masquée',
                        'default_value' => 0,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerActive',
                    ],
                    [
                        'key' => 'field_ndc_home_banner_title',
                        'label' => 'Bannière — Titre',
                        'name' => 'bannerTitle',
                        'type' => 'text',
                        'instructions' => 'L\'annonce en une phrase courte, la plus concrète possible. Ex. « Le data center de Rennes ouvre ses portes le 14 octobre ». OBLIGATOIRE : sans titre, la bannière reste masquée même si l\'interrupteur est sur « Visible ».',
                        'required' => 0,
                        'maxlength' => 120,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerTitle',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_banner_label',
                        'label' => 'Bannière — Pastille',
                        'name' => 'bannerLabel',
                        'type' => 'text',
                        'instructions' => 'Petite étiquette rouge en tête de bandeau. Ex. « À la une », « Nouveau », « Événement », « Communiqué ». Vide = « À la une ».',
                        'required' => 0,
                        'maxlength' => 24,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerLabel',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_banner_text',
                        'label' => 'Bannière — Texte (optionnel)',
                        'name' => 'bannerText',
                        'type' => 'textarea',
                        'rows' => 2,
                        'instructions' => 'Une ligne de contexte sous le titre. Tronquée à une ligne sur grand écran, deux sur mobile : aller à l\'essentiel.',
                        'required' => 0,
                        'maxlength' => 160,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerText',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_banner_cta_url',
                        'label' => 'Bannière — Lien',
                        'name' => 'bannerCtaUrl',
                        'type' => 'text',
                        'instructions' => 'Où mène la bannière. Un chemin interne (ex. « /actualites/ouverture-rennes ») ou une adresse complète. Vide = bannière non cliquable, sans bouton.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerCtaUrl',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_banner_cta_label',
                        'label' => 'Bannière — Libellé du bouton',
                        'name' => 'bannerCtaLabel',
                        'type' => 'text',
                        'instructions' => 'Ex. « Lire l\'article », « S\'inscrire », « Voir le communiqué ». Vide = « Lire la suite ».',
                        'required' => 0,
                        'maxlength' => 32,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerCtaLabel',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_banner_image',
                        'label' => 'Bannière — Vignette (optionnelle)',
                        'name' => 'bannerImage',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'thumbnail',
                        'library' => 'all',
                        'instructions' => 'Petite image à droite du bandeau, 96 × 64 px à l\'écran. Masquée sur mobile. Purement décorative : ne pas y mettre de texte.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerImage',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_banner_tone',
                        'label' => 'Bannière — Tonalité',
                        'name' => 'bannerTone',
                        'type' => 'select',
                        'choices' => [
                            'marine' => 'Marine — annonce courante (par défaut)',
                            'rouge'  => 'Rouge — annonce urgente, à réserver aux vraies urgences',
                            'clair'  => 'Clair — annonce douce, sur fond blanc',
                        ],
                        'default_value' => 'marine',
                        'return_format' => 'value',
                        'multiple' => 0,
                        'ui' => 0,
                        'allow_null' => 0,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerTone',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_banner_until',
                        'label' => 'Bannière — Masquer après le',
                        'name' => 'bannerUntil',
                        'type' => 'date_picker',
                        'display_format' => 'd/m/Y',
                        'return_format' => 'Y-m-d',
                        'first_day' => 1,
                        'instructions' => 'La bannière disparaît d\'elle-même au lendemain de cette date : plus d\'annonce périmée oubliée en ligne. Vide = affichée jusqu\'à ce que vous la masquiez.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'bannerUntil',
                        'conditional_logic' => [[['field' => 'field_ndc_home_banner_active', 'operator' => '==', 'value' => '1']]],
                    ],
                    [
                        'key' => 'field_ndc_home_tab_kpi',
                        'label' => 'Bandeau KPI',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_kpi_title',
                        'label' => 'Bandeau KPI — Titre',
                        'name' => 'kpiTitle',
                        'type' => 'text',
                        'instructions' => 'Intitulé du bandeau (ex. « Le réseau en chiffres »). Laisser vide pour le texte par défaut.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'kpiTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_kpis',
                        'label' => 'Bandeau KPI — Chiffres clés',
                        'name' => 'kpis',
                        'type' => 'repeater',
                        'instructions' => 'Chiffres affichés dans le bandeau animé sous le hero. Laisser vide pour un calcul automatique à partir des data centers.',
                        'required' => 0,
                        'min' => 0,
                        'max' => 6,
                        'layout' => 'table',
                        'button_label' => 'Ajouter un chiffre clé',
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'kpis',
                        'sub_fields' => [
                            [
                                'key' => 'field_ndc_home_kpi_valeur',
                                'label' => 'Valeur',
                                'name' => 'valeur',
                                'type' => 'text',
                                'instructions' => 'Ex. « 1,2 », « 15 », « 99,9 ».',
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'valeur',
                            ],
                            [
                                'key' => 'field_ndc_home_kpi_unite',
                                'label' => 'Unité',
                                'name' => 'unite',
                                'type' => 'text',
                                'instructions' => 'Ex. « PUE », « Tier III », « % ».',
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'unite',
                            ],
                            [
                                'key' => 'field_ndc_home_kpi_label',
                                'label' => 'Libellé',
                                'name' => 'label',
                                'type' => 'text',
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'label',
                            ],
                        ],
                    ],
                    [
                        'key' => 'field_ndc_home_tab_dc',
                        'label' => 'Section Réseau NDC',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_dc_eyebrow',
                        'label' => 'Réseau NDC — Sur-titre',
                        'name' => 'dcEyebrow',
                        'type' => 'text',
                        'instructions' => 'Ex. « Le réseau NDC ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'dcEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_dc_title',
                        'label' => 'Réseau NDC — Titre',
                        'name' => 'dcTitle',
                        'type' => 'text',
                        'instructions' => 'Ex. « Nos data centers. ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'dcTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_dc_sub',
                        'label' => 'Réseau NDC — Sous-texte',
                        'name' => 'dcSub',
                        'type' => 'textarea',
                        'rows' => 2,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'dcSub',
                    ],
                    [
                        'key' => 'field_ndc_home_dc_seeall',
                        'label' => 'Réseau NDC — Lien « voir tout »',
                        'name' => 'dcSeeAll',
                        'type' => 'text',
                        'instructions' => 'Ex. « Voir tous les sites ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'dcSeeAll',
                    ],
                    [
                        'key' => 'field_ndc_home_grow_eyebrow',
                        'label' => 'Carte « Le réseau grandit » — Sur-titre',
                        'name' => 'growEyebrow',
                        'type' => 'text',
                        'instructions' => 'Carte marine à droite des data centers. Ex. « Le réseau grandit ». Vide = texte par défaut.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'growEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_grow_number',
                        'label' => 'Carte « Le réseau grandit » — Grand chiffre',
                        'name' => 'growNumber',
                        'type' => 'text',
                        'instructions' => 'Ex. « 15 ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'growNumber',
                    ],
                    [
                        'key' => 'field_ndc_home_grow_number_label',
                        'label' => 'Carte « Le réseau grandit » — Libellé du chiffre',
                        'name' => 'growNumberLabel',
                        'type' => 'text',
                        'instructions' => 'Ex. « sites visés ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'growNumberLabel',
                    ],
                    [
                        'key' => 'field_ndc_home_grow_text',
                        'label' => 'Carte « Le réseau grandit » — Texte',
                        'name' => 'growText',
                        'type' => 'textarea',
                        'rows' => 2,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'growText',
                    ],
                    [
                        'key' => 'field_ndc_home_grow_cta',
                        'label' => 'Carte « Le réseau grandit » — Libellé du lien',
                        'name' => 'growCta',
                        'type' => 'text',
                        'instructions' => 'Ex. « Découvrir le réseau ». Le lien mène à la page Nos data centers.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'growCta',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_services',
                        'label' => 'Section Services',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_services_eyebrow',
                        'label' => 'Services — Sur-titre',
                        'name' => 'servicesEyebrow',
                        'type' => 'text',
                        'instructions' => 'Ex. « Nos services ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'servicesEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_services_title1',
                        'label' => 'Services — Titre (ligne 1)',
                        'name' => 'servicesTitle1',
                        'type' => 'text',
                        'instructions' => 'Ex. « Une infrastructure adaptée ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'servicesTitle1',
                    ],
                    [
                        'key' => 'field_ndc_home_services_title2',
                        'label' => 'Services — Titre (ligne 2)',
                        'name' => 'servicesTitle2',
                        'type' => 'text',
                        'instructions' => 'Ex. « à vos exigences. ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'servicesTitle2',
                    ],
                    [
                        'key' => 'field_ndc_home_services_sub',
                        'label' => 'Services — Sous-texte',
                        'name' => 'servicesSub',
                        'type' => 'textarea',
                        'rows' => 2,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'servicesSub',
                    ],
                    [
                        'key' => 'field_ndc_home_services_cta',
                        'label' => 'Services — Bouton',
                        'name' => 'servicesCta',
                        'type' => 'text',
                        'instructions' => 'Ex. « Découvrir tous nos services ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'servicesCta',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_eng',
                        'label' => 'Section Engagements',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_eng_eyebrow',
                        'label' => 'Engagements — Sur-titre',
                        'name' => 'engEyebrow',
                        'type' => 'text',
                        'instructions' => 'Ex. « Nos engagements ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'engEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_eng_title',
                        'label' => 'Engagements — Titre',
                        'name' => 'engTitle',
                        'type' => 'text',
                        'instructions' => 'Ex. « Pourquoi choisir NDC. ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'engTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_eng_seeall',
                        'label' => 'Engagements — Lien « voir tout »',
                        'name' => 'engSeeAll',
                        'type' => 'text',
                        'instructions' => 'Ex. « Voir tous nos engagements ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'engSeeAll',
                    ],
                    [
                        'key' => 'field_ndc_home_engagements',
                        'label' => 'Engagements — Cartes',
                        'name' => 'engagements',
                        'type' => 'repeater',
                        'instructions' => 'Cartes d\'engagement. Laisser vide pour les 4 cartes par défaut (Décarbonation, Sobriété, Chaleur fatale, Ressource en eau).',
                        'required' => 0,
                        'min' => 0,
                        'max' => 8,
                        'layout' => 'row',
                        'button_label' => 'Ajouter une carte',
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'engagements',
                        'sub_fields' => [
                            [
                                'key' => 'field_ndc_home_eng_icon',
                                'label' => 'Icône',
                                'name' => 'icon',
                                'type' => 'select',
                                'instructions' => 'Icône affichée dans la carte.',
                                'required' => 0,
                                'choices' => [
                                    'decarbon' => 'Décarbonation (nuage)',
                                    'sobriete' => 'Sobriété (cible)',
                                    'chaleur' => 'Chaleur (flamme)',
                                    'eau' => 'Eau (goutte)',
                                    'shield' => 'Bouclier',
                                    'network' => 'Réseau',
                                    'services' => 'Services',
                                    'building' => 'Bâtiment',
                                ],
                                'default_value' => 'decarbon',
                                'return_format' => 'value',
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'icon',
                            ],
                            [
                                'key' => 'field_ndc_home_eng_titre',
                                'label' => 'Titre',
                                'name' => 'titre',
                                'type' => 'text',
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'titre',
                            ],
                            [
                                'key' => 'field_ndc_home_eng_desc',
                                'label' => 'Description',
                                'name' => 'desc',
                                'type' => 'textarea',
                                'rows' => 2,
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'desc',
                            ],
                        ],
                    ],
                    [
                        'key' => 'field_ndc_home_eng_image',
                        'label' => 'Pourquoi choisir NDC — Image d illustration',
                        'name' => 'engImage',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Image affichee a cote des cartes de la section Pourquoi choisir NDC (accueil). Vide = cartes en pleine largeur.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'engImage',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_amv',
                        'label' => 'Raison d\'être',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_eyebrow',
                        'label' => 'Raison d\'être — Sur-titre',
                        'name' => 'amvEyebrow',
                        'type' => 'text',
                        'instructions' => 'Ex. « Notre raison d\'être ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_title1',
                        'label' => 'Raison d\'être — Titre (début)',
                        'name' => 'amvTitle1',
                        'type' => 'text',
                        'instructions' => 'Ex. « Un réseau ». Suivi du mot accentué puis de la fin du titre.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvTitle1',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_title_accent',
                        'label' => 'Raison d\'être — Titre (mot accentué)',
                        'name' => 'amvTitleAccent',
                        'type' => 'text',
                        'instructions' => 'Partie du titre mise en couleur (ex. « sécurisé et durable »).',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvTitleAccent',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_title2',
                        'label' => 'Raison d\'être — Titre (fin)',
                        'name' => 'amvTitle2',
                        'type' => 'text',
                        'instructions' => 'Ex. « sur tout le territoire. ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvTitle2',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_intro1',
                        'label' => 'Raison d\'être — Intro (début)',
                        'name' => 'amvIntro1',
                        'type' => 'text',
                        'instructions' => 'Texte avant la partie en gras (ex. « Après Rouen, Rennes 1 et Paris 1, NDC développe »).',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvIntro1',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_intro_strong',
                        'label' => 'Raison d\'être — Intro (partie en gras)',
                        'name' => 'amvIntroStrong',
                        'type' => 'text',
                        'instructions' => 'Ex. « 15 sites à horizon 2030 ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvIntroStrong',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_intro2',
                        'label' => 'Raison d\'être — Intro (fin)',
                        'name' => 'amvIntro2',
                        'type' => 'text',
                        'instructions' => 'Ex. « — souverains, écoresponsables, opérés par nos équipes. ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvIntro2',
                    ],
                    [
                        'key' => 'field_ndc_home_amv_figures',
                        'label' => 'Raison d\'être — Chiffres',
                        'name' => 'amvFigures',
                        'type' => 'repeater',
                        'instructions' => 'Les 3 chiffres affichés sous l\'intro. Laisser vide pour les valeurs par défaut (15 sites en 2030 · 3 en service · 16 % empreinte numérique FR).',
                        'required' => 0,
                        'min' => 0,
                        'max' => 4,
                        'layout' => 'table',
                        'button_label' => 'Ajouter un chiffre',
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'amvFigures',
                        'sub_fields' => [
                            [
                                'key' => 'field_ndc_home_amv_fig_valeur',
                                'label' => 'Valeur',
                                'name' => 'valeur',
                                'type' => 'text',
                                'instructions' => 'Ex. « 15 », « 3 », « 16 % ».',
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'valeur',
                            ],
                            [
                                'key' => 'field_ndc_home_amv_fig_label',
                                'label' => 'Libellé',
                                'name' => 'label',
                                'type' => 'text',
                                'required' => 0,
                                'show_in_graphql' => 1,
                                'graphql_field_name' => 'label',
                            ],
                        ],
                    ],
                    [
                        'key' => 'field_ndc_home_ambition_title',
                        'label' => 'Ambition — Titre',
                        'name' => 'ambitionTitle',
                        'type' => 'text',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'ambitionTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_ambition_text',
                        'label' => 'Ambition — Texte',
                        'name' => 'ambitionText',
                        'type' => 'textarea',
                        'rows' => 3,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'ambitionText',
                    ],
                    [
                        'key' => 'field_ndc_home_mission_title',
                        'label' => 'Mission — Titre',
                        'name' => 'missionTitle',
                        'type' => 'text',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'missionTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_mission_text',
                        'label' => 'Mission — Texte',
                        'name' => 'missionText',
                        'type' => 'textarea',
                        'rows' => 3,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'missionText',
                    ],
                    [
                        'key' => 'field_ndc_home_vision_title',
                        'label' => 'Vision — Titre',
                        'name' => 'visionTitle',
                        'type' => 'text',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'visionTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_vision_text',
                        'label' => 'Vision — Texte',
                        'name' => 'visionText',
                        'type' => 'textarea',
                        'rows' => 3,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'visionText',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_faq',
                        'label' => 'FAQ',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_faq_eyebrow',
                        'label' => 'FAQ — Sur-titre',
                        'name' => 'faqEyebrow',
                        'type' => 'text',
                        'instructions' => 'Ex. « Questions fréquentes ». Les questions/réponses restent gérées via le CPT « FAQ ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'faqEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_faq_title',
                        'label' => 'FAQ — Titre',
                        'name' => 'faqTitle',
                        'type' => 'text',
                        'instructions' => 'Ex. « Tout savoir sur l\'hébergement chez NDC ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'faqTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_faq_image',
                        'label' => 'FAQ — Image d illustration',
                        'name' => 'faqImage',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Image affichee a cote de la FAQ (accueil). Vide = FAQ centree pleine largeur.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'faqImage',
                    ],
                    [
                        'key' => 'field_ndc_home_faq_image2',
                        'label' => 'FAQ — Image d illustration n°2',
                        'name' => 'faqImage2',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Second visuel affiche sous le premier, a cote de la FAQ.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'faqImage2',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_news',
                        'label' => 'Actualités',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_news_eyebrow',
                        'label' => 'Actualités — Sur-titre',
                        'name' => 'newsEyebrow',
                        'type' => 'text',
                        'instructions' => 'Ex. « Actualités ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'newsEyebrow',
                    ],
                    [
                        'key' => 'field_ndc_home_news_title',
                        'label' => 'Actualités — Titre',
                        'name' => 'newsTitle',
                        'type' => 'text',
                        'instructions' => 'Ex. « Ce qui se passe chez NDC. ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'newsTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_news_seeall',
                        'label' => 'Actualités — Lien « voir tout »',
                        'name' => 'newsSeeAll',
                        'type' => 'text',
                        'instructions' => 'Ex. « Toutes les actualités ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'newsSeeAll',
                    ],
                    [
                        'key' => 'field_ndc_home_news_promo_titre',
                        'label' => 'Actualités — Carte marine : titre',
                        'name' => 'news_promo_titre',
                        'type' => 'text',
                        'instructions' => 'Carte bleu marine à côté des articles. Ex. « Ne manquez aucune actualité ». Vide = texte par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'newsPromoTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_news_promo_texte',
                        'label' => 'Actualités — Carte marine : texte',
                        'name' => 'news_promo_texte',
                        'type' => 'textarea',
                        'rows' => 3,
                        'new_lines' => '',
                        'instructions' => 'Ex. « Nouveaux sites, innovations, RSE et événements — suivez le réseau. ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'newsPromoText',
                    ],
                    [
                        'key' => 'field_ndc_home_news_promo_cta',
                        'label' => 'Actualités — Carte marine : bouton',
                        'name' => 'news_promo_cta',
                        'type' => 'text',
                        'instructions' => 'Libellé du bouton vers la page Actualités. Ex. « Tout voir ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'newsPromoCta',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_linkedin',
                        'label' => 'LinkedIn (accueil)',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_li_titre',
                        'label' => 'LinkedIn — Titre du bloc',
                        'name' => 'li_titre',
                        'type' => 'text',
                        'instructions' => 'Ex. « Sur LinkedIn ». Vide = texte par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'linkedinTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_li_url',
                        'label' => 'LinkedIn — URL de la page entreprise',
                        'name' => 'li_url',
                        'type' => 'url',
                        'instructions' => 'Bouton « Suivre Nation Data Center ». Vide = bouton masqué.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'linkedinUrl',
                    ],
                    [
                        'key' => 'field_ndc_home_li_posts',
                        'label' => 'LinkedIn — Posts mis en avant',
                        'name' => 'li_posts',
                        'type' => 'repeater',
                        'layout' => 'row',
                        'button_label' => 'Ajouter un post',
                        'instructions' => 'Une ligne = un post LinkedIn affiché dans la section Actualités de l\'accueil (3 maximum affichés). Le bloc est masqué si la liste est vide.',
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'linkedinPosts',
                        'sub_fields' => [
                            ['key' => 'field_ndc_home_li_p_texte', 'label' => 'Texte du post (extrait)', 'name' => 'texte', 'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'graphql_field_name' => 'texte'],
                            ['key' => 'field_ndc_home_li_p_url', 'label' => 'URL du post LinkedIn', 'name' => 'url', 'type' => 'url', 'show_in_graphql' => 1, 'graphql_field_name' => 'url'],
                            ['key' => 'field_ndc_home_li_p_image', 'label' => 'Image (optionnelle)', 'name' => 'image', 'type' => 'image', 'return_format' => 'array', 'preview_size' => 'medium', 'show_in_graphql' => 1, 'graphql_field_name' => 'image'],
                            ['key' => 'field_ndc_home_li_p_date', 'label' => 'Date affichée', 'name' => 'date', 'type' => 'text', 'instructions' => 'Texte libre, ex. « 12 juin 2026 » ou « Il y a 2 semaines ».', 'show_in_graphql' => 1, 'graphql_field_name' => 'date'],
                        ],
                    ],
                    [
                        'key' => 'field_ndc_home_tab_certbanner',
                        'label' => 'Bandeau certifications / Altarea',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_certbanner_cert_title',
                        'label' => 'Carte certifications — Titre',
                        'name' => 'certBannerCertTitle',
                        'type' => 'text',
                        'instructions' => 'Ex. « Découvrir nos certifications ». Laisser vide pour le texte par défaut.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'certBannerCertTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_certbanner_cert_sub',
                        'label' => 'Carte certifications — Sous-texte',
                        'name' => 'certBannerCertSub',
                        'type' => 'textarea',
                        'rows' => 2,
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'certBannerCertSub',
                    ],
                    [
                        'key' => 'field_ndc_home_certbanner_cert_url',
                        'label' => 'Carte certifications — Lien',
                        'name' => 'certBannerCertUrl',
                        'type' => 'url',
                        'instructions' => 'Laisser vide pour pointer vers /certifications.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'certBannerCertUrl',
                    ],
                    [
                        'key' => 'field_ndc_home_certbanner_altarea_title',
                        'label' => 'Carte Altarea — Titre',
                        'name' => 'certBannerAltareaTitle',
                        'type' => 'text',
                        'instructions' => 'Ex. « Découvrir le groupe Altarea ». Laisser vide pour le texte par défaut.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'certBannerAltareaTitle',
                    ],
                    [
                        'key' => 'field_ndc_home_certbanner_altarea_sub',
                        'label' => 'Carte Altarea — Sous-texte',
                        'name' => 'certBannerAltareaSub',
                        'type' => 'textarea',
                        'rows' => 2,
                        'instructions' => 'Ex. « (une marque du Groupe Altarea) ».',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'certBannerAltareaSub',
                    ],
                    [
                        'key' => 'field_ndc_home_certbanner_altarea_url',
                        'label' => 'Carte Altarea — Lien',
                        'name' => 'certBannerAltareaUrl',
                        'type' => 'url',
                        'instructions' => 'Laisser vide pour pointer vers /groupe.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'certBannerAltareaUrl',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_brochure',
                        'label' => 'Brochure',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_brochure',
                        'label' => 'Brochure — Document (PDF)',
                        'name' => 'brochure',
                        'type' => 'file',
                        'return_format' => 'array',
                        'library' => 'all',
                        'mime_types' => 'pdf',
                        'instructions' => 'Document téléchargé par la modale « Télécharger la brochure » de la page d\'accueil. Vide = brochure par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'brochure',
                    ],
                    [
                        'key' => 'field_ndc_home_tab_identite',
                        'label' => 'Identité / Logo',
                        'name' => '',
                        'type' => 'tab',
                        'placement' => 'top',
                    ],
                    [
                        'key' => 'field_ndc_home_site_logo',
                        'label' => 'Logo du site (header)',
                        'name' => 'siteLogo',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Logo affiche dans l en-tete (et le bas de page si aucune version claire). Vide = marque N|D|C par defaut. PNG/SVG, fond transparent conseille.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'siteLogo',
                    ],
                    [
                        'key' => 'field_ndc_home_site_logo_white',
                        'label' => 'Logo du site — version claire (footer)',
                        'name' => 'siteLogoWhite',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Version claire du logo pour le footer (fond sombre). Vide = le logo header est blanchi automatiquement s il est monochrome.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'siteLogoWhite',
                    ],
                    [
                        'key' => 'field_ndc_home_header_equipe_img',
                        'label' => 'Menu « Nos services » — Image de la carte Notre équipe',
                        'name' => 'header_equipe_image',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Photo de la carte « Découvrir notre équipe » du menu déroulant Nos services. Vide = image par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'headerEquipeImage',
                    ],
                    [
                        'key' => 'field_ndc_home_header_offres_img',
                        'label' => 'Menu « Nos offres » — Image de la carte Engagements',
                        'name' => 'header_offres_image',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Photo de la carte « Découvrir nos engagements » du menu déroulant Nos offres. Vide = image par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'headerOffresImage',
                    ],
                    [
                        'key' => 'field_ndc_home_header_reseau_img',
                        'label' => 'Menu « Notre réseau » — Image de la carte Visite',
                        'name' => 'header_reseau_image',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'instructions' => 'Photo de la carte « Demander une visite » du menu déroulant Notre réseau. Vide = image par défaut du site.',
                        'required' => 0,
                        'show_in_graphql' => 1,
                        'graphql_field_name' => 'headerReseauImage',
                    ],
                ],
    ]);
});

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
