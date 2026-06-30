import fs from "node:fs";
import path from "node:path";
// Refonte page GROUPE (design Altarea) + logo SVG + touches de violet. Fusionne sans rien écraser d ailleurs.
const fr = {
  "heroEyebrow": "Transformation urbaine · Bas carbone · Multi-métiers",
  "heroTitle": "Leader de la transformation urbaine bas carbone en France.",
  "heroLead": "Acteur multi-métiers, le Groupe Altarea répond de manière globale aux enjeux de transformation des territoires en apportant des solutions urbaines sur mesure à haute valeur ajoutée — toujours centrées sur l'humain.",
  "heroCta1": "Découvrir le Groupe",
  "heroCta2": "Nos engagements",
  "heroVisual": "// VISUEL — quartier urbain mixte bas carbone · format portrait",
  "heroCaptionTitle": "Opération mixte — bas carbone",
  "heroCaptionSub": "Logement · Commerce · Bureau",
  "kpiTitle": "Le groupe Altarea en chiffres",
  "kpiMeta": "Données 2024 · mise à jour 06.2026",
  "kpi1Label": "Chiffre d'affaires 2024",
  "kpi2Label": "du CA aligné à la taxonomie européenne",
  "kpi3Label": "Collaborateurs",
  "kpi4Label": "Transformation urbaine bas carbone en France",
  "metiersEyebrow": "Nos métiers",
  "metiersTitle": "Un modèle multi-métiers, intégré.",
  "metiersLead": "Notre modèle intégré mobilise tous les savoir-faire de l'immobilier, quelle que soit la classe d'actif concernée.",
  "metier1Title": "Logement",
  "metier1Desc": "Promotion résidentielle : concevoir des lieux de vie durables, au plus près des besoins des territoires.",
  "metier2Title": "Commerce",
  "metier2Desc": "Foncière de centres de commerce : des destinations vivantes, ancrées au cœur des métropoles.",
  "metier3Title": "Immobilier d'entreprise",
  "metier3Desc": "Bureaux, logistique et actifs tertiaires : des environnements de travail flexibles et bas carbone.",
  "metier4Title": "Nouvelles activités",
  "metier4Desc": "Data centers souverains, énergies renouvelables : diversifier le modèle pour accélérer la transition.",
  "engEyebrow": "Engagement bas carbone",
  "engTitle": "Un immobilier responsable et durable.",
  "engLead": "L'approche d'Altarea prend systématiquement en compte les enjeux de durabilité dans ses projets. Le Groupe figure ainsi régulièrement en tête des classements mondiaux pour sa performance.",
  "engStatValue": "68,6 %",
  "engStatLabel": "du CA aligné à la taxonomie européenne",
  "eng1Title": "Sobriété énergétique",
  "eng1Desc": "Réduire les besoins à la source et optimiser chaque usage, de la conception à l'exploitation.",
  "eng2Title": "Étalement urbain limité",
  "eng2Desc": "Recycler le foncier et densifier intelligemment pour retisser le lien entre périphérie et cœur de ville.",
  "eng3Title": "Utilisation raisonnée des ressources",
  "eng3Desc": "Matériaux bas carbone, réemploi et économie circulaire au cœur de chaque opération.",
  "eng4Title": "Biodiversité",
  "eng4Desc": "Réintroduire le vivant en ville et préserver les écosystèmes sur l'ensemble des projets.",
  "finalEyebrow": "Le Groupe Altarea",
  "finalTitle": "Retisser le lien urbain, avec un impact positif pour les territoires.",
  "finalLead": "Découvrez l'ensemble des savoir-faire, projets et engagements du Groupe sur le site officiel.",
  "finalCta": "Accéder à altarea.com"
};
const en = {
  "heroEyebrow": "Urban transformation · Low carbon · Multi-business",
  "heroTitle": "Leader in low-carbon urban transformation in France.",
  "heroLead": "A multi-business player, Groupe Altarea provides a comprehensive response to territorial transformation challenges, delivering tailor-made, high-value urban solutions — always centred on people.",
  "heroCta1": "Discover the Group",
  "heroCta2": "Our commitments",
  "heroVisual": "// VISUAL — mixed-use low-carbon district · portrait format",
  "heroCaptionTitle": "Mixed-use development — low carbon",
  "heroCaptionSub": "Housing · Retail · Office",
  "kpiTitle": "The Altarea group in figures",
  "kpiMeta": "2024 data · updated 06.2026",
  "kpi1Label": "2024 revenue",
  "kpi2Label": "of revenue aligned with the EU taxonomy",
  "kpi3Label": "Employees",
  "kpi4Label": "Low-carbon urban transformation in France",
  "metiersEyebrow": "Our businesses",
  "metiersTitle": "An integrated, multi-business model.",
  "metiersLead": "Our integrated model brings together all real-estate expertise, whatever the asset class.",
  "metier1Title": "Housing",
  "metier1Desc": "Residential development: designing sustainable places to live, as close as possible to local needs.",
  "metier2Title": "Retail",
  "metier2Desc": "Shopping centre property company: lively destinations rooted in the heart of cities.",
  "metier3Title": "Business real estate",
  "metier3Desc": "Offices, logistics and tertiary assets: flexible, low-carbon working environments.",
  "metier4Title": "New activities",
  "metier4Desc": "Sovereign data centers, renewable energy: diversifying the model to accelerate the transition.",
  "engEyebrow": "Low-carbon commitment",
  "engTitle": "Responsible and sustainable real estate.",
  "engLead": "Altarea systematically factors sustainability into its projects. As a result, the Group regularly ranks among the world leaders for its performance.",
  "engStatValue": "68.6 %",
  "engStatLabel": "of revenue aligned with the EU taxonomy",
  "eng1Title": "Energy efficiency",
  "eng1Desc": "Reduce needs at the source and optimise every use, from design to operation.",
  "eng2Title": "Limited urban sprawl",
  "eng2Desc": "Recycle land and densify intelligently to reconnect the outskirts with the city centre.",
  "eng3Title": "Responsible use of resources",
  "eng3Desc": "Low-carbon materials, reuse and circular economy at the heart of every project.",
  "eng4Title": "Biodiversity",
  "eng4Desc": "Bring nature back into the city and preserve ecosystems across all projects.",
  "finalEyebrow": "Groupe Altarea",
  "finalTitle": "Reconnecting the urban fabric, with a positive impact for territories.",
  "finalLead": "Discover all of the Group's expertise, projects and commitments on the official website.",
  "finalCta": "Go to altarea.com"
};
const files = {
  "components/AltareaLogo.tsx": "Ly8gTWFycXVlIEFsdGFyZWEgcmVjcsOpw6llIGVuIFNWRyAobGUgwqsgQSDCuyArIGxlIG1vdC1zeW1ib2xlKSwgY291bGV1ciB2aWEgY3VycmVudENvbG9yLgovLyBQb3VyIHV0aWxpc2VyIGxlIHZyYWkgbG9nbyBvZmZpY2llbCA6IGTDqXBvc2UtbGUgZGFucyBwdWJsaWMvYWx0YXJlYS1sb2dvLnN2ZyBldAovLyByZW1wbGFjZSA8QWx0YXJlYU1hcmsvPiBwYXIgPGltZyBzcmM9Ii9hbHRhcmVhLWxvZ28uc3ZnIiAuLi4vPi4KCmV4cG9ydCBmdW5jdGlvbiBBbHRhcmVhTWFyayh7IHNpemUgPSA0MCwgY2xhc3NOYW1lIH06IHsgc2l6ZT86IG51bWJlcjsgY2xhc3NOYW1lPzogc3RyaW5nIH0pIHsKICByZXR1cm4gKAogICAgPHN2ZwogICAgICB3aWR0aD17c2l6ZX0KICAgICAgaGVpZ2h0PXtzaXplfQogICAgICB2aWV3Qm94PSIwIDAgMTIwIDEyMCIKICAgICAgZmlsbD0iY3VycmVudENvbG9yIgogICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX0KICAgICAgcm9sZT0iaW1nIgogICAgICBhcmlhLWxhYmVsPSJBbHRhcmVhIgogICAgPgogICAgICB7LyogamFtYmUgZ2F1Y2hlICovfQogICAgICA8cGF0aCBkPSJNNTAgMTYgTDYxIDE2IEwzNCAxMDQgTDIwIDEwNCBaIiAvPgogICAgICB7LyogamFtYmUgZHJvaXRlIChwbHVzIGxhcmdlKSAqL30KICAgICAgPHBhdGggZD0iTTY2IDE2IEw4MCAxNiBMMTAxIDEwNCBMODQgMTA0IFoiIC8+CiAgICA8L3N2Zz4KICApOwp9CgpleHBvcnQgZnVuY3Rpb24gQWx0YXJlYUxvZ28oeyBoZWlnaHQgPSAzNCwgY2xhc3NOYW1lIH06IHsgaGVpZ2h0PzogbnVtYmVyOyBjbGFzc05hbWU/OiBzdHJpbmcgfSkgewogIHJldHVybiAoCiAgICA8c3BhbgogICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX0KICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2lubGluZS1mbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6IGhlaWdodCAqIDAuMSwgY29sb3I6ICdjdXJyZW50Q29sb3InIH19CiAgICA+CiAgICAgIDxBbHRhcmVhTWFyayBzaXplPXtoZWlnaHR9IC8+CiAgICAgIDxzcGFuCiAgICAgICAgc3R5bGU9e3sKICAgICAgICAgIGZvbnRXZWlnaHQ6IDcwMCwKICAgICAgICAgIGxldHRlclNwYWNpbmc6ICcwLjE4ZW0nLAogICAgICAgICAgZm9udFNpemU6IGhlaWdodCAqIDAuMzQsCiAgICAgICAgICBsaW5lSGVpZ2h0OiAxLAogICAgICAgIH19CiAgICAgID4KICAgICAgICBBTFRBUkVBCiAgICAgIDwvc3Bhbj4KICAgIDwvc3Bhbj4KICApOwp9Cg==",
  "app/[locale]/groupe/page.tsx": "aW1wb3J0IHsgS3BpQmFuZCB9IGZyb20gJ0AvY29tcG9uZW50cy9LcGlCYW5kJzsKaW1wb3J0IHsgQWx0YXJlYUxvZ28sIEFsdGFyZWFNYXJrIH0gZnJvbSAnQC9jb21wb25lbnRzL0FsdGFyZWFMb2dvJzsKaW1wb3J0IHsgdHlwZSBXcExvY2FsZSB9IGZyb20gJ0AvbGliL3dvcmRwcmVzcyc7CmltcG9ydCB0eXBlIHsgTWV0YWRhdGEgfSBmcm9tICduZXh0JzsKCi8vIFZpb2xldCBkZSBsYSBtYXJxdWUgQWx0YXJlYSAoYWNjZW50cyBkZSBsYSBwYWdlIEdyb3VwZSkuCmNvbnN0IEFMVEFSRUEgPSAnIzZBMkM5MSc7CgpleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVNZXRhZGF0YSh7IHBhcmFtczogeyBsb2NhbGUgfSB9OiB7IHBhcmFtczogeyBsb2NhbGU6IFdwTG9jYWxlIH0gfSk6IFByb21pc2U8TWV0YWRhdGE+IHsKICBjb25zdCBtID0gKGF3YWl0IGltcG9ydChgLi4vLi4vLi4vbWVzc2FnZXMvJHtsb2NhbGV9Lmpzb25gKSkuZGVmYXVsdC5tZXRhIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47CiAgcmV0dXJuIHsKICAgIHRpdGxlOiBtLmdyb3VwZVRpdGxlLAogICAgZGVzY3JpcHRpb246IG0uZ3JvdXBlRGVzYywKICAgIGFsdGVybmF0ZXM6IHsgY2Fub25pY2FsOiAnL2dyb3VwZScsIGxhbmd1YWdlczogeyBmcjogJy9ncm91cGUnLCBlbjogJy9lbi9ncm91cGUnIH0gfSwKICB9Owp9CgpleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBHcm91cGVQYWdlKHsgcGFyYW1zOiB7IGxvY2FsZSB9IH06IHsgcGFyYW1zOiB7IGxvY2FsZTogV3BMb2NhbGUgfSB9KSB7CiAgY29uc3QgdCA9IChhd2FpdCBpbXBvcnQoYC4uLy4uLy4uL21lc3NhZ2VzLyR7bG9jYWxlfS5qc29uYCkpLmRlZmF1bHQuZ3JvdXBlIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47CgogIGNvbnN0IGNoaWZmcmVzID0gWwogICAgeyB2YWxldXI6ICcyLDcnLCB1bml0ZTogJ01kc+KCrCcsIGxhYmVsOiB0LmtwaTFMYWJlbCB9LAogICAgeyB2YWxldXI6ICc2OCw2JywgdW5pdGU6ICclJywgbGFiZWw6IHQua3BpMkxhYmVsIH0sCiAgICB7IHZhbGV1cjogJzIgMTM5JywgdW5pdGU6ICcnLCBsYWJlbDogdC5rcGkzTGFiZWwgfSwKICAgIHsgdmFsZXVyOiAnTsKwMScsIHVuaXRlOiAnJywgbGFiZWw6IHQua3BpNExhYmVsIH0sCiAgXTsKICBjb25zdCBtZXRpZXJzID0gWwogICAgeyB0aXRyZTogdC5tZXRpZXIxVGl0bGUsIGRlc2M6IHQubWV0aWVyMURlc2MgfSwKICAgIHsgdGl0cmU6IHQubWV0aWVyMlRpdGxlLCBkZXNjOiB0Lm1ldGllcjJEZXNjIH0sCiAgICB7IHRpdHJlOiB0Lm1ldGllcjNUaXRsZSwgZGVzYzogdC5tZXRpZXIzRGVzYyB9LAogICAgeyB0aXRyZTogdC5tZXRpZXI0VGl0bGUsIGRlc2M6IHQubWV0aWVyNERlc2MgfSwKICBdOwogIGNvbnN0IGVuZ2FnZW1lbnRzID0gWwogICAgeyB0aXRyZTogdC5lbmcxVGl0bGUsIGRlc2M6IHQuZW5nMURlc2MgfSwKICAgIHsgdGl0cmU6IHQuZW5nMlRpdGxlLCBkZXNjOiB0LmVuZzJEZXNjIH0sCiAgICB7IHRpdHJlOiB0LmVuZzNUaXRsZSwgZGVzYzogdC5lbmczRGVzYyB9LAogICAgeyB0aXRyZTogdC5lbmc0VGl0bGUsIGRlc2M6IHQuZW5nNERlc2MgfSwKICBdOwoKICByZXR1cm4gKAogICAgPG1haW4+CiAgICAgIHsvKiBIRVJPICovfQogICAgICA8c2VjdGlvbiBjbGFzc05hbWU9Imhlcm8iPgogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJoZXJvLWJnLWdyaWQiIGFyaWEtaGlkZGVuPSJ0cnVlIiAvPgogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJjb250YWluZXIgaGVyby1ncmlkIj4KICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJoZXJvLXRleHQiPgogICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9ImV5ZWJyb3ciIHN0eWxlPXt7IGNvbG9yOiBBTFRBUkVBIH19PgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0iZXllYnJvdy1kb3QiIHN0eWxlPXt7IGJhY2tncm91bmQ6IEFMVEFSRUEgfX0gLz4KICAgICAgICAgICAgICB7dC5oZXJvRXllYnJvd30KICAgICAgICAgICAgICA8QWx0YXJlYU1hcmsgc2l6ZT17MjB9IGNsYXNzTmFtZT0iIiAvPgogICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9Imhlcm8tdGl0bGUiPnt0Lmhlcm9UaXRsZX08L2gxPgogICAgICAgICAgICA8cCBjbGFzc05hbWU9Imhlcm8tbGVhZCI+e3QuaGVyb0xlYWR9PC9wPgogICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iY3RhLXJvdyI+CiAgICAgICAgICAgICAgPGEgY2xhc3NOYW1lPSJidG4tdjIgYnRuLXYyLXByaW1hcnkiIGhyZWY9Imh0dHBzOi8vYWx0YXJlYS5jb20iIHRhcmdldD0iX2JsYW5rIiByZWw9Im5vb3BlbmVyIG5vcmVmZXJyZXIiPgogICAgICAgICAgICAgICAge3QuaGVyb0N0YTF9CiAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlV2lkdGg9IjIuMiIgc3Ryb2tlTGluZWNhcD0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTUgMTJoMTRNMTMgNWw3IDctNyA3IiAvPgogICAgICAgICAgICAgICAgPC9zdmc+CiAgICAgICAgICAgICAgPC9hPgogICAgICAgICAgICAgIDxhIGNsYXNzTmFtZT0iYnRuLXYyIGJ0bi12Mi1naG9zdCIgaHJlZj0iI2VuZ2FnZW1lbnQiPnt0Lmhlcm9DdGEyfTwvYT4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJoZXJvLXZpc3VhbCI+CiAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICBjbGFzc05hbWU9Imhlcm8tZnJhbWUiCiAgICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBwbGFjZUl0ZW1zOiAnY2VudGVyJywgbWluSGVpZ2h0OiAzODAsIGJhY2tncm91bmQ6ICd2YXIoLS1zdXJmYWNlLWFsdC0yLCAjZWVmM2Y5KScgfX0KICAgICAgICAgICAgPgogICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tbXV0ZWQtMiwgIzg1OTNhZiknLCBmb250RmFtaWx5OiAnbW9ub3NwYWNlJywgZm9udFNpemU6IDEzLCBsaW5lSGVpZ2h0OiAxLjYsIHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICcwIDI0cHgnIH19PgogICAgICAgICAgICAgICAge3QuaGVyb1Zpc3VhbH0KICAgICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9Imhlcm8tZnJhbWUtY29ybmVyIHRsIiBhcmlhLWhpZGRlbj0idHJ1ZSIgLz4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iaGVyby1mcmFtZS1jb3JuZXIgYnIiIGFyaWEtaGlkZGVuPSJ0cnVlIiAvPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9Imhlcm8tY2FwdGlvbiI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJoZXJvLWNhcC1kb3QiIGFyaWEtaGlkZGVuPSJ0cnVlIiAvPgogICAgICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgICAgICA8c3Ryb25nPnt0Lmhlcm9DYXB0aW9uVGl0bGV9PC9zdHJvbmc+CiAgICAgICAgICAgICAgICA8c3Bhbj57dC5oZXJvQ2FwdGlvblN1Yn08L3NwYW4+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KCiAgICAgIHsvKiBDSElGRlJFUyBDTMOJUyAqL30KICAgICAgPEtwaUJhbmQga3Bpcz17Y2hpZmZyZXN9IHRpdGxlPXt0LmtwaVRpdGxlfSBtZXRhPXt0LmtwaU1ldGF9IC8+CgogICAgICB7LyogTk9TIE3DiVRJRVJTICovfQogICAgICA8c2VjdGlvbiBjbGFzc05hbWU9InNlY3Rpb24iPgogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJjb250YWluZXIiPgogICAgICAgICAgPGRpdiBjbGFzc05hbWU9InNlY3Rpb24taGVhZC12MiI+CiAgICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJleWVicm93Ij48c3BhbiBjbGFzc05hbWU9ImV5ZWJyb3ctZG90IiAvPnt0Lm1ldGllcnNFeWVicm93fTwvc3Bhbj4KICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPSJzZWN0aW9uLXRpdGxlIj57dC5tZXRpZXJzVGl0bGV9PC9oMj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT0ic2VjdGlvbi1zdWIgcmlnaHQiPnt0Lm1ldGllcnNMZWFkfTwvcD4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImVuZy1ncmlkLXYyIj4KICAgICAgICAgICAge21ldGllcnMubWFwKChtLCBpKSA9PiAoCiAgICAgICAgICAgICAgPGFydGljbGUgY2xhc3NOYW1lPSJlbmctY2FyZC12MiIga2V5PXttLnRpdHJlfT4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0iZW5nLW51bSIgc3R5bGU9e3sgY29sb3I6IEFMVEFSRUEgfX0+e1N0cmluZyhpICsgMSkucGFkU3RhcnQoMiwgJzAnKX08L3NwYW4+CiAgICAgICAgICAgICAgICA8aDM+e20udGl0cmV9PC9oMz4KICAgICAgICAgICAgICAgIDxwPnttLmRlc2N9PC9wPgogICAgICAgICAgICAgIDwvYXJ0aWNsZT4KICAgICAgICAgICAgKSl9CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9zZWN0aW9uPgoKICAgICAgey8qIEVOR0FHRU1FTlQgQkFTIENBUkJPTkUgKi99CiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0ic2VjdGlvbiBzZWN0aW9uLWFsdCIgaWQ9ImVuZ2FnZW1lbnQiPgogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJjb250YWluZXIiPgogICAgICAgICAgPGRpdiBjbGFzc05hbWU9InNlY3Rpb24taGVhZC12MiI+CiAgICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJleWVicm93Ij48c3BhbiBjbGFzc05hbWU9ImV5ZWJyb3ctZG90IiAvPnt0LmVuZ0V5ZWJyb3d9PC9zcGFuPgogICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9InNlY3Rpb24tdGl0bGUiPnt0LmVuZ1RpdGxlfTwvaDI+CiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPSJzZWN0aW9uLXN1YiI+e3QuZW5nTGVhZH08L3A+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogNCwgYWxpZ25TZWxmOiAnZmxleC1lbmQnLCBtaW5XaWR0aDogMTgwIH19PgogICAgICAgICAgICAgIDxzdHJvbmcgc3R5bGU9e3sgZm9udFNpemU6IDM4LCBsaW5lSGVpZ2h0OiAxLCBjb2xvcjogQUxUQVJFQSwgZm9udFdlaWdodDogNzAwIH19Pnt0LmVuZ1N0YXRWYWx1ZX08L3N0cm9uZz4KICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogMTQsIGNvbG9yOiAndmFyKC0tbXV0ZWQsICM1ZDZiODUpJyB9fT57dC5lbmdTdGF0TGFiZWx9PC9zcGFuPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImVuZy1ncmlkLXYyIj4KICAgICAgICAgICAge2VuZ2FnZW1lbnRzLm1hcCgoZSwgaSkgPT4gKAogICAgICAgICAgICAgIDxhcnRpY2xlIGNsYXNzTmFtZT0iZW5nLWNhcmQtdjIiIGtleT17ZS50aXRyZX0+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9ImVuZy1udW0iIHN0eWxlPXt7IGNvbG9yOiBBTFRBUkVBIH19PntTdHJpbmcoaSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9PC9zcGFuPgogICAgICAgICAgICAgICAgPGgzPntlLnRpdHJlfTwvaDM+CiAgICAgICAgICAgICAgICA8cD57ZS5kZXNjfTwvcD4KICAgICAgICAgICAgICA8L2FydGljbGU+CiAgICAgICAgICAgICkpfQogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KCiAgICAgIHsvKiBDVEEgRklOQUwg4oCUIEdyb3VwZSBBbHRhcmVhICovfQogICAgICA8c2VjdGlvbiBjbGFzc05hbWU9Im9wLWZpbmFsIiBzdHlsZT17eyBbJy0tb3AtYWNjZW50JyBhcyBzdHJpbmddOiBBTFRBUkVBIH0gYXMgUmVhY3QuQ1NTUHJvcGVydGllc30+CiAgICAgICAgPGRpdiBjbGFzc05hbWU9ImNvbnRhaW5lciI+CiAgICAgICAgICA8c3BhbiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAyMiwgY29sb3I6ICcjZmZmJyB9fT4KICAgICAgICAgICAgPEFsdGFyZWFMb2dvIGhlaWdodD17NTB9IC8+CiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICA8aDIgY2xhc3NOYW1lPSJmaWwtcm91Z2UiPnt0LmZpbmFsVGl0bGV9PC9oMj4KICAgICAgICAgIDxwIGNsYXNzTmFtZT0ib3AtZmluYWwtbGVhZCI+e3QuZmluYWxMZWFkfTwvcD4KICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJvcC1jdGEtcm93Ij4KICAgICAgICAgICAgPGEKICAgICAgICAgICAgICBjbGFzc05hbWU9Im9wLWJ0bi1wcmltYXJ5IgogICAgICAgICAgICAgIGhyZWY9Imh0dHBzOi8vYWx0YXJlYS5jb20iCiAgICAgICAgICAgICAgdGFyZ2V0PSJfYmxhbmsiCiAgICAgICAgICAgICAgcmVsPSJub29wZW5lciBub3JlZmVycmVyIgogICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmQ6ICcjZmZmJywgY29sb3I6IEFMVEFSRUEgfX0KICAgICAgICAgICAgPgogICAgICAgICAgICAgIHt0LmZpbmFsQ3RhfSDihpIKICAgICAgICAgICAgPC9hPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KICAgIDwvbWFpbj4KICApOwp9Cg=="
};
function merge(file, ns) {
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  d.groupe = Object.assign(d.groupe || {}, ns);
  fs.writeFileSync(file, JSON.stringify(d, null, 2) + "\n");
  console.log("fusionné :", file);
}
merge("messages/fr.json", fr);
merge("messages/en.json", en);
for (const [p, b] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, Buffer.from(b, "base64").toString("utf8"));
  console.log("écrit    :", p);
}
console.log("\n✓ Fait. Ctrl+C puis : npm run dev");
