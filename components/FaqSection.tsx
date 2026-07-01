import { getFaqs, type WpLocale } from '@/lib/wordpress';
import { FaqHome } from './FaqHome';

// Wrapper serveur : récupère les FAQ côté serveur (getFaqs) dans la bonne langue
// et les passe au composant client FaqHome, qui gère l'accordéon. Les intitulés
// (eyebrow/title) peuvent être surchargés depuis WordPress (champs homeFields).
export async function FaqSection({
  locale = 'fr',
  eyebrow,
  title,
}: { locale?: WpLocale; eyebrow?: string; title?: string }) {
  const faqs = await getFaqs(locale);
  return <FaqHome items={faqs} eyebrow={eyebrow} title={title} />;
}
