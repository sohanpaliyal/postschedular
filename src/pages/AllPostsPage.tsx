import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Plus } from 'lucide-react';
import type { Post } from '../types/post';
import { dateKey, movePeriod, parseCalendarDate, type CalendarView } from '../lib/calendar';
import { Button } from '../components/Button';
import { CalendarToolbar } from '../components/CalendarToolbar';
import { PostCalendar, YearCalendar } from '../components/PostCalendar';
import { PostList, type PostListProps } from '../components/PostList';
import { PostFilters, type PostFiltersProps } from '../components/PostFilters';
import { Modal } from '../components/Modal';
import './AllPostsPage.css';
function readView(): CalendarView { const view = new URLSearchParams(location.search).get('view'); return view === 'list' || view === 'week' || view === 'year' ? view : 'month'; }
interface AllPostsPageProps extends PostListProps {
  filters: PostFiltersProps;
  loading: boolean;
  onCreate: (date?: Date) => void;
}
export function AllPostsPage({ posts, pending, onSelect, onRetry, onClear, filters, loading, onCreate }: AllPostsPageProps) {
  const [view, setView] = useState<CalendarView>(readView);
  const [date, setDate] = useState(() => parseCalendarDate(new URLSearchParams(location.search).get('date')));
  const [details, setDetails] = useState(false);
  const [day, setDay] = useState<Date | null>(null);
  useEffect(() => { const handler = () => { setView(readView()); setDate(parseCalendarDate(new URLSearchParams(location.search).get('date'))); }; window.addEventListener('popstate', handler); return () => window.removeEventListener('popstate', handler); }, []);
  useEffect(() => { const params = new URLSearchParams(location.search); params.set('view', view); params.set('date', dateKey(date)); history.replaceState(null, '', `${location.pathname}?${params}`); }, [view, date]);
  const dayPosts = day ? posts.filter(post => dateKey(new Date(post.scheduledAt)) === dateKey(day)) : [];
  const monthCount = posts.filter(post => { const time = new Date(post.scheduledAt); return time.getMonth() === date.getMonth() && time.getFullYear() === date.getFullYear(); }).length;
  return <div className="all-posts-page"><section className="all-posts-heading"><div><span className="eyebrow">YOUR PUBLISHING PLAN</span><h1>All posts<span>.</span></h1><p>Your content, all in one place. Make room for what’s next.</p></div><Button startIcon={<Plus size={17}/>} onClick={() => onCreate()}>Create post</Button></section>
    <section className="all-posts-surface" aria-label="All posts planner"><div className="all-posts-filter-row"><div><CalendarDays size={17}/><strong>Content planner</strong><span>{posts.length} posts</span></div><PostFilters {...filters}/></div>
      <CalendarToolbar view={view} date={date} details={details} onView={setView} onDate={setDate} onMove={direction => setDate(current => movePeriod(current, view, direction))} onDetails={() => setDetails(value => !value)}/>
      <div className="calendar-caption"><span aria-live="polite">{view === 'list' ? 'All dates' : view === 'year' ? date.getFullYear() : date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}{view === 'week' && ` · Week of ${new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}</span><span><Clock3 size={12}/>{Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ')}</span></div>
      {loading ? <div className="calendar-loading" role="status" aria-label="Loading posts">{Array.from({ length: 21 }, (_, i) => <div key={i}/>)}</div> : view === 'list' ? <div className="all-posts-list"><PostList posts={posts} pending={pending} onSelect={onSelect} onRetry={onRetry} onClear={onClear}/></div> : view === 'year' ? <YearCalendar date={date} posts={posts} onMonth={next => { setDate(next); setView('month'); }}/> : <PostCalendar date={date} view={view} posts={posts} details={details} onSelect={onSelect} onCreate={onCreate} onDay={selected => setDay(selected)}/>}
      {!loading && view !== 'list' && !posts.length && <div className="calendar-empty-notice" role="status">No posts match your filters. <Button variant="text" size="sm" onClick={onClear}>Clear filters</Button></div>}
      {!loading && view === 'month' && posts.length > 0 && monthCount === 0 && <div className="calendar-empty-notice" role="status">No posts in this month. Choose another month or create a post.</div>}
      <footer className="calendar-legend"><span><i className="calendar-status-dot scheduled"/>Scheduled</span><span><i className="calendar-status-dot published"/>Published</span><span><i className="calendar-status-dot failed"/>Failed</span><small>Dates and times follow your local time zone.</small></footer>
    </section>
    {day && <Modal title={day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} onClose={() => setDay(null)}><PostList posts={dayPosts} pending={pending} onSelect={post => { setDay(null); onSelect(post); }} onRetry={onRetry}/>{dateKey(day) >= dateKey(new Date()) && <Button startIcon={<Plus size={16}/>} onClick={() => { setDay(null); onCreate(day); }}>Create post for this day</Button>}</Modal>}
  </div>;
}
