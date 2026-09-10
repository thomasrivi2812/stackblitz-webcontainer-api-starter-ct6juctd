import { routing } from '@/i18n/routing';

// Charge le dictionnaire d'interface d'une langue. Toute valeur inconnue
// retombe sur la langue par défaut : la route [locale] peut être sollicitée
// avec un premier segment qui n'est pas une langue (ex. « /image-absente.jpg »,
// non filtré par le middleware), et un import de « image-absente.jpg.json »
// levait une erreur serveur avant même le 404.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadMessages(locale: string): Promise<Record<string, any>> {
  const l = (routing.locales as readonly string[]).includes(locale) ? locale : routing.defaultLocale;
  return (await import(`../messages/${l}.json`)).default;
}
