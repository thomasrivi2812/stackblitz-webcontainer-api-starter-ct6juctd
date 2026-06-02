// Motif iconographique NDC : panneaux rouges en perspective (« accordéon » 3D).
export function RedMotif() {
  const blades = [
    { x: 0, fill: '#7a0000' },
    { x: 34, fill: '#a30000' },
    { x: 68, fill: '#c40000' },
    { x: 102, fill: '#e00000' },
    { x: 136, fill: '#ff0000' },
    { x: 170, fill: '#ff2a2a' },
  ];
  return (
    <svg className="motif" viewBox="0 0 420 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Motif graphique NDC">
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {blades.map((b, i) => (
        <g key={i}>
          {/* tranche (épaisseur) */}
          <polygon
            points={`${b.x + 150},70 ${b.x + 190},50 ${b.x + 190},370 ${b.x + 150},390`}
            fill={b.fill}
            opacity="0.85"
          />
          {/* face */}
          <polygon
            points={`${b.x + 110},90 ${b.x + 150},70 ${b.x + 150},390 ${b.x + 110},410`}
            fill={b.fill}
          />
          <polygon
            points={`${b.x + 110},90 ${b.x + 150},70 ${b.x + 150},390 ${b.x + 110},410`}
            fill="url(#sheen)"
          />
        </g>
      ))}
    </svg>
  );
}
