import { NextResponse } from 'next/server';
import { createAltchaChallenge } from '@/lib/altcha-server';

// Délivre un défi ALTCHA (captcha auto-hébergé) au navigateur, juste avant
// l'envoi d'un formulaire. Voir lib/altcha-server.ts.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const challenge = await createAltchaChallenge();
  return NextResponse.json(challenge, { headers: { 'Cache-Control': 'no-store' } });
}
