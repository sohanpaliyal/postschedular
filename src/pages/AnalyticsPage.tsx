import { useEffect, useState } from 'react';
import { Activity, BarChart3, Download, Eye, Heart, TrendingUp } from 'lucide-react';
import {
  Button,
  DataTable,
  HeatmapValue,
  MetricCard,
  MetricChart,
  Modal,
  Pagination,
  PlatformIcon,
  PostFilters,
  SegmentedControl,
  Select,
  StatusBadge,
  type PostFiltersProps,
  type TableColumn,
} from '../components';
import {
  compactNumber,
  metricSeries,
  mockMetrics,
  sumMetrics,
  withinPeriod,
  type PostMetrics,
} from '../lib';
import { useTimeFormatter } from '../state';
import { platforms, type Platform, type Post } from '../types';
import {
  analyticsDataNoteStyles,
  analyticsDemoLabelStyles,
  analyticsDetailStatsStyles,
  analyticsFilterRowStyles,
  analyticsHeadingStyles,
  analyticsHeadingTitleStyles,
  analyticsMetricsStyles,
  analyticsOverviewChartStyles,
  analyticsPageStyles,
  analyticsPlatformNoteStyles,
  analyticsPostCellStyles,
  analyticsPostNameStyles,
  analyticsPostPlatformsStyles,
  analyticsSectionHeadingStyles,
  analyticsSurfaceStyles,
  analyticsTableToolsStyles,
  analyticsTabsStyles,
  analyticsThumbnailStyles,
  appH1Styles,
  cn,
  emptyStateStyles,
  engagementTrackStyles,
  heatmapLegendStyles,
  heatmapValueStyles,
  skeletonsStyles,
} from '../ui';
type Tab = 'overview' | 'performance' | 'platforms';
type Metric = 'impressions' | 'reach' | 'likes';
type Row = {
  post: Post;
  metrics: PostMetrics | null;
};
function readTab(): Tab {
  const tab = new URLSearchParams(location.search).get('tab');
  return tab === 'overview' || tab === 'platforms' ? tab : 'performance';
}
function readPeriod(): number {
  const value = Number(new URLSearchParams(location.search).get('period'));
  return value === 7 || value === 30 ? value : 0;
}
export function AnalyticsPage({
  posts,
  filters,
  loading,
  onOpenPost,
}: {
  posts: Post[];
  filters: PostFiltersProps;
  loading: boolean;
  onOpenPost: (post: Post) => void;
}) {
  const formatTime = useTimeFormatter();
  const [tab, setTab] = useState<Tab>(readTab);
  const [period, setPeriod] = useState(readPeriod);
  const [sort, setSort] = useState('impressions');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('impressions');
  const [perfPage, setPerfPage] = useState(1);
  const [perfPageSize, setPerfPageSize] = useState(10);
  useEffect(() => {
    const handler = () => {
      setTab(readTab());
      setPeriod(readPeriod());
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    params.set('period', String(period));
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }, [tab, period]);
  const rows = posts
    .filter((post) => withinPeriod(post, period))
    .map((post) => ({ post, metrics: mockMetrics(post) }))
    .sort((a, b) =>
      sort === 'recent'
        ? b.post.scheduledAt.localeCompare(a.post.scheduledAt)
        : (b.metrics?.[sort as keyof PostMetrics] ?? -1) -
          (a.metrics?.[sort as keyof PostMetrics] ?? -1),
    );
  // Reset pagination before rendering results from changed inputs.
  const [previousInputs, setPreviousInputs] = useState({ posts, period, sort });
  if (
    previousInputs.posts !== posts ||
    previousInputs.period !== period ||
    previousInputs.sort !== sort
  ) {
    setPreviousInputs({ posts, period, sort });
    setPerfPage(1);
  }
  const pagedRows = rows.slice((perfPage - 1) * perfPageSize, perfPage * perfPageSize);
  const totals = sumMetrics(rows.map((row) => row.metrics));
  const published = rows.filter((row) => row.metrics).length;
  const selected = rows.find((row) => row.post.id === selectedId);
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const maxima = Object.fromEntries(
    (['likes', 'comments', 'shares', 'impressions', 'reach'] as const).map((key) => [
      key,
      Math.max(0, ...rows.map((row) => row.metrics?.[key] || 0)),
    ]),
  ) as Record<'likes' | 'comments' | 'shares' | 'impressions' | 'reach', number>;
  const performanceColumns: TableColumn<Row>[] = [
    {
      key: 'post',
      heading: 'Post',
      className: cn('w-[29%] min-w-[260px]'),
      render: ({ post }) => (
        <div
          className={cn(cn('analytics-post-cell items-center gap-[10px]', analyticsPostCellStyles))}
        >
          <div
            className={cn(
              cn(
                'analytics-thumbnail rounded-[5px] bg-soft grid place-items-center shrink-[0] text-muted overflow-hidden',
                analyticsThumbnailStyles,
              ),
            )}
          >
            {post.mediaUrl ? (
              <img src={post.mediaUrl} alt="" loading="lazy" />
            ) : (
              <BarChart3 size={19} />
            )}
          </div>
          <div>
            <Button
              variant="unstyled"
              className={cn(
                cn(
                  'analytics-post-name block text-left text-foreground text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px] p-[0] leading-[1.6]',
                  analyticsPostNameStyles,
                ),
              )}
              onClick={() => onOpenPost(post)}
              title={post.content}
            >
              {post.content}
            </Button>
            <small>
              {new Date(post.scheduledAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}{' '}
              · {formatTime(new Date(post.scheduledAt))}
            </small>
            <div
              className={cn(
                cn(
                  'analytics-post-platforms flex items-center gap-[4px]',
                  analyticsPostPlatformsStyles,
                ),
              )}
            >
              <StatusBadge status={post.status} />
              {post.platforms.map((platform) => (
                <PlatformIcon key={platform} platform={platform} />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'followers',
      heading: 'Followers',
      render: (row) => (row.metrics ? compactNumber(row.metrics.followers) : '—'),
    },
    {
      key: 'engagement',
      heading: 'Engagement',
      render: (row) => (
        <div className={cn('min-w-[68px] text-[10px]')}>
          <span>{row.metrics ? `${row.metrics.engagement}%` : '—'}</span>
          {row.metrics && (
            <div
              className={cn(cn('engagement-track overflow-hidden mt-[7px]', engagementTrackStyles))}
            >
              <i style={{ width: `${Math.min(100, row.metrics.engagement)}%` }} />
            </div>
          )}
        </div>
      ),
    },
    ...(['likes', 'comments', 'shares', 'impressions', 'reach'] as const).map((key) => ({
      key,
      heading: key[0].toUpperCase() + key.slice(1),
      className: cn('heatmap-cell'),
      render: (row: Row) => (
        <HeatmapValue value={row.metrics?.[key] ?? null} maximum={maxima[key]} />
      ),
    })),
    {
      key: 'action',
      heading: 'Action',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedId(row.post.id);
            setMetric('impressions');
          }}
        >
          Details
        </Button>
      ),
    },
  ];
  const platformRows = platforms.map((platform) => {
    const entries = rows.filter((row) => row.post.platforms.includes(platform));
    return {
      platform,
      count: entries.length,
      published: entries.filter((row) => row.metrics).length,
      scheduled: entries.filter((row) => row.post.status === 'scheduled').length,
      failed: entries.filter((row) => row.post.status === 'failed').length,
    };
  });
  function exportReport() {
    const quote = (value: string) =>
      '"' + (/^[=+@-]/.test(value) ? "'" : '') + value.replaceAll('"', '""') + '"';
    const content = [
      [
        'Post',
        'Status',
        'Platforms',
        'Scheduled UTC',
        'Followers (mock)',
        'Engagement % (mock)',
        'Likes (mock)',
        'Comments (mock)',
        'Shares (mock)',
        'Impressions (mock)',
        'Reach (mock)',
      ],
      ...rows.map(({ post, metrics }) => [
        post.content,
        post.status,
        post.platforms.join(', '),
        post.scheduledAt,
        ...(
          [
            'followers',
            'engagement',
            'likes',
            'comments',
            'shares',
            'impressions',
            'reach',
          ] as const
        ).map((key) => (metrics ? String(metrics[key]) : '')),
      ]),
    ]
      .map((row) => row.map(quote).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'postflow-mock-analytics.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div
      className={cn(
        cn('analytics-page max-w-[1280px] pb-[24px] text-foreground', analyticsPageStyles),
      )}
    >
      <header
        className={cn(
          cn(
            'analytics-heading flex justify-between items-center gap-[18px]',
            analyticsHeadingStyles,
          ),
        )}
      >
        <div>
          <div
            className={cn(
              cn(
                'analytics-heading-title flex items-center gap-[12px]',
                analyticsHeadingTitleStyles,
              ),
            )}
          >
            <h1 className={cn(cn('app-h1', appH1Styles))}>Analytics</h1>
          </div>
          <p>A closer look at your content’s performance.</p>
        </div>
        <Button
          variant="secondary"
          startIcon={<Download size={16} />}
          onClick={exportReport}
          disabled={loading || !rows.length}
        >
          Export report
        </Button>
      </header>
      <div
        className={cn(cn('analytics-surface bg-surface overflow-hidden', analyticsSurfaceStyles))}
      >
        <div
          className={cn(
            cn(
              'analytics-tabs flex justify-between [border-bottom:1px_solid_var(--analytics-border)]',
              analyticsTabsStyles,
            ),
          )}
        >
          <SegmentedControl<Tab>
            label="Analytics sections"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'performance', label: 'Post performance' },
              { value: 'platforms', label: 'Platforms' },
            ]}
          />
          <span
            className={cn(
              cn(
                'analytics-demo-label flex items-center gap-[6px] text-muted text-[9px] whitespace-nowrap',
                analyticsDemoLabelStyles,
              ),
            )}
          >
            <i /> Mock analytics
          </span>
        </div>
        <div className={cn(cn('analytics-section-heading', analyticsSectionHeadingStyles))}>
          <h2>
            {tab === 'performance'
              ? 'Detailed post performance'
              : tab === 'overview'
                ? 'Performance overview'
                : 'Platform breakdown'}
          </h2>
          <p>
            {tab === 'performance'
              ? 'Compare your posts over time. Open Details to explore each post’s performance.'
              : tab === 'overview'
                ? 'Track your published posts across every channel in one view.'
                : 'See how your posts are distributed across your social channels.'}
          </p>
        </div>
        <div
          className={cn(
            cn('analytics-filter-row flex justify-between gap-[14px]', analyticsFilterRowStyles),
          )}
        >
          <Select
            label="Analytics date range"
            value={period}
            onChange={setPeriod}
            options={[
              { value: 0, label: 'All time' },
              { value: 7, label: 'Last 7 days' },
              { value: 30, label: 'Last 30 days' },
            ]}
          />
          <PostFilters {...filters} />
        </div>
        <div
          className={cn(
            cn('analytics-data-note text-[9px] text-muted leading-[1.6]', analyticsDataNoteStyles),
          )}
        >
          Illustrative metrics for published posts only. Scheduled and failed posts show —. No
          social platform data is connected.
        </div>
        {loading ? (
          <div
            className={cn(
              cn('skeletons grid gap-[14px] mt-[25px] p-[0_23px_23px]', skeletonsStyles),
            )}
            role="status"
            aria-label="Loading analytics"
          >
            {[1, 2, 3].map((value) => (
              <div key={value} />
            ))}
          </div>
        ) : tab === 'performance' ? (
          <>
            <div
              className={cn(
                cn('analytics-table-tools flex items-center', analyticsTableToolsStyles),
              )}
            >
              <span>
                {rows.length} posts · {published} with mock performance
              </span>
              <Select
                label="Sort analytics"
                size="sm"
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'recent', label: 'Most recent' },
                  { value: 'engagement', label: 'Top engagement' },
                  { value: 'impressions', label: 'Most impressions' },
                ]}
              />
              <div
                className={cn(
                  cn('heatmap-legend items-center text-[9px] text-muted', heatmapLegendStyles),
                )}
              >
                <span>Low</span>
                <div>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <i
                      key={level}
                      className={cn(
                        cn(
                          `heatmap-value flex items-center justify-center text-[11px] [font-variant-numeric:tabular-nums] heat-${level}`,
                          heatmapValueStyles,
                        ),
                      )}
                    />
                  ))}
                </div>
                <span>High</span>
              </div>
            </div>
            <DataTable
              caption="Post performance, illustrative mock metrics"
              rows={pagedRows}
              columns={performanceColumns}
              rowKey={(row) => row.post.id}
              empty={
                <>
                  <h3>No posts match</h3>
                  <p>Adjust the filters or select a wider date range.</p>
                </>
              }
            />
            {rows.length > perfPageSize && (
              <Pagination
                total={rows.length}
                page={perfPage}
                pageSize={perfPageSize}
                onPageChange={setPerfPage}
                onPageSizeChange={setPerfPageSize}
              />
            )}
          </>
        ) : tab === 'overview' ? (
          <>
            <div className={cn(cn('analytics-metrics grid', analyticsMetricsStyles))}>
              <MetricCard
                label="Impressions"
                value={compactNumber(totals.impressions)}
                hint={`${published} published posts · mock`}
                icon={<Eye size={16} />}
              />
              <MetricCard
                label="Engagement rate"
                value={`${totals.engagement}%`}
                hint="Interactions ÷ impressions · mock"
                icon={<Activity size={16} />}
              />
              <MetricCard
                label="Likes"
                value={compactNumber(totals.likes)}
                hint="Across published posts · mock"
                icon={<Heart size={16} />}
              />
              <MetricCard
                label="Reach"
                value={compactNumber(totals.reach)}
                hint="Sum of post reach, not unique people"
                icon={<TrendingUp size={16} />}
              />
            </div>
            {published > 0 ? (
              <div className={cn(cn('analytics-overview-chart', analyticsOverviewChartStyles))}>
                <SegmentedControl<Metric>
                  label="Overview chart metric"
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { value: 'impressions', label: 'Impressions' },
                    { value: 'reach', label: 'Reach' },
                    { value: 'likes', label: 'Likes' },
                  ]}
                />
                <MetricChart
                  title={`${metric[0].toUpperCase() + metric.slice(1)} over 7 sample intervals`}
                  values={metricSeries(totals[metric])}
                  labels={days}
                />
              </div>
            ) : (
              <div className={cn(cn('empty-state text-center p-[42px_20px]', emptyStateStyles))}>
                <BarChart3 size={30} />
                <h3>No published posts in this selection</h3>
                <p>Change your filters to explore the sample performance data.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <DataTable<{
              platform: Platform;
              count: number;
              published: number;
              scheduled: number;
              failed: number;
            }>
              caption="Post distribution by platform"
              rows={platformRows}
              rowKey={(row) => row.platform}
              columns={[
                {
                  key: 'platform',
                  heading: 'Platform',
                  render: (row) => (
                    <span className={cn('flex items-center gap-[8px]')}>
                      <PlatformIcon platform={row.platform} />
                      {row.platform}
                    </span>
                  ),
                },
                ...(['count', 'published', 'scheduled', 'failed'] as const).map((key) => ({
                  key,
                  heading: key === 'count' ? 'Total posts' : key[0].toUpperCase() + key.slice(1),
                  render: (row: (typeof platformRows)[number]) => row[key],
                })),
              ]}
              empty="No platforms"
            />
            <p
              className={cn(
                cn(
                  'analytics-platform-note text-[10px] text-muted leading-[1.7]',
                  analyticsPlatformNoteStyles,
                ),
              )}
            >
              Multi-platform posts appear under each selected platform. Counts reflect your current
              filters and date range.
            </p>
          </>
        )}
      </div>
      {selected && (
        <Modal title="Post performance" onClose={() => setSelectedId(null)}>
          <p className={cn('text-[12px] leading-[1.8] text-foreground')}>{selected.post.content}</p>
          <div className={cn('flex items-center gap-[6px] m-[15px_0]')}>
            <StatusBadge status={selected.post.status} />
            {selected.post.platforms.map((platform) => (
              <PlatformIcon key={platform} platform={platform} />
            ))}
          </div>
          {selected.metrics ? (
            <>
              <div
                className={cn(
                  cn(
                    'analytics-detail-stats grid [grid-template-columns:1fr_1fr] gap-[10px] m-[20px_0]',
                    analyticsDetailStatsStyles,
                  ),
                )}
              >
                <MetricCard
                  label="Impressions"
                  value={compactNumber(selected.metrics.impressions)}
                  hint="Mock metric"
                  icon={<Eye size={15} />}
                />
                <MetricCard
                  label="Engagement"
                  value={`${selected.metrics.engagement}%`}
                  hint="Mock metric"
                  icon={<Activity size={15} />}
                />
              </div>
              <SegmentedControl<Metric>
                label="Post chart metric"
                value={metric}
                onChange={setMetric}
                options={[
                  { value: 'impressions', label: 'Impressions' },
                  { value: 'reach', label: 'Reach' },
                  { value: 'likes', label: 'Likes' },
                ]}
              />
              <MetricChart
                title={`${metric[0].toUpperCase() + metric.slice(1)} · mock`}
                values={metricSeries(selected.metrics[metric])}
                labels={days}
              />
            </>
          ) : (
            <div className={cn(cn('empty-state text-center p-[42px_20px]', emptyStateStyles))}>
              <BarChart3 size={30} />
              <h3>Performance starts after publishing</h3>
              <p>This post is {selected.post.status}. There are no performance metrics yet.</p>
            </div>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              const post = selected.post;
              setSelectedId(null);
              onOpenPost(post);
            }}
          >
            View post details
          </Button>
        </Modal>
      )}
    </div>
  );
}
