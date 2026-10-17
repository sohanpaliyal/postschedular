import { useState } from 'react';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Select } from '@/components/Select';
import { MetricChart } from '@/components/MetricChart';
import { dailyPerformance } from '@/lib';
import type { Post } from '@/types';
type TrendMetric = 'impressions' | 'engagement' | 'interactions';
const metrics: {
  value: TrendMetric;
  label: string;
}[] = [
  { value: 'impressions', label: 'Impressions' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'interactions', label: 'Interactions' },
];
export function DashboardTrend({
  posts,
  now,
  loading,
}: {
  posts: Post[];
  now: number;
  loading: boolean;
}) {
  const [metric, setMetric] = useState<TrendMetric>('impressions');
  const [period, setPeriod] = useState<7 | 30>(7);
  const series = dailyPerformance(posts, period, new Date(now));
  const label = metrics.find((option) => option.value === metric)!.label;
  return (
    <section
      className="min-w-0 rounded-[20px] border border-outline bg-surface p-[24px] max-[760px]:p-[16px]"
      aria-label="Performance trend"
    >
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h2 className="m-0 text-[16px] font-medium text-foreground">Performance trend</h2>
          <p className="mt-[6px] text-[11px] leading-[1.7] text-muted">
            Daily mock performance across published posts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <SegmentedControl
            label="Performance metric"
            value={metric}
            options={metrics}
            onChange={setMetric}
          />
          <Select
            label="Performance period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: 7, label: 'Last 7 days' },
              { value: 30, label: 'Last 30 days' },
            ]}
          />
        </div>
      </div>
      {loading ? (
        <div
          role="status"
          aria-label="Loading performance chart"
          className="mt-[20px] h-[220px] rounded-[12px] bg-soft motion-safe:animate-pulse"
        />
      ) : (
        <div className="mt-[20px] [&_.metric-chart]:m-0 [&_.metric-chart]:w-full">
          <MetricChart
            title={`${label} · Last ${period} days`}
            labels={series.map((day) => day.label)}
            values={series.map((day) => day[metric])}
            formatValue={metric === 'engagement' ? (value) => `${value}%` : undefined}
          />
        </div>
      )}
      {!loading && !series.some((day) => day.impressions > 0) && (
        <p className="mt-[12px] text-[11px] text-muted">
          No published-post performance in this period. Try a wider date range.
        </p>
      )}
    </section>
  );
}
