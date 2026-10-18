import { dateKey } from '@/lib/calendar';

const routeParameters: Record<string, readonly string[]> = {
  '/posts': ['q', 'platform', 'status', 'view', 'date'],
  '/analytics': ['q', 'platform', 'status', 'tab', 'period'],
};

/** Retain only query parameters owned by the current page. */
export function scopedQuery(path: string, search: string, today = new Date()): URLSearchParams {
  const route = path.replace(/\/$/, '') || '/';
  const allowed = routeParameters[route] ?? [];
  const defaults: Record<string, string> = { q: '', platform: 'all', status: 'all' };
  if (route === '/posts') Object.assign(defaults, { view: 'month', date: dateKey(today) });
  if (route === '/analytics') Object.assign(defaults, { tab: 'performance', period: '0' });
  const source = new URLSearchParams(search);
  const result = new URLSearchParams();
  for (const key of allowed) {
    const value = source.get(key);
    if (value !== null && value !== '' && value !== defaults[key]) result.set(key, value);
  }
  return result;
}
