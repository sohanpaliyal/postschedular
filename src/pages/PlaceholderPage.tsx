import type { ReactNode } from 'react';
import './RoutePage.css';
export function PlaceholderPage({ title, icon, description }: { title: string; icon: ReactNode; description: string }) {
  return <section className="route-page"><h1>{title}</h1><div className="route-card route-placeholder"><span>{icon}</span><h2>{title}</h2><p>{description}</p><small>Page setup complete · Features coming next</small></div></section>;
}
