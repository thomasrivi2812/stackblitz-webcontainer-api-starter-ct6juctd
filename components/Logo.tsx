export function Logo({ white = false }: { white?: boolean }) {
  return (
    <span className={`logo${white ? ' logo--white' : ''}`} aria-label="Nation Data Center">
      <span className="logo-frame">
        <span className="l">N</span>
        <span className="bar" />
        <span className="l">D</span>
        <span className="bar" />
        <span className="l">C</span>
      </span>
    </span>
  );
}
