// Données des offres par profil (personas). Contenu fidèle à la maquette NDC,
// structuré pour un rendu React intégré à la charte du site.

export type Persona = {
  id: string; // identifiant technique (slug WP : dsi, pme, pub, tel…)
  label: string; // libellé du bouton switcher
  accent: string; // couleur d'accent du profil
  accentSoft: string; // version douce (fonds)
  tag: string; // sur-titre cible
  h1: string;
  lead: string;
  ctaPrimary: string;
  proofs: string[]; // bandeau de réassurance
  enjeux: { icon: string; titre: string; texte: string }[];
  problemesTitre: string;
  problemes: { icon: string; titre: string; texte: string }[];
  reponsesTitre: string;
  reponses: { num: string; titre: string; texte: string }[];
  stats: { num: string; label: string }[]; // bandeau de chiffres propre au profil
  accentWord: string[]; // terme(s) du profil à colorer dans les titres
  faqTitre: string;
  faq: { q: string; a: string }[];
};

const STATS = [
  { num: '4+', label: 'Sites opérés en France' },
  { num: '14 MW', label: 'Haute densité NDC Rouen (liquide)' },
  { num: '15', label: 'Sites prévus d’ici 2030' },
  { num: '99,982 %', label: 'Disponibilité visée' },
];

export const PERSONA_STATS = STATS;

