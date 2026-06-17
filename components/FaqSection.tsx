import { getFaqs } from '@/lib/wordpress';
import { FaqHome } from './FaqHome';

// Wrapper serveur : récupère les FAQ côté serveur (getFaqs) et les passe au
// composant client FaqHome, qui gère l'accordéon. La home n'a plus qu'à rendre
// <FaqSection /> — aucune prop à câbler, donc plus d'erreur possible.
export async function FaqSection() {
  const faqs = await getFaqs();
  return <FaqHome items={faqs} />;
}
