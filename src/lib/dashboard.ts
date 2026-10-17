import type { Post } from '@/types';

export function dashboardPosts(posts: Post[], now: number, pending: string[] = []) {
  return {
    upcoming: posts
      .filter(
        (post) =>
          post.status === 'scheduled' &&
          Date.parse(post.scheduledAt) > now &&
          !pending.includes(post.id),
      )
      .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))
      .slice(0, 5),
    failed: posts
      .filter((post) => post.status === 'failed' || pending.includes(post.id))
      .sort((a, b) => Date.parse(b.scheduledAt) - Date.parse(a.scheduledAt)),
  };
}
