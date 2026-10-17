import { compactNumber, heatLevel } from '@/lib';
import { cn, heatmapValueStyles } from '@/ui';
export function HeatmapValue({ value, maximum }: { value: number | null; maximum: number }) {
  return (
    <span
      className={cn(
        cn(
          `heatmap-value flex items-center justify-center text-[11px] [font-variant-numeric:tabular-nums] heat-${value === null ? 0 : heatLevel(value, maximum)}`,
          heatmapValueStyles,
        ),
      )}
      title={value === null ? 'No performance data until published' : value.toLocaleString()}
    >
      {value === null ? '—' : compactNumber(value)}
    </span>
  );
}
