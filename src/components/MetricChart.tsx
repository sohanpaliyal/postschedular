import { useId } from 'react';
import { compactNumber } from '../lib';
import { cn, metricChartGridStyles, metricChartLabelStyles, metricChartStyles } from '../ui';
export function MetricChart({
  title,
  values,
  labels,
  formatValue = compactNumber,
}: {
  title: string;
  values: number[];
  labels: string[];
  formatValue?: (value: number) => string;
}) {
  const id = useId();
  const max = Math.max(...values, 1);
  const width = 600;
  const height = 145;
  const points = values.map(
    (value, i) =>
      `${20 + (i / Math.max(1, values.length - 1)) * (width - 40)},${height - 10 - (value / max) * (height - 30)}`,
  );
  return (
    <figure className={cn(cn('metric-chart', metricChartStyles))}>
      <figcaption>
        {title}
        <span>Illustrative mock trend</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title}: ${values.map((value, i) => `${labels[i]} ${formatValue(value)}`).join(', ')}`}
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((level) => (
          <g key={level}>
            <line
              x1="20"
              y1={height - 10 - level * (height - 30)}
              x2="580"
              y2={height - 10 - level * (height - 30)}
              className={cn(cn('metric-chart-grid', metricChartGridStyles))}
            />
            <text
              x="0"
              y={height - 13 - level * (height - 30)}
              className={cn(cn('metric-chart-label text-[7px]', metricChartLabelStyles))}
            >
              {formatValue(Math.round(max * level * 10) / 10)}
            </text>
          </g>
        ))}
        <path
          d={`M20,${height - 10} L${points.join(' L')} L580,${height - 10} Z`}
          fill={`url(#${id})`}
        />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.split(',')[0]}
            cy={point.split(',')[1]}
            r="3"
            fill="currentColor"
          >
            <title>{`${labels[i]}: ${formatValue(values[i])}`}</title>
          </circle>
        ))}
      </svg>
      <div className={cn('flex justify-between gap-[5px] text-muted text-[8px] mt-[10px] px-[3%]')}>
        {labels.map(
          (label, i) =>
            (labels.length <= 7 ||
              i % Math.ceil((labels.length - 1) / 6) === 0 ||
              i === labels.length - 1) && <span key={i}>{label}</span>,
        )}
      </div>
    </figure>
  );
}
