import type { Post } from '../types/post';
export interface PostMetrics { followers: number; likes: number; comments: number; shares: number; impressions: number; reach: number; engagement: number }
export const emptyMetrics: PostMetrics = { followers: 0, likes: 0, comments: 0, shares: 0, impressions: 0, reach: 0, engagement: 0 };
/** Stable fixture metrics, never represented as live platform measurements. */
export function mockMetrics(post: Post): PostMetrics | null {
  if (post.status !== 'published') return null;
  let hash = 2166136261;
  for (const char of post.id + post.content) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const impressions = 1200 + hash % 18000;
  const likes = 30 + hash % 850;
  const comments = 5 + (hash >>> 3) % 160;
  const shares = 3 + (hash >>> 6) % 90;
  return { followers: 5 + (hash >>> 8) % 240, likes, comments, shares, impressions, reach: Math.round(impressions * (.45 + (hash % 40) / 100)), engagement: Math.round((likes + comments + shares) / impressions * 1000) / 10 };
}
export function sumMetrics(entries: (PostMetrics | null)[]): PostMetrics {
  const sum = { ...emptyMetrics };
  for (const metrics of entries) {
    if (!metrics) continue;
    for (const key of ['followers', 'likes', 'comments', 'shares', 'impressions', 'reach'] as const) sum[key] += metrics[key];
  }
  sum.engagement = sum.impressions ? Math.round((sum.likes + sum.comments + sum.shares) / sum.impressions * 1000) / 10 : 0;
  return sum;
}
export function heatLevel(value: number, maximum: number): number { return maximum <= 0 ? 0 : Math.min(5, Math.max(1, Math.ceil(value / maximum * 5))); }
export function withinPeriod(post: Post, days: number, now = new Date()): boolean {
  if (!days) return true;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const time = new Date(post.scheduledAt).getTime();
  return time >= start.getTime() && time < end.getTime();
}
export const compactNumber = (value: number): string => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
/** Seven illustrative observation buckets that sum to the supplied metric. */
export function metricSeries(total: number): number[] {
  const weights = [6, 10, 13, 17, 14, 18, 22];
  const values = weights.map(weight => Math.floor(total * weight / 100));
  values[values.length - 1] += total - values.reduce((sum, value) => sum + value, 0);
  return values;
}
