import { cn } from '../ui/cn';
import { useTimeFormatter } from '../state/preferences';
import { Plus } from 'lucide-react';
import type { Post } from '../types/post';
import { calendarRange, dateKey, groupPostsByDay } from '../lib/calendar';
import { Button } from './Button';
import { PlatformIcon, StatusBadge } from './PostIndicators';
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function CalendarPost({
  post,
  details,
  onSelect,
}: {
  post: Post;
  details: boolean;
  onSelect: (post: Post) => void;
}) {
  const formatTime = useTimeFormatter();
  return (
    <Button
      variant="unstyled"
      className={cn(
        `calendar-post [color:var(--planner-text)] text-left ${details ? 'with-details' : ''}`,
      )}
      onClick={() => onSelect(post)}
      aria-label={`${post.content}, ${post.status}, ${formatTime(new Date(post.scheduledAt))}`}
    >
      {details && (
        <span className={cn('text-[8px] [color:var(--planner-muted)]')}>
          {formatTime(new Date(post.scheduledAt))}
        </span>
      )}
      <span className={cn('flex items-center gap-[5px] min-w-[0]')}>
        <i
          className={cn(
            `calendar-status-dot [display:inline-block] shrink-[0] w-[6px] h-[6px] rounded-full ${post.status}`,
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'calendar-post-title overflow-hidden whitespace-nowrap text-ellipsis leading-[1.5] flex-1',
          )}
        >
          {post.content}
        </span>
        {!details && (
          <span className={cn('calendar-post-platform flex items-center gap-[3px]')}>
            <PlatformIcon platform={post.platforms[0]} />
            {post.platforms.length > 1 && <small>+{post.platforms.length - 1}</small>}
          </span>
        )}
      </span>
      {details && (
        <span
          className={cn('calendar-post-meta flex items-center justify-between gap-[4px] flex-wrap')}
        >
          <StatusBadge status={post.status} />
          <span className={cn('flex gap-[5px]')}>
            {post.platforms.map((platform) => (
              <PlatformIcon key={platform} platform={platform} />
            ))}
          </span>
        </span>
      )}
    </Button>
  );
}
export function PostCalendar({
  date,
  view,
  posts,
  details,
  onSelect,
  onCreate,
  onDay,
}: {
  date: Date;
  view: 'week' | 'month';
  posts: Post[];
  details: boolean;
  onSelect: (post: Post) => void;
  onCreate: (day: Date) => void;
  onDay: (day: Date, posts: Post[]) => void;
}) {
  const groups = groupPostsByDay(posts);
  const today = new Date();
  const todayKey = dateKey(today);
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = calendarRange(date, view);
  return (
    <div
      className={cn(
        '[overflow-x:auto] [scrollbar-width:thin] [scrollbar-color:#bac5ab_transparent]',
      )}
      tabIndex={0}
      role="region"
      aria-label={`${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} ${view} calendar`}
    >
      <div
        className={cn(
          `post-calendar grid [grid-template-columns:repeat(7,_minmax(0,_1fr))] min-w-[760px] [border-top:1px_solid_var(--planner-border)] ${view}`,
        )}
      >
        {weekdays.map((day) => (
          <div
            className={cn(
              'p-[14px_4px] text-center text-[9px] [text-transform:uppercase] tracking-[0.04em] [color:var(--planner-muted)] [background:var(--planner-card)] [border-bottom:1px_solid_var(--planner-border)]',
            )}
            key={day}
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const key = dateKey(day);
          const entries = groups.get(key) || [];
          const isToday = key === todayKey;
          const outside = view === 'month' && day.getMonth() !== date.getMonth();
          const limit = view === 'week' ? 8 : details ? 2 : 3;
          return (
            <section
              key={key}
              className={cn(
                `calendar-day p-[9px_7px_7px] relative flex flex-col gap-[7px] ${outside ? 'outside' : ''} ${isToday ? 'is-today' : ''}`,
              )}
              aria-label={`${day.toLocaleDateString(undefined, { dateStyle: 'full' })}, ${entries.length} posts`}
            >
              <div
                className={cn('calendar-day-heading flex items-center justify-center min-h-[22px]')}
              >
                <Button
                  variant="unstyled"
                  className={cn('calendar-date p-[4px_6px] rounded-[5px]')}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`View posts on ${day.toLocaleDateString(undefined, { dateStyle: 'full' })}`}
                  onClick={() => onDay(day, entries)}
                >
                  {day.getDate() === 1 || outside
                    ? day.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
                    : String(day.getDate()).padStart(2, '0')}
                </Button>
                {entries.length > 0 && <span>{entries.length}</span>}
              </div>
              <div className={cn('flex flex-col gap-[5px]')}>
                {entries.slice(0, limit).map((post) => (
                  <CalendarPost key={post.id} post={post} details={details} onSelect={onSelect} />
                ))}
                {entries.length > limit && (
                  <Button
                    variant="unstyled"
                    className={cn(
                      'calendar-see-all block [border:1px_solid_var(--planner-border)] rounded-[4px] text-center p-[5px] text-[8px] [color:var(--planner-muted)]',
                    )}
                    onClick={() => onDay(day, entries)}
                  >
                    See all (+{entries.length - limit})
                  </Button>
                )}
              </div>
              {day >= midnight && (
                <Button
                  variant="unstyled"
                  className={cn(
                    'calendar-create flex items-center justify-center gap-[4px] text-[9px] [color:#809264] p-[5px_2px] mt-[auto]',
                  )}
                  startIcon={<Plus size={13} />}
                  onClick={() => onCreate(day)}
                  aria-label={`Create post for ${day.toLocaleDateString()}`}
                >
                  <span>Create post</span>
                </Button>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
export function YearCalendar({
  date,
  posts,
  onMonth,
}: {
  date: Date;
  posts: Post[];
  onMonth: (date: Date) => void;
}) {
  const groups = groupPostsByDay(posts);
  const today = dateKey(new Date());
  return (
    <div className={cn('year-calendar grid')}>
      {Array.from({ length: 12 }, (_, month) => {
        const anchor = new Date(date.getFullYear(), month, 1);
        const days = calendarRange(anchor, 'month');
        return (
          <section
            className={cn(
              'mini-calendar [background:var(--planner-card)] [border:1px_solid_var(--planner-border)] rounded-[12px]',
            )}
            key={month}
          >
            <Button variant="text" onClick={() => onMonth(anchor)}>
              {anchor.toLocaleDateString(undefined, { month: 'long' })}
            </Button>
            <div className={cn('grid [grid-template-columns:repeat(7,_minmax(0,_1fr))] gap-[3px]')}>
              {weekdays.map((day) => (
                <span
                  className={cn('mini-weekday text-center [color:var(--planner-muted)] pb-[8px]')}
                  key={day}
                >
                  {day[0]}
                </span>
              ))}
              {days.map((day) => (
                <Button
                  key={dateKey(day)}
                  variant="unstyled"
                  className={cn(
                    `mini-date grid place-items-center ${day.getMonth() !== month ? 'outside' : ''} ${dateKey(day) === today ? 'is-today' : ''}`,
                  )}
                  aria-label={`${day.toLocaleDateString(undefined, { dateStyle: 'full' })}, ${groups.get(dateKey(day))?.length || 0} posts`}
                  onClick={() => onMonth(day)}
                >
                  {day.getDate()}
                  {groups.has(dateKey(day)) && <i />}
                </Button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
