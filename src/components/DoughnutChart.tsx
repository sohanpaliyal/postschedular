import { useId, useState } from 'react';
export interface DoughnutSegment {
  label: string;
  value: number;
  color: string;
}
/** Responsive doughnut with immediate pointer and keyboard data feedback. */
export function DoughnutChart({ title, segments }: { title: string; segments: DoughnutSegment[] }) {
  const titleId = useId();
  const tooltipId = useId();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const slices = segments.map((segment, index) => ({
    ...segment,
    percentage: total ? (segment.value / total) * 100 : 0,
    offset: total
      ? (segments.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total) * 100
      : 0,
  }));
  const active = slices.find((slice) => slice.label === activeLabel);
  return (
    <figure className="relative m-0" aria-labelledby={titleId}>
      <figcaption id={titleId} className="sr-only">
        {title}
      </figcaption>
      <svg
        viewBox="0 0 240 240"
        className="mx-auto block w-full max-w-[320px]"
        role="group"
        aria-label={`${title}: ${total} total posts. ${slices.map((slice) => `${slice.label}: ${slice.value}`).join(', ')}`}
      >
        <circle
          cx="120"
          cy="120"
          r="86"
          fill="none"
          stroke="var(--analytics-soft)"
          strokeWidth="24"
        />
        {slices
          .filter((slice) => slice.value > 0)
          .map((slice) => (
            <circle
              key={slice.label}
              cx="120"
              cy="120"
              r="86"
              fill="none"
              stroke={slice.color}
              strokeWidth={activeLabel === slice.label ? 28 : 24}
              tabIndex={0}
              role="img"
              aria-label={`${slice.label}: ${slice.value} posts, ${slice.percentage.toFixed(1)}%`}
              aria-describedby={activeLabel === slice.label ? tooltipId : undefined}
              className="cursor-pointer focus:outline-none"
              pointerEvents="stroke"
              onPointerEnter={() => setActiveLabel(slice.label)}
              onPointerLeave={() => setActiveLabel(null)}
              onPointerDown={() => setActiveLabel(slice.label)}
              onFocus={() => setActiveLabel(slice.label)}
              onBlur={() => setActiveLabel(null)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setActiveLabel(null);
              }}
              pathLength="100"
              strokeDasharray={`${Math.max(0, slice.percentage - (slices.filter((item) => item.value > 0).length > 1 ? Math.min(1.5, slice.percentage / 3) : 0))} 100`}
              strokeDashoffset={-slice.offset}
              transform="rotate(-90 120 120)"
            />
          ))}
        <text
          x="120"
          y="118"
          textAnchor="middle"
          fill="var(--analytics-text)"
          fontSize="34"
          fontWeight="500"
        >
          {active ? active.value : total}
        </text>
        <text x="120" y="140" textAnchor="middle" fill="var(--analytics-muted)" fontSize="11">
          {active ? active.label : 'Total posts'}
        </text>
      </svg>
      {active && (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-[4px] z-10 -translate-x-1/2 whitespace-nowrap rounded-[10px] border border-outline bg-card px-[12px] py-[8px] text-[12px] text-foreground shadow-lg"
        >
          <span
            className="mr-[7px] inline-block h-[8px] w-[8px] rounded-full"
            style={{ backgroundColor: active.color }}
          />
          {active.label}: <strong className="font-medium">{active.value}</strong>
          <span className="ml-[7px] text-muted">{active.percentage.toFixed(1)}%</span>
        </div>
      )}
      {total === 0 && <p className="mt-[14px] text-center text-[11px] text-muted">No posts yet.</p>}
    </figure>
  );
}
