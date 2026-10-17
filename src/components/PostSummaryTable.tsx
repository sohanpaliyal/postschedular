import { cn } from '../ui/cn';
import { RotateCcw } from 'lucide-react';
import { DataTable, type TableColumn } from './DataTable';
import { Button } from './Button';
import { PlatformIcon, StatusBadge } from './PostIndicators';
import type { Post } from '../types/post';
import { useTimeFormatter } from '../state/preferences';
export function PostSummaryTable({
  posts,
  pending,
  onSelect,
  onRetry,
  caption,
  emptyTitle,
  emptyDescription,
  compact = false,
}: {
  posts: Post[];
  pending: string[];
  onSelect: (post: Post) => void;
  onRetry: (post: Post) => void;
  caption: string;
  emptyTitle: string;
  emptyDescription: string;
  compact?: boolean;
}) {
  const formatTime = useTimeFormatter();
  const columns: TableColumn<Post>[] = [
    {
      key: 'content',
      heading: 'Post',
      className: cn('w-[40%]'),
      render: (post) => (
        <div>
          <Button
            variant="unstyled"
            className={cn(
              '[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden text-left leading-[1.8] text-foreground text-[12px]',
            )}
            onClick={() => onSelect(post)}
          >
            {post.content}
          </Button>
          {compact && (
            <time dateTime={post.scheduledAt} className="mt-[6px] block text-[10px] text-muted">
              {new Date(post.scheduledAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}{' '}
              · {formatTime(new Date(post.scheduledAt))}
            </time>
          )}
        </div>
      ),
    },
    {
      key: 'platforms',
      heading: 'Platforms',
      render: (post) => (
        <div className={cn('flex gap-[6px]')}>
          {post.platforms.map((platform) => (
            <PlatformIcon key={platform} platform={platform} />
          ))}
        </div>
      ),
    },
    {
      key: 'scheduled',
      heading: 'Scheduled for',
      render: (post) => (
        <div
          className={cn(
            '[&_small]:block [&_small]:text-muted [&_small]:mt-[5px] whitespace-nowrap text-[12px]',
          )}
        >
          {new Date(post.scheduledAt).toLocaleDateString([], {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
          <small>{formatTime(new Date(post.scheduledAt))}</small>
        </div>
      ),
    },
    {
      key: 'status',
      heading: 'Status',
      render: (post) => (
        <>
          <StatusBadge status={post.status} pending={pending.includes(post.id)} />
          {post.status === 'failed' && post.errorMessage && (
            <small className={cn('block max-w-[200px] mt-[8px] text-muted leading-[1.6]')}>
              {post.errorMessage}
            </small>
          )}
        </>
      ),
    },
    {
      key: 'action',
      heading: 'Action',
      render: (post) =>
        post.status === 'failed' || pending.includes(post.id) ? (
          <Button
            variant="text"
            startIcon={<RotateCcw size={14} />}
            loading={pending.includes(post.id)}
            loadingText="Retrying…"
            onClick={() => onRetry(post)}
          >
            Retry
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => onSelect(post)}>
            Details
          </Button>
        ),
    },
  ];
  return (
    <div
      className={cn(
        '[&_.data-table]:w-full [&_.button]:text-[12px] mt-[24px]',
        compact
          ? '[&_.data-table]:min-w-[440px] [&_.data-table_th]:p-[14px_8px] [&_.data-table_td]:p-[14px_8px]'
          : '[&_.data-table]:min-w-[720px] [&_.data-table_th]:p-[16px_12px] [&_.data-table_td]:p-[16px_12px]',
      )}
    >
      <DataTable
        caption={caption}
        columns={compact ? columns.filter((column) => column.key !== 'scheduled') : columns}
        rows={posts}
        rowKey={(post) => post.id}
        empty={
          <>
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
          </>
        }
      />
    </div>
  );
}
