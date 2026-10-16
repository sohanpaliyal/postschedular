import { Plus } from 'lucide-react';
import type { Post } from '../types/post';
import { calendarRange, dateKey, groupPostsByDay } from '../lib/calendar';
import { Button } from './Button';
import { PlatformIcon, StatusBadge } from './PostIndicators';
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function CalendarPost({ post, details, onSelect }: { post: Post; details: boolean; onSelect: (post: Post) => void }) {
  return <Button variant="unstyled" className={`calendar-post ${details ? 'with-details' : ''}`} onClick={() => onSelect(post)} aria-label={`${post.content}, ${post.status}, ${new Date(post.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}>
    {details && <span className="calendar-post-time">{new Date(post.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>}
    <span className="calendar-post-line"><i className={`calendar-status-dot ${post.status}`} aria-hidden="true"/><span className="calendar-post-title">{post.content}</span>{!details && <span className="calendar-post-platform"><PlatformIcon platform={post.platforms[0]}/>{post.platforms.length > 1 && <small>+{post.platforms.length - 1}</small>}</span>}</span>
    {details && <span className="calendar-post-meta"><StatusBadge status={post.status}/><span className="platforms">{post.platforms.map(platform => <PlatformIcon key={platform} platform={platform}/>)}</span></span>}
  </Button>;
}
export function PostCalendar({ date, view, posts, details, onSelect, onCreate, onDay }: { date: Date; view: 'week' | 'month'; posts: Post[]; details: boolean; onSelect: (post: Post) => void; onCreate: (day: Date) => void; onDay: (day: Date, posts: Post[]) => void }) {
  const groups = groupPostsByDay(posts);
  const today = new Date(); const todayKey = dateKey(today);
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = calendarRange(date, view);
  return <div className="calendar-scroll" tabIndex={0} role="region" aria-label={`${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} ${view} calendar`}><div className={`post-calendar ${view}`}>
    {weekdays.map(day => <div className="calendar-weekday" key={day}>{day}</div>)}
    {days.map(day => {
      const key = dateKey(day); const entries = groups.get(key) || []; const isToday = key === todayKey;
      const outside = view === 'month' && day.getMonth() !== date.getMonth();
      const limit = view === 'week' ? 8 : details ? 2 : 3;
      return <section key={key} className={`calendar-day ${outside ? 'outside' : ''} ${isToday ? 'is-today' : ''}`} aria-label={`${day.toLocaleDateString(undefined, { dateStyle: 'full' })}, ${entries.length} posts`}>
        <div className="calendar-day-heading"><Button variant="unstyled" className="calendar-date" aria-current={isToday ? 'date' : undefined} aria-label={`View posts on ${day.toLocaleDateString(undefined, { dateStyle: 'full' })}`} onClick={() => onDay(day, entries)}>{day.getDate() === 1 || outside ? day.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) : String(day.getDate()).padStart(2, '0')}</Button>{entries.length > 0 && <span>{entries.length}</span>}</div>
        <div className="calendar-day-posts">{entries.slice(0, limit).map(post => <CalendarPost key={post.id} post={post} details={details} onSelect={onSelect}/>)}{entries.length > limit && <Button variant="unstyled" className="calendar-see-all" onClick={() => onDay(day, entries)}>See all (+{entries.length - limit})</Button>}</div>
        {day >= midnight && <Button variant="unstyled" className="calendar-create" startIcon={<Plus size={13}/>} onClick={() => onCreate(day)} aria-label={`Create post for ${day.toLocaleDateString()}`}><span>Create post</span></Button>}
      </section>;
    })}
  </div></div>;
}
export function YearCalendar({ date, posts, onMonth }: { date: Date; posts: Post[]; onMonth: (date: Date) => void }) {
  const groups = groupPostsByDay(posts); const today = dateKey(new Date());
  return <div className="year-calendar">{Array.from({ length: 12 }, (_, month) => {
    const anchor = new Date(date.getFullYear(), month, 1); const days = calendarRange(anchor, 'month');
    return <section className="mini-calendar" key={month}><Button variant="text" onClick={() => onMonth(anchor)}>{anchor.toLocaleDateString(undefined, { month: 'long' })}</Button><div className="mini-calendar-grid">{weekdays.map(day => <span className="mini-weekday" key={day}>{day[0]}</span>)}{days.map(day => <Button key={dateKey(day)} variant="unstyled" className={`mini-date ${day.getMonth() !== month ? 'outside' : ''} ${dateKey(day) === today ? 'is-today' : ''}`} aria-label={`${day.toLocaleDateString(undefined, { dateStyle: 'full' })}, ${groups.get(dateKey(day))?.length || 0} posts`} onClick={() => onMonth(day)}>{day.getDate()}{groups.has(dateKey(day)) && <i/>}</Button>)}</div></section>;
  })}</div>;
}
