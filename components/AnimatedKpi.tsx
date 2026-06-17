'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  valeur: string;
  unite: string;
  label: string;
  duration?: number;
  index: number;
};

function parseTarget(valeur: string): { type: 'number'; target: number; decimals: number } | { type: 'text' } {
  const cleaned = valeur.replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return { type: 'text' };
  const parts = cleaned.split('.');
  const decimals = parts[1] ? parts[1].length : 0;
  return { type: 'number', target: num, decimals };
}

function formatNumber(n: number, decimals: number): string {
  const fixed = n.toFixed(decimals);
  return fixed.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
}

export function AnimatedKpi({ valeur, unite, label, duration = 1800, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('');
  const [visible, setVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setVisible(true);
          animate();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function animate() {
    const parsed = parseTarget(valeur);

    if (parsed.type === 'text') {
      setDisplay(valeur);
      return;
    }

    const { target, decimals } = parsed;
    const isPue = label.toLowerCase().includes('pue');
    const start = isPue ? 2.0 : 0;

    let startTime: number | null = null;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (target - start) * eased;
      setDisplay(formatNumber(current, decimals));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  return (
    <div
      ref={ref}
      className="kpi-cell"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <span className="kpi-key">{String(index + 1).padStart(2, '0')}</span>
      <div className="kpi-val-row">
        <span className="kpi-val">{display || valeur}</span>
        {unite && <span className="kpi-unit">{unite}</span>}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}