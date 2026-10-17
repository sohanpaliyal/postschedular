import { pageFooterStyles } from '../ui/layoutStyles';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { Button } from './Button';
import { DashboardTrend } from './DashboardTrend';
import { PostStatusChart } from './PostStatusChart';
import { PostSummaryTable } from './PostSummaryTable';
import { cn } from '../ui/cn';
import { dashboardPosts } from '../lib/dashboard';
import { compactNumber, mockMetrics, sumMetrics } from '../lib/analytics';
import type { Post } from '../types/post';
function DashboardSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[20px] border border-outline bg-surface p-[24px] max-[760px]:p-[16px]">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div>
          <h2 className="m-0 text-[16px] font-medium text-foreground">{title}</h2>
          <p className="mt-[6px] text-[11px] leading-[1.7] text-muted">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function DashboardPanels({
  posts,
  pending,
  loading,
  onSelect,
  onRetry,
  onCreate,
  onNavigate,
}: {
  posts: Post[];
  pending: string[];
  loading: boolean;
  onSelect: (post: Post) => void;
  onRetry: (post: Post) => void;
  onCreate: () => void;
  onNavigate: (path: string) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const { upcoming, failed } = dashboardPosts(posts, now, pending);
  const totals = sumMetrics(posts.map(mockMetrics));
  const published = posts.filter((post) => post.status === 'published').length;
  const tableProps = { pending, onSelect, onRetry };
  const skeleton = (
    <div
      className="mt-[24px] grid gap-[12px] motion-safe:animate-pulse"
      role="status"
      aria-label="Loading posts"
    >
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-[60px] rounded-[10px] bg-soft" />
      ))}
    </div>
  );
  return (
    <div className="mx-auto mb-[24px] mt-[24px] grid w-full max-w-[1280px] gap-[20px] text-foreground">
      <div
        className="overflow-x-auto pb-[2px]"
        role="region"
        aria-label="Dashboard summary; performance metrics are simulated"
        tabIndex={0}
      >
        <dl className="m-0 grid min-w-[910px] grid-cols-7 gap-[12px]">
          {[
            {
              label: 'Scheduled',
              value: String(posts.filter((post) => post.status === 'scheduled').length),
            },
            { label: 'Published', value: String(published) },
            {
              label: 'Needs attention',
              value: String(posts.filter((post) => post.status === 'failed').length),
            },
            { label: 'Impressions', value: compactNumber(totals.impressions), mock: true },
            { label: 'Reach', value: compactNumber(totals.reach), mock: true },
            { label: 'Engagement', value: `${totals.engagement}%`, mock: true },
            {
              label: 'Interactions',
              value: compactNumber(totals.likes + totals.comments + totals.shares),
              mock: true,
            },
          ].map((metric) => (
            <div
              key={metric.label}
              title={metric.mock ? 'Illustrative mock metric' : undefined}
              className="rounded-[14px] border border-outline bg-card p-[16px]"
            >
              <dt className="whitespace-nowrap text-[10px] text-muted">{metric.label}</dt>
              <dd
                className="m-0 mt-[14px] text-[26px] font-medium leading-none"
                aria-busy={loading || undefined}
              >
                {loading ? '—' : metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-stretch gap-[20px] max-[1200px]:grid-cols-1">
        <DashboardTrend posts={posts} now={now} loading={loading} />
        <PostStatusChart posts={posts} loading={loading} />
      </div>
      <div className="grid min-w-0 grid-cols-2 items-stretch gap-[20px] max-[1100px]:grid-cols-1">
        <DashboardSection
          title="Upcoming posts"
          description="Your next five scheduled posts, nearest first."
          action={
            <div className="flex flex-wrap items-center gap-[8px]">
              <Button variant="text" onClick={() => onNavigate('/analytics')}>
                View analytics
              </Button>
              <Button
                variant="secondary"
                endIcon={<ArrowUpRight size={14} />}
                onClick={() => onNavigate('/posts')}
              >
                View all posts
              </Button>
            </div>
          }
        >
          {loading ? (
            skeleton
          ) : (
            <PostSummaryTable
              {...tableProps}
              compact
              posts={upcoming}
              caption="Next five upcoming posts"
              emptyTitle="Your schedule is clear"
              emptyDescription="Create a post to start planning what’s next."
            />
          )}
          {!loading && upcoming.length === 0 && (
            <Button startIcon={<Plus size={15} />} onClick={onCreate}>
              Create post
            </Button>
          )}
        </DashboardSection>
        <DashboardSection
          title={`Needs attention${loading ? '' : ` · ${failed.length}`}`}
          description="Failed posts stay here until a retry succeeds. Your original content is kept."
        >
          {loading ? (
            skeleton
          ) : (
            <PostSummaryTable
              {...tableProps}
              compact
              posts={failed}
              caption="Failed posts requiring attention"
              emptyTitle="All caught up"
              emptyDescription="There are no failed posts to retry."
            />
          )}
        </DashboardSection>
      </div>
      <footer
        className={cn(
          cn('page-footer flex flex-wrap justify-between gap-[10px] pt-[12px]', pageFooterStyles),
        )}
      >
        A calmer way to stay connected.<span>Flintzy © {new Date(now).getFullYear()}</span>
      </footer>
    </div>
  );
}
