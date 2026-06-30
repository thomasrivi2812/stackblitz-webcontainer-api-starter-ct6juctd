import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';

// Config serveur de next-intl. Sous WebContainer/StackBlitz, `requestLocale`
// lit les en-têtes hors « contexte de requête » et lève
// « headers was called outside a request scope ». On l'entoure d'un try/catch
// et on retombe sur la langue par défaut : l'interface utilise de toute façon
// les messages passés EXPLICITEMENT à NextIntlClientProvider dans le layout,
// donc cette valeur ne sert que de repli et n'affecte pas l'affichage par langue.
export default getRequestConfig(async ({ requestLocale }) => {
  let locale: string | undefined;
  try {
    locale = await requestLocale;
  } catch {
    locale = undefined;
  }

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
