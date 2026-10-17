import { CalendarDays, Clock3, MoreHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/Button';
import { PlatformIcon, StatusBadge } from '@/components/PostIndicators';
import { dayLabel, groupPostsByDay } from '@/lib';
import { useTimeFormatter } from '@/state';
import type { Post } from '@/types';
import {
  cn,
  dayHeadingStyles,
  emptyStateStyles,
  postBottomStyles,
  postCardRetryingStyles,
  postCardStyles,
  postContentStyles,
  postErrorStyles,
  postGridStyles,
  postImageStyles,
} from '@/ui';
export interface PostListProps {
  posts: Post[];
  pending: string[];
  onSelect: (post: Post) => void;
  onRetry: (post: Post) => void;
  onClear?: () => void;
}
export function PostCard({
  post,
  pending,
  onSelect,
  onRetry,
}: {
  post: Post;
  pending: boolean;
  onSelect: (post: Post) => void;
  onRetry: (post: Post) => void;
}) {
  const formatTime = useTimeFormatter();
  return (
    <article
      className={cn(
        cn(
          `post-card p-[18px_18px_0] ${pending ? cn('post-card--retrying [border-color:#d4dac8] pointer-events-none', postCardRetryingStyles) : ''}`,
          postCardStyles,
        ),
      )}
    >
      <div className={cn('flex items-center justify-between')}>
        <div className={cn('flex gap-[5px]')}>
          {post.platforms.map((platform) => (
            <PlatformIcon key={platform} platform={platform} />
          ))}
        </div>
        <StatusBadge status={post.status} pending={pending} />
      </div>
      <Button
        variant="unstyled"
        className={cn(
          cn(
            'post-content text-[12px] leading-[1.8] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden text-left m-[17px_0_18px] p-[0]',
            postContentStyles,
          ),
        )}
        onClick={() => onSelect(post)}
      >
        {post.content}
      </Button>
      {post.mediaUrl && (
        <img
          className={cn(cn('post-image', postImageStyles))}
          src={post.mediaUrl}
          alt="Post attachment"
          loading="lazy"
        />
      )}
      {post.errorMessage && !pending && (
        <p
          className={cn(
            cn('post-error leading-[1.6] rounded-[7px] p-[9px_11px] mb-[2px]', postErrorStyles),
          )}
          role="alert"
        >
          {post.errorMessage}
        </p>
      )}
      {pending && (
        <p
          className={cn('text-[10px] [color:#7a9268] m-[0_0_6px] flex items-center gap-[5px]')}
          aria-live="polite"
        >
          Sending to the platform…
        </p>
      )}
      <div className={cn(cn('post-bottom justify-between', postBottomStyles))}>
        <span>
          <Clock3 size={14} />
          {formatTime(new Date(post.scheduledAt))}
        </span>
        {post.status === 'failed' ? (
          <Button
            variant="text"
            size="sm"
            loading={pending}
            loadingText="Retrying…"
            disabled={pending}
            onClick={() => onRetry(post)}
            startIcon={pending ? undefined : <RotateCcw size={14} />}
            aria-label={`Retry post: ${post.content.slice(0, 40)}`}
          >
            {pending ? 'Retrying…' : 'Retry'}
          </Button>
        ) : (
          <Button
            variant="icon"
            size="sm"
            aria-label="View post details"
            onClick={() => onSelect(post)}
          >
            <MoreHorizontal size={19} />
          </Button>
        )}
      </div>
    </article>
  );
}
export function PostList({ posts, pending, onSelect, onRetry, onClear }: PostListProps) {
  if (!posts.length)
    return (
      <div className={cn(cn('empty-state text-center p-[42px_20px]', emptyStateStyles))}>
        <CalendarDays size={30} />
        <h3>No posts found</h3>
        <p>Try a different search or make room for something new.</p>
        {onClear && (
          <Button variant="secondary" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
    );
  return (
    <>
      {Array.from(groupPostsByDay(posts), ([day, entries]) => (
        <section className={cn('day-group')} key={day}>
          <div className={cn(cn('day-heading flex items-center gap-[10px]', dayHeadingStyles))}>
            <h3>{dayLabel(day)}</h3>
            <span>{entries.length} posts</span>
            <div />
          </div>
          <div className={cn(cn('post-grid grid gap-[12px]', postGridStyles))}>
            {entries.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                pending={pending.includes(post.id)}
                onSelect={onSelect}
                onRetry={onRetry}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
