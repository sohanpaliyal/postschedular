import { compactNumber, heatLevel } from '../lib/analytics';
export function HeatmapValue({ value, maximum }: { value: number | null; maximum: number }) {
  return <span className={`heatmap-value heat-${value === null ? 0 : heatLevel(value, maximum)}`} title={value === null ? 'No performance data until published' : value.toLocaleString()}>{value === null ? '—' : compactNumber(value)}</span>;
}
