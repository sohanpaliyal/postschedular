import { cn } from '../ui/cn';
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
    <article className={cn('metric-card bg-card border border-outline rounded-[12px]')}>
      <div>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}
