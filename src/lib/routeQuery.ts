const routeParameters: Record<string, readonly string[]> = {
  '/posts': ['q', 'platform', 'status', 'view', 'date'],
  '/analytics': ['q', 'platform', 'status', 'tab', 'period'],
};

/** Retain only query parameters owned by the current page. */
export function scopedQuery(path: string, search: string): URLSearchParams {
  const allowed = routeParameters[path.replace(/\/$/, '') || '/'] ?? [];
  const source = new URLSearchParams(search);
  const result = new URLSearchParams();
  for (const key of allowed) {
    const value = source.get(key);
    if (value !== null) result.set(key, value);
  }
  return result;
}
