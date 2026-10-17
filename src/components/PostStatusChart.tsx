import { DoughnutChart } from '@/components/DoughnutChart';
import type { Post } from '@/types';
export function PostStatusChart({ posts, loading }: { posts: Post[]; loading: boolean }) {
  return (
    <section
      className="min-w-0 rounded-[20px] border border-outline bg-surface p-[24px] max-[760px]:p-[16px]"
      aria-label="Post status overview"
    >
      <h2 className="m-0 text-[16px] font-medium text-foreground">Post status overview</h2>
      <p className="mt-[6px] text-[11px] leading-[1.7] text-muted">
        All posts across your channels.
      </p>
      <div className="mt-[16px]">
        {loading ? (
          <div
            className="mx-auto h-[280px] rounded-[12px] bg-soft motion-safe:animate-pulse"
            role="status"
            aria-label="Loading post statuses"
          />
        ) : (
          <DoughnutChart
            title="Post status distribution"
            segments={[
              {
                label: 'Scheduled',
                value: posts.filter((post) => post.status === 'scheduled').length,
                color: 'var(--analytics-accent)',
              },
              {
                label: 'Published',
                value: posts.filter((post) => post.status === 'published').length,
                color: 'var(--chart-published)',
              },
              {
                label: 'Failed',
                value: posts.filter((post) => post.status === 'failed').length,
                color: 'var(--chart-failed)',
              },
            ]}
          />
        )}
      </div>
    </section>
  );
}
