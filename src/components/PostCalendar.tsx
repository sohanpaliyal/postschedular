import { Plus } from 'lucide-react';
import { Button } from '@/components/Button';
import { PlatformIcon, StatusBadge } from '@/components/PostIndicators';
import { calendarRange, dateKey, groupPostsByDay } from '@/lib';
import { useTimeFormatter } from '@/state';
import type { Post } from '@/types';
import {
  calendarCreateStyles,
  calendarDateStyles,
  calendarDayHeadingStyles,
  calendarDayStyles,
  calendarPostMetaStyles,
  calendarPostPlatformStyles,
  calendarPostStyles,
  calendarPostTitleStyles,
  calendarSeeAllStyles,
  calendarStatusDotStyles,
  cn,
  miniCalendarStyles,
  miniDateStyles,
  miniWeekdayStyles,
  outsideStyles,
  postCalendarStyles,
  yearCalendarStyles,
} from '@/ui';
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
        cn(
          `calendar-post [color:var(--planner-text)] text-left ${details ? 'with-details' : ''}`,
          calendarPostStyles,
        ),
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
            cn(
              `calendar-status-dot [display:inline-block] shrink-[0] w-[6px] h-[6px] rounded-full ${post.status}`,
              calendarStatusDotStyles,
            ),
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            cn(
              'calendar-post-title overflow-hidden whitespace-nowrap text-ellipsis leading-[1.5] flex-1',
              calendarPostTitleStyles,
            ),
          )}
        >
          {post.content}
        </span>
        {!details && (
          <span
            className={cn(
              cn('calendar-post-platform flex items-center gap-[3px]', calendarPostPlatformStyles),
            )}
          >
            <PlatformIcon platform={post.platforms[0]} />
            {post.platforms.length > 1 && <small>+{post.platforms.length - 1}</small>}
          </span>
        )}
      </span>
      {details && (
        <span
          className={cn(
            cn(
              'calendar-post-meta flex items-center justify-between gap-[4px] flex-wrap',
              calendarPostMetaStyles,
            ),
          )}
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
          cn(
            `post-calendar grid [grid-template-columns:repeat(7,_minmax(0,_1fr))] min-w-[760px] [border-top:1px_solid_var(--planner-border)] ${view}`,
            postCalendarStyles,
          ),
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
                cn(
                  `calendar-day p-[9px_7px_7px] relative flex flex-col gap-[7px] ${outside ? cn('outside', outsideStyles) : ''} ${isToday ? 'is-today' : ''}`,
                  calendarDayStyles,
                ),
              )}
              aria-label={`${day.toLocaleDateString(undefined, { dateStyle: 'full' })}, ${entries.length} posts`}
            >
              <div
                className={cn(
                  cn(
                    'calendar-day-heading flex items-center justify-center min-h-[22px]',
                    calendarDayHeadingStyles,
                  ),
                )}
              >
                <Button
                  variant="unstyled"
                  className={cn(cn('calendar-date p-[4px_6px] rounded-[5px]', calendarDateStyles))}
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
                      cn(
                        'calendar-see-all block [border:1px_solid_var(--planner-border)] rounded-[4px] text-center p-[5px] text-[8px] [color:var(--planner-muted)]',
                        calendarSeeAllStyles,
                      ),
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
                    cn(
                      'calendar-create flex items-center justify-center gap-[4px] text-[9px] [color:#809264] p-[5px_2px] mt-[auto]',
                      calendarCreateStyles,
                    ),
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
    <div className={cn(cn('year-calendar grid', yearCalendarStyles))}>
      {Array.from({ length: 12 }, (_, month) => {
        const anchor = new Date(date.getFullYear(), month, 1);
        const days = calendarRange(anchor, 'month');
        return (
          <section
            className={cn(
              cn(
                'mini-calendar [background:var(--planner-card)] [border:1px_solid_var(--planner-border)] rounded-[12px]',
                miniCalendarStyles,
              ),
            )}
            key={month}
          >
            <Button variant="text" onClick={() => onMonth(anchor)}>
              {anchor.toLocaleDateString(undefined, { month: 'long' })}
            </Button>
            <div className={cn('grid [grid-template-columns:repeat(7,_minmax(0,_1fr))] gap-[3px]')}>
              {weekdays.map((day) => (
                <span
                  className={cn(
                    cn(
                      'mini-weekday text-center [color:var(--planner-muted)] pb-[8px]',
                      miniWeekdayStyles,
                    ),
                  )}
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
                    cn(
                      `mini-date grid place-items-center ${day.getMonth() !== month ? cn('outside', outsideStyles) : ''} ${dateKey(day) === today ? 'is-today' : ''}`,
                      miniDateStyles,
                    ),
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
