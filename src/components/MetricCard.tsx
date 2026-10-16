import type { ReactNode } from 'react';
export function MetricCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
  return <article className="metric-card"><div><span>{label}</span>{icon}</div><strong>{value}</strong><small>{hint}</small></article>;
}
