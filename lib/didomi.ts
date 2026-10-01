// Configuration Didomi (CMP / bannière cookies) du site NDC. Clé API et
// notice sont publiques (visibles dans la page) : valeurs intégrées par
// défaut, surchargeables par NEXT_PUBLIC_DIDOMI_API_KEY / _NOTICE_ID.
// NEXT_PUBLIC_DIDOMI_API_KEY=off désactive la bannière (ex. recette).
const key = process.env.NEXT_PUBLIC_DIDOMI_API_KEY || '4bca7c81-5aa2-4ca6-b67d-ae08ed69325b';

export const DIDOMI_API_KEY = key === 'off' ? '' : key;
export const DIDOMI_NOTICE_ID = process.env.NEXT_PUBLIC_DIDOMI_NOTICE_ID || 'UChTekHy';
export const DIDOMI_ENABLED = Boolean(DIDOMI_API_KEY);
