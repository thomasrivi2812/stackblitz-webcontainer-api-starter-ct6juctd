import type { MetadataRoute } from 'next';

// Crawlers IA explicitement autorisés (référencement dans les moteurs de
// réponse : ChatGPT, Claude, Perplexity, Google AI, Applebot…). Ils sont déjà
// couverts par la règle « * », mais les nommer lève toute ambiguïté.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: 'https://www.nationdc.fr/sitemap.xml',
    host: 'https://www.nationdc.fr',
  };
}
