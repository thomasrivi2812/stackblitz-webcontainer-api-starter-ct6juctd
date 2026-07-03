// Écran de chargement affiché instantanément pendant le rendu serveur d'une
// page (Suspense d'App Router). Squelette neutre, sans dépendance de données —
// il apparaît sur toutes les pages du segment [locale] pendant l'attente WP.
export default function Loading() {
  return (
    <main className="route-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="container">
        <div className="skl skl-eyebrow" />
        <div className="skl skl-title" />
        <div className="skl skl-line" />
        <div className="skl skl-line skl-line-short" />
        <div className="skl-grid">
          <div className="skl skl-card" />
          <div className="skl skl-card" />
          <div className="skl skl-card" />
        </div>
      </div>
    </main>
  );
}
