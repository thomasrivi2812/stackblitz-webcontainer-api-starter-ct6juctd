'use client';

import { AnimatedKpi } from './AnimatedKpi';

type Kpi = {
  valeur: string;
  unite: string;
  label: string;
};

type Props = {
  kpis: Kpi[];
};

export function KpiBand({ kpis }: Props) {
  function getDuration(k: Kpi): number {
    const cleaned = k.valeur.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 1500;
    if (num <= 2) return 3500;
    if (num <= 20) return 3000;
    return 2000;
  }

  // Date courante au format "MM.YYYY" pour le bandeau "Données réseau · mise à jour ..."
  const now = new Date();
  const meta = `Données réseau · mise à jour ${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

  return (
    <section className="kpi-band">
      <div className="kpi-band-glow" aria-hidden="true" />
      <div className="container">
        <div className="kpi-band-head">
          <span className="kpi-overline"><span className="dash" />Le réseau en chiffres</span>
          <span className="kpi-meta">{meta}</span>
        </div>
        <div className="kpi-grid">
          {kpis.map((k, i) => (
            <AnimatedKpi
              key={i}
              index={i}
              valeur={k.valeur}
              unite={k.unite}
              label={k.label}
              duration={getDuration(k)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
