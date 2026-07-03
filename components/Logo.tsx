// Logo du site. Par défaut : la marque N|D|C dessinée. Si un logo est défini
// dans WordPress (champ « Logo du site » / « Logo du site — version claire »),
// on affiche l'image à la place. `white` = contexte sombre (footer) : bordure
// blanche pour la marque dessinée, et logo « clair » si fourni.
export function Logo({
  white = false,
  src = null,
  alt = 'Nation Data Center',
}: {
  white?: boolean;
  src?: string | null;
  alt?: string;
}) {
  if (src) {
    return (
      <span className={`logo logo--img${white ? ' logo--white' : ''}`} aria-label={alt}>
        <img src={src} alt={alt} />
      </span>
    );
  }
  return (
    <span className={`logo${white ? ' logo--white' : ''}`} aria-label={alt}>
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
