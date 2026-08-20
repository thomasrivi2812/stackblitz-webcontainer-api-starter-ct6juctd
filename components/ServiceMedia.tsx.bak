// Média d'un service : image mise en avant WordPress, sinon placeholder
// (dégradé marine → turquoise + icône) pour rester propre sans visuel.
import { ServiceIcon } from './ServiceIcon';
import type { Service } from '@/lib/wordpress';

export function ServiceMedia({ service }: { service: Service }) {
  if (service.image?.sourceUrl) {
    return <img src={service.image.sourceUrl} alt={service.image.altText || service.titre} />;
  }
  return (
    <div className="svc-media-ph" aria-hidden="true">
      <span className="svc-media-ph-ico">
        <ServiceIcon name={service.icone} />
      </span>
    </div>
  );
}
