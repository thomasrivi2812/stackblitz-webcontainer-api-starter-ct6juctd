import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// Configuration centrale du multilingue.
// - locales : langues servies par le site.
// - defaultLocale : le français reste à la racine (« / », « /services »…).
// - localePrefix 'as-needed' : seul l'anglais est préfixé (« /en », « /en/services »),
//   ce qui préserve les URLs FR existantes (pas de redirections SEO à prévoir).
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

// Helpers de navigation conscients de la locale : à utiliser PARTOUT à la place
// de next/link et next/navigation pour que les liens pointent vers la bonne langue.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
