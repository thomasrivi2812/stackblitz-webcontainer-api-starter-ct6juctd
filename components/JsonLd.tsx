// Injecte un bloc de données structurées schema.org (JSON-LD).
// Les <script type="application/ld+json"> sont des blocs de données inertes :
// jamais exécutés par le navigateur (et donc pas concernés par la CSP script-src),
// lus uniquement par les moteurs de recherche pour les rich results.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
