import type { Post } from '../types/post';
export type CalendarView = 'week' | 'month' | 'year' | 'list';
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseCalendarDate(value: string | null): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(value + 'T12:00:00');
    if (
      !Number.isNaN(date.getTime()) &&
      dateKey(date) === value &&
      date.getFullYear() >= 1900 &&
      date.getFullYear() <= 2200
    )
      return date;
  }
  return new Date();
}
export function calendarRange(date: Date, view: 'week' | 'month'): Date[] {
  const first =
    view === 'month'
      ? new Date(date.getFullYear(), date.getMonth(), 1)
      : new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const length =
    view === 'week'
      ? 7
      : Math.ceil(
          (first.getDay() + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) / 7,
        ) * 7;
  return Array.from(
    { length },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}
export function movePeriod(date: Date, view: CalendarView, direction: number): Date {
  if (view === 'week')
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + direction * 7, 12);
  if (view === 'year') return new Date(date.getFullYear() + direction, date.getMonth(), 1, 12);
  return new Date(date.getFullYear(), date.getMonth() + direction, 1, 12);
}
export function groupPostsByDay(posts: Post[]): Map<string, Post[]> {
  const groups = new Map<string, Post[]>();
  for (const post of [...posts].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))) {
    const key = dateKey(new Date(post.scheduledAt));
    groups.set(key, [...(groups.get(key) || []), post]);
  }
  return groups;
}
export function dayLabel(date: string): string {
  const today = new Date();
  if (date === dateKey(today)) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date === dateKey(tomorrow)) return 'Tomorrow';
  return new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
