// Captcha ALTCHA — côté serveur (auto-hébergé, aucun service tiers).
// --------------------------------------------------------------------
// Principe (« preuve de travail ») : le serveur envoie un défi signé ; le
// navigateur doit trouver par calcul un nombre qui le résout (~1 s, invisible
// pour le visiteur), puis le joint au formulaire. Un bot qui veut envoyer des
// milliers de formulaires doit payer ce calcul à chaque fois. Aucun cookie,
// aucune donnée personnelle, aucun appel externe.
//
// ENV : ALTCHA_HMAC_SECRET (chaîne aléatoire longue). Facultatif sur un seul
// serveur : à défaut, un secret aléatoire est généré au démarrage (les défis
// en cours deviennent invalides à chaque redémarrage, sans gravité). À définir
// obligatoirement si plusieurs instances Next servent le site.
import { createHash, randomBytes } from 'node:crypto';
import { CappedMap, createChallenge, randomInt, verifySolution, type Challenge, type Solution } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';

// Difficulté : coût PBKDF2 × nombre d'essais. Réglée pour ~0,5–1 s sur un
// ordinateur ou mobile courant. Augmenter si du spam passe malgré tout.
const ALGORITHM = 'PBKDF2/SHA-256';
const COST = 500;
const COUNTER_MIN = 2_000;
const COUNTER_MAX = 5_000;
/** Durée de validité d'un défi. */
const TTL_SECONDS = 10 * 60;

// Partagé via globalThis : chaque route (/api/altcha, /api/lead) est compilée
// séparément, un état de module ne serait pas commun aux deux.
type AltchaState = { secret: string; keySecret: string; used: CappedMap<string, number> };
const g = globalThis as typeof globalThis & { __ndcAltcha?: AltchaState };

function state(): AltchaState {
  if (!g.__ndcAltcha) {
    const secret = process.env.ALTCHA_HMAC_SECRET || randomBytes(32).toString('hex');
    g.__ndcAltcha = {
      secret,
      // Second secret (signature de la clé dérivée), déduit du premier.
      keySecret: createHash('sha256').update(`${secret}:key`).digest('hex'),
      // Défis déjà utilisés (anti-rejeu), bornés en mémoire.
      used: new CappedMap<string, number>({ maxSize: 20_000 }),
    };
  }
  return g.__ndcAltcha;
}

export async function createAltchaChallenge(): Promise<Challenge> {
  const { secret, keySecret } = state();
  return createChallenge({
    algorithm: ALGORITHM,
    cost: COST,
    counter: randomInt(COUNTER_MAX, COUNTER_MIN),
    deriveKey,
    expiresAt: Math.floor(Date.now() / 1000) + TTL_SECONDS,
    hmacSignatureSecret: secret,
    hmacKeySignatureSecret: keySecret,
  });
}

/**
 * Vérifie la solution jointe au formulaire (`captcha`, JSON encodé en base64 :
 * { challenge, solution }). Un défi ne peut servir qu'une fois.
 */
export async function verifyAltchaPayload(raw: unknown): Promise<boolean> {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 4_000) return false;
  let parsed: { challenge?: Challenge; solution?: Solution };
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    return false;
  }
  const { challenge, solution } = parsed;
  if (!challenge?.parameters || !challenge.signature || typeof solution?.counter !== 'number') return false;
  // Uniquement nos paramètres : un bot ne peut pas imposer un défi plus facile
  // (la signature le couvre déjà, contrôle explicite en défense en profondeur).
  if (challenge.parameters.algorithm !== ALGORITHM || challenge.parameters.cost !== COST) return false;

  const { secret, keySecret, used } = state();
  if (used.has(challenge.signature)) return false;
  try {
    const result = await verifySolution({
      challenge,
      solution,
      deriveKey,
      hmacSignatureSecret: secret,
      hmacKeySignatureSecret: keySecret,
    });
    if (!result.verified) return false;
  } catch {
    return false;
  }
  used.set(challenge.signature, Date.now());
  return true;
}
