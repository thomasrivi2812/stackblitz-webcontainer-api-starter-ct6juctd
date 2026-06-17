import { OffresPersonas } from '@/components/OffresPersonas';
import { getPersonas } from '@/lib/wordpress';

export const metadata = {
  title: 'Nos offres dédiées — Nation Data Center',
  description:
    'Des offres de colocation adaptées à chaque profil : DSI, PME/ETI, secteur public, opérateurs télécom et cloud.',
};

export default async function OffresPage() {
  const personas = await getPersonas();
  return (
    <main>
      <OffresPersonas personas={personas} />
    </main>
  );
}
