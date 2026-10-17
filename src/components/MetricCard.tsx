import { cn, metricCardStyles } from '../ui';
import type { ReactNode } from 'react';
export function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <article
      className={cn(
        cn('metric-card bg-card border border-outline rounded-[12px]', metricCardStyles),
      )}
    >
      <div>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}
