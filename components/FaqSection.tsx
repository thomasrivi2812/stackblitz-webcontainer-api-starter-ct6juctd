import { getFaqs, type WpLocale } from '@/lib/wordpress';
import { FaqHome } from './FaqHome';

// Wrapper serveur : récupère les FAQ côté serveur (getFaqs) dans la bonne langue
// et les passe au composant client FaqHome, qui gère l'accordéon.
export async function FaqSection({ locale = 'fr' }: { locale?: WpLocale }) {
  const faqs = await getFaqs(locale);
  return <FaqHome items={faqs} />;
}