export const PERSONAS: Persona[] = [
  {
    id: 'dsi',
    label: 'DSI / IT',
    accent: '#1E7BF5',
    accentSoft: 'rgba(30,123,245,0.10)',
    tag: 'DSI · Responsable infrastructure · Responsable IT',
    h1: 'L’infrastructure IT souveraine que votre DSI mérite',
    lead: 'Maîtrisez votre infrastructure, garantissez vos SLA et simplifiez vos audits de conformité — sans dépendre d’un hyperscaler étranger. Nation Data Center, filiale Altarea, opère pour vous des datacenters français certifiés et carrier-neutral.',
    ctaPrimary: 'Demander une étude gratuite',
    proofs: ['Données 100 % en France', 'SLA contractuel 99,9 %', 'Certifications ISO 27001, HDS visées'],
    enjeux: [
      { icon: '🔒', titre: 'Souveraineté des données', texte: 'Vos données sensibles ne peuvent pas transiter hors de France ni dépendre du Cloud Act.' },
      { icon: '📋', titre: 'Conformité réglementaire', texte: 'ISO 27001, HDS, RGPD — vous devez justifier vos choix d’hébergement à votre RSSI et à la direction.' },
      { icon: '⚡', titre: 'Disponibilité critique', texte: 'Vous avez besoin d’un SLA > 99,9 % et d’une architecture redondante N+1.' },
      { icon: '💰', titre: 'Maîtrise des coûts IT', texte: 'Vos factures cloud sont imprévisibles. Vous cherchez une alternative à coût fixe pour les charges stables.' },
    ],
    problemesTitre: 'Les problèmes que nous résolvons pour les DSI',
    problemes: [
      { icon: '🌍', titre: 'Dépendance aux hyperscalers étrangers', texte: 'AWS, Azure, GCP sont soumis au Cloud Act américain. Vos données critiques peuvent être réclamées par une juridiction étrangère sans que vous en soyez informé.' },
      { icon: '📈', titre: 'Coûts cloud imprévisibles', texte: 'Le « bill shock » en fin de mois est devenu un sujet de direction. Pour les charges stables, le cloud public coûte structurellement plus cher que la colocation.' },
      { icon: '🏗️', titre: 'Salle serveur interne à gérer', texte: 'Climatisation, électricité redondante, sécurité physique — maintenir une salle serveur interne mobilise des ressources disproportionnées.' },
      { icon: '📏', titre: 'Audits de conformité chronophages', texte: 'ISO 27001, HDS, PCI-DSS — documenter votre chaîne d’hébergement prend du temps. Un prestataire certifié transfère une partie de cette charge.' },
      { icon: '🔧', titre: 'Interventions physiques urgentes', texte: 'Quand un serveur tombe à 2h du matin, vous avez besoin d’un accès immédiat ou d’une équipe capable d’intervenir à votre place.' },
      { icon: '🌐', titre: 'Connectivité multi-opérateur', texte: 'Votre connectivité ne peut pas dépendre d’un seul fournisseur. Vous devez pouvoir choisir et faire concurrencer vos opérateurs.' },
    ],
    reponsesTitre: 'Ce que Nation Data Center apporte à votre DSI',
    reponses: [
      { num: '01', titre: 'Souveraineté numérique totale', texte: 'Filiale du Groupe Altarea, entreprise française cotée à la Bourse de Paris. Aucune entité soumise au Cloud Act. Vos données restent sous juridiction française.' },
      { num: '02', titre: 'SLA haute disponibilité contractualisé', texte: 'Architecture N+1 sur l’alimentation et la climatisation. Monitoring 24/7. Engagement de disponibilité contractuel. PUE optimisé.' },
      { num: '03', titre: 'Certifications facilitant vos audits', texte: 'Nos installations visent ISO 27001, HDS, ISO 50001 et ISO 14001. Documentation disponible pour vos audits internes et votre RSSI.' },
      { num: '04', titre: 'Smart hands disponibles 24/7', texte: 'Accès à votre espace à toute heure. Nos techniciens interviennent sur vos équipements : reboot, câblage, remplacement, installation.' },
      { num: '05', titre: 'Connectivité carrier-neutral', texte: 'Meet-me-room ouverte à tous les opérateurs. Aucun lock-in. Vous choisissez et faites concurrencer vos fournisseurs de connectivité.' },
      { num: '06', titre: 'TCO inférieur au cloud public', texte: 'Pour vos charges stables, la colocation offre un coût total de possession prévisible et plus faible. Analyse TCO comparative sur demande.' },
    ],
    stats: [
      { num: '4+', label: 'Sites opérés en France' },
      { num: '14 MW', label: 'Haute densité NDC Rouen (liquide)' },
      { num: '15', label: 'Sites prévus d’ici 2030' },
      { num: '0 L', label: 'Eau de refroidissement utilisée' },
      { num: 'N+1', label: 'Redondance électrique et climatisation' },
    ],
    accentWord: ['DSI'],
    faqTitre: 'Ce que les DSI nous demandent avant de décider',
    faq: [
      { q: 'Qu’est-ce que la colocation datacenter pour une DSI ?', a: 'La colocation permet à votre DSI d’héberger vos propres serveurs dans nos locaux sécurisés. Vous conservez la maîtrise totale de vos équipements et de leur configuration — nous fournissons l’infrastructure mutualisée : énergie redondante N+1, climatisation, connectivité multi-opérateur, sécurité physique et monitoring 24/7.' },
      { q: 'Comment garantissez-vous la souveraineté de nos données ?', a: 'Nation Data Center est une filiale du Groupe Altarea, entreprise française cotée à la Bourse de Paris. Tous nos sites sont en France. Aucune entité de notre groupe n’est soumise au Cloud Act américain ou au FISA. Vos données restent sous juridiction française et européenne — ce que nous pouvons formaliser contractuellement.' },
      { q: 'La colocation est-elle vraiment moins coûteuse que le cloud public ?', a: 'Pour des charges de travail stables et prévisibles (bases de données, ERP, applications métier critiques), la colocation offre un TCO structurellement inférieur au cloud public sur 3-5 ans. La différence tient à l’absence de markup sur la puissance de calcul et à la prévisibilité totale des coûts. Nous réalisons une analyse TCO comparative gratuite sur demande.' },
      { q: 'Puis-je accéder à mes équipements physiquement et à n’importe quelle heure ?', a: 'Oui. Vos équipes habilitées disposent d’un accès sécurisé 24h/24, 7j/7 via contrôle biométrique. En complément, nos smart hands peuvent effectuer des interventions physiques à votre demande : reboot, câblage, vérification de LED, installation de composants, etc. — sans que vous ayez à vous déplacer.' },
      { q: 'Quelles certifications proposez-vous et comment nous aident-elles dans nos audits ?', a: 'Nos installations visent ISO 27001 (sécurité de l’information), HDS (données de santé), ISO 50001 (énergie) et ISO 14001 (environnement). En tant que client, vous pouvez utiliser nos certifications pour étayer vos propres dossiers de conformité, réduisant ainsi le périmètre à auditer côté hébergement. Notre documentation technique est disponible sous NDA sur demande.' },
    ],
  },
  {
    id: 'pme',
    label: 'PME / ETI',
    accent: '#00C48C',
    accentSoft: 'rgba(0,196,140,0.10)',
    tag: 'PME · ETI · 50 à 500 salariés',
    h1: 'Colocation sécurisée, prévisible, sans surprise budgétaire',
    lead: 'Vos factures cloud explosent et vous n’avez ni le temps ni les ressources pour gérer une salle serveur en interne. Nation Data Center vous offre une infrastructure clé en main, proche de chez vous, avec un interlocuteur dédié à taille humaine.',
    ctaPrimary: 'Comparer mon coût cloud',
    proofs: ['Coût fixe et prévisible', 'Données 100 % en France', 'Interlocuteur dédié'],
    enjeux: [
      { icon: '📊', titre: 'Budget IT imprévisible', texte: 'Chaque mois, la facture cloud change. Difficile de budgétiser et de présenter un prévisionnel à la direction.' },
      { icon: '🏠', titre: 'Salle serveur à gérer', texte: 'Vous avez un placard serveur qui chauffe, dont personne ne veut s’occuper et qui vous inquiète la nuit.' },
      { icon: '🤝', titre: 'Prestataire injoignable', texte: 'Chez les grands opérateurs, vous êtes un ticket dans une file. Vous avez besoin d’un vrai interlocuteur.' },
      { icon: '📍', titre: 'Proximité indispensable', texte: 'Vos équipes doivent pouvoir intervenir physiquement dans la journée si besoin.' },
    ],
    problemesTitre: 'L’IT des PME : des contraintes bien réelles',
    problemes: [
      { icon: '💸', titre: 'Factures cloud qui augmentent chaque année', texte: 'Les prix des hyperscalers augmentent régulièrement. Pour des charges stables, vous payez un premium de flexibilité dont vous n’avez pas besoin.' },
      { icon: '🔧', titre: 'Salle serveur interne ingérable', texte: 'Climatisation en panne, coupure électrique, intrusion — la gestion d’une salle serveur interne expose votre activité à des risques disproportionnés.' },
      { icon: '📜', titre: 'Exigences clients et assureurs', texte: 'Vos clients grands comptes ou votre assurance cyber exigent des garanties sur la localisation et la sécurité de vos données.' },
      { icon: '👤', titre: 'Manque d’interlocuteur dédié', texte: 'Chez les grands opérateurs, vous naviguez entre des portails et des tickets. Personne ne connaît votre contexte.' },
    ],
    reponsesTitre: 'L’offre NDC pensée pour les PME et ETI',
    reponses: [
      { num: '01', titre: 'Coût fixe et prévisible', texte: 'Un loyer mensuel fixe pour votre espace et votre puissance électrique. Fini le bill shock. Vous budgétisez, votre direction valide.' },
      { num: '02', titre: 'Infrastructure clé en main', texte: 'Énergie redondante, climatisation, vidéosurveillance, contrôle d’accès biométrique, connectivité multi-opérateur — tout est géré par NDC.' },
      { num: '03', titre: 'Données 100 % en France', texte: 'Vos données restent sur le territoire français. Conformité RGPD native, aucune dépendance au Cloud Act.' },
      { num: '04', titre: 'Proximité et flexibilité', texte: 'Sites à Rennes, Rouen et Paris. Votre équipe peut intervenir dans la journée. Offre évolutive de 1U à plusieurs baies.' },
      { num: '05', titre: 'Interlocuteur dédié, vraiment', texte: 'Un contact commercial et technique qui connaît votre dossier. Une équipe à taille humaine, joignable, réactive.' },
      { num: '06', titre: 'Bilan carbone IT amélioré', texte: 'Datacenters écoresponsables : zéro eau de refroidissement, énergies renouvelables, chaleur fatale valorisée. Un argument RSE documenté.' },
    ],
    stats: [
      { num: '1U', label: 'Offre dès 1 unité de rack' },
      { num: '4', label: 'Sites en France dès aujourd’hui' },
      { num: '24/7', label: 'Accès sécurisé à votre espace' },
      { num: '0 L', label: 'Eau de refroidissement' },
      { num: 'TCO↓', label: 'Inférieur au cloud public sur charges stables' },
    ],
    accentWord: ['PME et ETI', 'PME', 'ETI'],
    faqTitre: 'Ce que les PME nous demandent souvent',
    faq: [
      { q: 'La colocation est-elle adaptée à une PME qui a seulement 1 ou 2 serveurs ?', a: 'Oui. La colocation n’est pas réservée aux grands groupes. Nos offres démarrent à quelques unités de rack (1U ou 2U). C’est pertinent dès lors que vous avez au moins un serveur dédié dont vous souhaitez garantir la disponibilité, la sécurité et la localisation française.' },
      { q: 'Est-ce vraiment moins cher que de continuer sur le cloud public ?', a: 'Pour les charges de travail stables — bases de données, ERP, applications métier — la colocation est généralement moins coûteuse sur 3 à 5 ans. Vous payez pour un espace et une puissance électrique, pas pour la marge d’un hyperscaler. Nous réalisons une comparaison TCO gratuite sur demande pour vous donner une réponse chiffrée adaptée à votre cas.' },
      { q: 'Que se passe-t-il si j’ai besoin d’aide sur mes équipements et que je ne peux pas me déplacer ?', a: 'Notre service de smart hands vous permet de nous demander d’effectuer des interventions physiques simples à votre place : reboot d’un serveur, branchement d’un câble, vérification d’un voyant, insertion d’un support de boot. Vous nous appelez, nous intervenons — sans que vous ayez à faire le déplacement.' },
      { q: 'Mes données restent-elles bien en France ? Et comment le prouver à mes clients ?', a: 'Oui, l’ensemble de nos sites est situé en France. Nation Data Center est une filiale d’Altarea, groupe français. Aucune entité soumise à une législation extraterritoriale. Nous pouvons vous fournir une attestation de localisation de vos données et notre documentation de conformité pour vous aider à répondre aux exigences de vos clients ou de vos assureurs.' },
    ],
  },
  {
    id: 'pub',
    label: 'Secteur public',
    accent: '#7B5FF5',
    accentSoft: 'rgba(123,95,245,0.10)',
    tag: 'Collectivités · Établissements publics · Administrations',
    h1: 'Hébergement souverain pour le secteur public',
    lead: 'Les collectivités territoriales et organismes publics ont des obligations spécifiques sur la localisation et la sécurité de leurs données. Nation Data Center y répond avec un réseau de datacenters français, filiale d’un groupe coté, engagé sur la sobriété carbone.',
    ctaPrimary: 'Discuter de votre projet',
    proofs: ['Compatible doctrine Cloud au centre', 'Zéro Cloud Act', 'RSE documentée pour vos rapports'],
    enjeux: [
      { icon: '🏛️', titre: 'Doctrine Cloud au centre', texte: 'La DINUM recommande des hébergements qualifiés. Vous devez justifier vos choix devant vos instances de contrôle.' },
      { icon: '🔐', titre: 'Données sensibles hors Cloud Act', texte: 'Vos données à caractère personnel ou stratégique ne peuvent pas dépendre de législations extraterritoriales.' },
      { icon: '🌱', titre: 'Engagements RSE et bilan GES', texte: 'Votre collectivité a des objectifs de réduction carbone. Votre IT doit contribuer, pas alourdir le bilan.' },
      { icon: '📄', titre: 'Commande publique', texte: 'Vos marchés ont des contraintes contractuelles spécifiques. Vous avez besoin d’un prestataire habitué.' },
    ],
    problemesTitre: 'Les défis IT spécifiques du secteur public',
    problemes: [
      { icon: '⚖️', titre: 'Conformité à la doctrine Cloud au centre', texte: 'La DINUM recommande d’héberger les données sensibles sur des offres qualifiées ou des infrastructures souveraines françaises.' },
      { icon: '🌍', titre: 'Risque d’extraterritorialité', texte: 'Les solutions cloud américaines sont soumises au Cloud Act. Vos données peuvent être réclamées par une juridiction étrangère.' },
      { icon: '📊', titre: 'Obligation de reporting RSE', texte: 'Votre bilan GES et vos objectifs de neutralité carbone incluent le numérique, part croissante de l’empreinte des collectivités.' },
      { icon: '🔍', titre: 'Justification devant les instances', texte: 'Chambre régionale des comptes, CNIL, préfecture — vos choix peuvent être questionnés. Documentation solide nécessaire.' },
    ],
    reponsesTitre: 'Pourquoi les organismes publics choisissent NDC',
    reponses: [
      { num: '01', titre: 'Souveraineté numérique garantie', texte: 'Filiale du Groupe Altarea, cotée à la Bourse de Paris. Aucune entité soumise au Cloud Act ou au FISA. Hébergement strictement en France.' },
      { num: '02', titre: 'Compatible doctrine Cloud au centre', texte: 'Offre adaptée aux exigences de la DINUM. Notre équipe vous accompagne dans la documentation de votre choix d’hébergement.' },
      { num: '03', titre: 'RSE mesurable et documentée', texte: 'PUE optimisé, zéro eau de refroidissement, chaleur fatale réinjectée dans les réseaux urbains, énergies renouvelables.' },
      { num: '04', titre: 'Proximité territoriale', texte: 'Rennes, Rouen, Paris — des sites ancrés dans les territoires, au plus proche de vos équipes et de vos usagers.' },
      { num: '05', titre: 'Pérennité financière', texte: 'Adossé au Groupe Altarea, leader de la transformation bas carbone. Une garantie de continuité sur la durée de vos marchés.' },
      { num: '06', titre: 'Accompagnement contractuel sur mesure', texte: 'Notre équipe connaît les contraintes de la commande publique et vous accompagne dans la structuration d’un contrat adapté.' },
    ],
    stats: [
      { num: '0 L', label: 'Eau utilisée pour le refroidissement' },
      { num: '100 %', label: 'Hébergement en France' },
      { num: '4', label: 'Sites opérés en 2025–2027' },
      { num: '15', label: 'Sites d’ici 2030 sur les territoires' },
    ],
    accentWord: ['secteur public', 'organismes publics', 'public'],
    faqTitre: 'Ce que le secteur public nous demande',
    faq: [
      { q: 'Qu’est-ce que la doctrine Cloud au centre et comment NDC y répond-il ?', a: 'La doctrine Cloud au centre, portée par la DINUM, recommande aux organismes publics d’héberger leurs données sur des offres cloud qualifiées SecNumCloud ou des infrastructures souveraines françaises. Nation Data Center propose une infrastructure de colocation 100% française, portée par une entité française (Altarea), sans dépendance à des législations extraterritoriales. Notre équipe vous accompagne dans la formalisation de ce choix pour vos instances de contrôle.' },
      { q: 'Comment Nation Data Center contribue-t-il à notre bilan carbone ?', a: 'Nos datacenters valorisent la chaleur fatale produite par vos serveurs vers des réseaux de chaleur urbains (logements, équipements publics, piscines). Ils n’utilisent pas d’eau pour le refroidissement et s’approvisionnent en énergies renouvelables locales. Nous pouvons vous fournir les indicateurs PUE, WUE et la documentation nécessaire à votre reporting RSE ou à votre bilan GES.' },
      { q: 'Nation Data Center peut-il répondre à un marché public ?', a: 'Oui. Notre équipe commerciale est familière des contraintes de la commande publique et peut vous accompagner dans la structuration d’un accord adapté. Nous vous recommandons de nous contacter directement pour une étude personnalisée selon votre profil juridique (collectivité, EPCI, établissement public, GIP, etc.).' },
      { q: 'Qu’est-ce que le Cloud Act et pourquoi est-ce un risque pour les données publiques ?', a: 'Le Cloud Act américain (2018) autorise les autorités américaines à exiger des opérateurs cloud américains la communication de données stockées hors des États-Unis, sans passer par une voie judiciaire internationale. Pour les organismes publics, cela représente un risque juridique et de souveraineté. En choisissant Nation Data Center — filiale d’un groupe français sans entité soumise à ce texte — vous vous en affranchissez contractuellement.' },
    ],
  },
  {
    id: 'tel',
    label: 'Opérateurs',
    accent: '#F5820D',
    accentSoft: 'rgba(245,130,13,0.10)',
    tag: 'Opérateurs télécom · ISP · Fournisseurs cloud · Intégrateurs',
    h1: 'Colocation carrier-neutral : déployez vos PoP en France',
    lead: 'Nation Data Center offre aux opérateurs télécom et fournisseurs cloud une infrastructure de colocation neutre, haute densité et stratégiquement localisée — pour étendre votre présence sur les métropoles françaises avec un partenaire pérenne.',
    ctaPrimary: 'Contacter l’équipe technique',
    proofs: ['Carrier-neutral — zéro lock-in', '14 MW haute densité (liquide) NDC Rouen', '15 sites d’ici 2030'],
    enjeux: [
      { icon: '📡', titre: 'Extension de PoP', texte: 'Vous cherchez à déployer votre présence réseau sur Rennes, Rouen ou Paris sans construire votre propre site.' },
      { icon: '🔌', titre: 'Meet-me-room neutre', texte: 'Vous avez besoin d’un site pour vous interconnecter avec d’autres opérateurs ou acteurs cloud sans contrainte.' },
      { icon: '🔥', titre: 'Haute densité', texte: 'Vos équipements GPU ou HPC nécessitent un refroidissement liquide que la plupart des sites ne peuvent pas accueillir.' },
      { icon: '📈', titre: 'Déploiement national', texte: 'Vous cherchez un partenaire capable de vous suivre sur plusieurs sites en France, pas un prestataire mono-site.' },
    ],
    problemesTitre: 'Les enjeux d’infrastructure des opérateurs en France',
    problemes: [
      { icon: '🗺️', titre: 'Extension sur les métropoles régionales', texte: 'Paris est saturé. Rennes, Rouen, Lyon, Bordeaux deviennent stratégiques pour la latence et la couverture.' },
      { icon: '⚡', titre: 'Besoins haute densité non satisfaits', texte: 'Vos équipements GPU, accélérateurs IA ou HPC consomment 20-50 kW par baie. Peu de datacenters peuvent les accueillir.' },
      { icon: '🤝', titre: 'Interconnexion avec l’écosystème', texte: 'Vous avez besoin d’une meet-me-room neutre pour vous interconnecter sans dépendre d’un acteur dominant.' },
      { icon: '🔮', titre: 'Partenaire pour l’expansion nationale', texte: 'Vous ne voulez pas signer avec 10 prestataires. Vous cherchez un partenaire avec un pipeline national et une gestion unifiée.' },
    ],
    reponsesTitre: 'L’offre NDC pour les opérateurs et fournisseurs cloud',
    reponses: [
      { num: '01', titre: 'Carrier-neutral — aucun lock-in', texte: 'Meet-me-room ouverte à tous les opérateurs, FAI et fournisseurs cloud. Vous interconnectez librement, sans surcoût de transit imposé.' },
      { num: '02', titre: '14 MW haute densité — NDC Rouen', texte: 'Refroidissement liquide pour des densités jusqu’à 50+ kW par baie. Adapté GPU, HPC, IA et infrastructures intensives.' },
      { num: '03', titre: 'Localisation stratégique', texte: 'Rennes (hub Bretagne), Rouen (axe Paris-Normandie), Paris Île-de-France — des positions clés pour minimiser la latence.' },
      { num: '04', titre: 'Pipeline national 2030', texte: '15 datacenters prévus d’ici 2030 sur les métropoles françaises. Un interlocuteur unique pour votre déploiement national.' },
      { num: '05', titre: 'Puissance financière Altarea', texte: 'Adossé au Groupe Altarea, coté à Paris. Garantie de financement, de livraison des projets et de pérennité.' },
      { num: '06', titre: 'Architecture duale disponible', texte: 'NDC Rennes 1 et Rennes 2 sont conçus en architecture interopérable, pour une résilience maximale de vos équipements.' },
    ],
    stats: [
      { num: '14 MW', label: 'Puissance IT haute densité NDC Rouen' },
      { num: '7 MW', label: 'Puissance IT NDC Paris 1 (hybride air/liquide)' },
      { num: '15', label: 'Sites prévus d’ici 2030 en France' },
      { num: 'N+1', label: 'Redondance électrique et climatisation' },
      { num: '100 km', label: 'NDC Rouen — distance de Paris' },
    ],
    accentWord: ['opérateurs et fournisseurs cloud', 'opérateurs'],
    faqTitre: 'Ce que les opérateurs nous demandent',
    faq: [
      { q: 'Qu’est-ce qu’un datacenter carrier-neutral et pourquoi est-ce important pour un opérateur ?', a: 'Un datacenter carrier-neutral n’est affilié à aucun opérateur télécom. Sa meet-me-room est ouverte à tous les fournisseurs de connectivité. Pour un opérateur, cela signifie une liberté totale de choix de ses liens d’interconnexion, la possibilité de faire concurrencer ses fournisseurs et une absence de conflit d’intérêt avec le gestionnaire du site.' },
      { q: 'Quelle est la densité maximale par baie sur NDC Rouen ?', a: 'NDC Rouen est conçu pour la très haute densité avec un refroidissement liquide, pour une puissance IT dédiée de 14MW. Pour les densités précises par baie disponibles et les solutions de refroidissement liquide applicables à votre projet, nous vous recommandons de contacter directement notre équipe technique qui pourra répondre à votre cas d’usage spécifique.' },
      { q: 'Est-il possible de déployer sur plusieurs sites NDC avec un contrat unique ?', a: 'Oui. Notre ambition est d’offrir à nos clients opérateurs un point d’entrée unique pour leur déploiement sur plusieurs sites en France. Avec 15 datacenters prévus d’ici 2030, nous sommes en mesure d’accompagner votre expansion nationale avec une gestion contractuelle et technique consolidée.' },
      { q: 'Quelle est la distance et latence entre NDC Rouen et Paris ?', a: 'NDC Rouen est situé à moins de 100 km de Paris, sur l’axe Paris-Normandie. La latence réseau entre ce site et Paris est typiquement inférieure à 2 ms sur fibre optique directe. Pour une mesure précise selon votre point de terminaison parisien, nos équipes techniques peuvent réaliser des tests sur demande.' },
    ],
  },
];
