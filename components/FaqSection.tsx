import { getFaqs, type WpLocale } from '@/lib/wordpress';
import { FaqHome } from './FaqHome';
import { JsonLd } from './JsonLd';

// Wrapper serveur : récupère les FAQ côté serveur (getFaqs) dans la bonne langue
// et les passe au composant client FaqHome, qui gère l'accordéon. Les intitulés
// (eyebrow/title) peuvent être surchargés depuis WordPress (champs homeFields).
// Émet aussi les données structurées FAQPage (éligibles aux rich results Google).
export async function FaqSection({
  locale = 'fr',
  eyebrow,
  title,
}: { locale?: WpLocale; eyebrow?: string; title?: string }) {
  const faqs = await getFaqs(locale);
  return (
    <>
      {faqs.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            inLanguage: locale,
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.reponse },
            })),
          }}
        />
      )}
      <FaqHome items={faqs} eyebrow={eyebrow} title={title} />
    </>
  );
}
