import fixtures from '../data/posts.json' with { type: 'json' };
import { platforms, limits, type Post } from '../types';
import { storage, type StorageAdapter } from './storage.ts';

export function isPost(value: unknown): value is Post {
  if (!value || typeof value !== 'object') return false;
  const post = value as Partial<Post>;
  return (
    typeof post.id === 'string' &&
    post.id.length > 0 &&
    typeof post.content === 'string' &&
    post.content.trim().length > 0 &&
    Array.isArray(post.platforms) &&
    post.platforms.length > 0 &&
    new Set(post.platforms).size === post.platforms.length &&
    post.platforms.every((platform) => platforms.includes(platform)) &&
    typeof post.scheduledAt === 'string' &&
    /Z$/.test(post.scheduledAt) &&
    Number.isFinite(Date.parse(post.scheduledAt)) &&
    ['scheduled', 'published', 'failed'].includes(post.status ?? '') &&
    (post.mediaUrl === undefined ||
      (typeof post.mediaUrl === 'string' && /^https?:\/\//i.test(post.mediaUrl))) &&
    (post.errorMessage === undefined || typeof post.errorMessage === 'string') &&
    (post.status !== 'failed' ||
      (typeof post.errorMessage === 'string' && post.errorMessage.length > 0))
  );
}

export function seedPosts(now = new Date()): Post[] {
  return fixtures.map((fixture) => {
    const original = new Date(fixture.scheduledAt);
    const date = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + original.getUTCDate() - 17,
        original.getUTCHours(),
        original.getUTCMinutes(),
      ),
    );
    return { ...fixture, scheduledAt: date.toISOString() } as Post;
  });
}

export function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Operation cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}
export function isAbort(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

export interface PostsSnapshot {
  posts: Post[];
  loading: boolean;
  error: string | null;
  pending: string[];
}
interface Options {
  storage?: StorageAdapter;
  random?: () => number;
  wait?: typeof delay;
  now?: () => number;
}

/** Typed mock repository; only settled changes are persisted. Reset invalidates every request. */
export function createPostsStore(options: Options = {}) {
  const disk = options.storage ?? storage;
  const random = options.random ?? Math.random;
  const wait = options.wait ?? delay;
  const now = options.now ?? Date.now;
  let snapshot: PostsSnapshot = { posts: [], loading: true, error: null, pending: [] };
  let generation = 0;
  const requests = new Set<AbortController>();
  const listeners = new Set<() => void>();
  const publish = (update: Partial<PostsSnapshot>) => {
    snapshot = { ...snapshot, ...update };
    listeners.forEach((listener) => listener());
  };
  const persistedPosts = () => snapshot.posts.map((post) => retryOriginals.get(post.id) ?? post);
  const persist = () => disk.set('flintzy-posts', JSON.stringify(persistedPosts()));
  const retryOriginals = new Map<string, Post>();
  const request = (external?: AbortSignal) => {
    const controller = new AbortController();
    requests.add(controller);
    return {
      controller,
      signal: external ? AbortSignal.any([external, controller.signal]) : controller.signal,
      version: generation,
    };
  };
  const active = (operation: ReturnType<typeof request>) =>
    operation.version === generation && !operation.signal.aborted;
  const failOnce = (name: 'load' | 'create') => {
    const key = `flintzy-demo-fail-${name}`;
    if (disk.get(key) !== 'once') return false;
    disk.remove(key);
    return true;
  };
  const cancel = () => {
    generation++;
    requests.forEach((controller) => controller.abort());
    requests.clear();
    const posts = persistedPosts();
    retryOriginals.clear();
    publish({ posts, pending: [], loading: false });
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    cancel,
    async load() {
      const operation = request();
      publish({ loading: true, error: null });
      try {
        await wait(600, operation.signal);
        if (!active(operation)) return;
        if (failOnce('load')) throw new Error('Could not load posts. Please try again.');
        let posts: Post[] = seedPosts(new Date(now()));
        try {
          const saved: unknown = JSON.parse(disk.get('flintzy-posts') ?? 'null');
          if (
            Array.isArray(saved) &&
            saved.every(isPost) &&
            new Set(saved.map((post) => post.id)).size === saved.length
          )
            posts = saved;
        } catch {
          /* Invalid JSON recovers to the fixture data. */
        }
        publish({ posts, loading: false, error: null });
        persist();
      } catch (error) {
        if (active(operation) && !isAbort(error))
          publish({ loading: false, error: 'Could not load posts. Please try again.' });
      } finally {
        requests.delete(operation.controller);
      }
    },
    async create(post: Post, signal: AbortSignal) {
      const operation = request(signal);
      try {
        if (
          !isPost(post) ||
          post.status !== 'scheduled' ||
          post.platforms.some((platform) => Array.from(post.content).length > limits[platform])
        )
          throw new Error('Check your content and selected platforms.');
        await wait(500, operation.signal);
        if (!active(operation)) throw new DOMException('Operation cancelled', 'AbortError');
        if (Date.parse(post.scheduledAt) <= now())
          throw new Error('Scheduled time must still be in the future.');
        if (failOnce('create'))
          throw new Error('Could not schedule your post. Your draft is kept. Please try again.');
        publish({ posts: [...snapshot.posts, post] });
        persist();
      } finally {
        requests.delete(operation.controller);
      }
    },
    async retry(post: Post): Promise<'success' | 'failed' | 'cancelled'> {
      if (
        snapshot.pending.includes(post.id) ||
        !snapshot.posts.some((item) => item.id === post.id && item.status === 'failed')
      )
        return 'cancelled';
      const operation = request();
      retryOriginals.set(post.id, post);
      publish({
        pending: [...snapshot.pending, post.id],
        posts: snapshot.posts.map((item) =>
          item.id === post.id
            ? {
                ...item,
                status: 'scheduled',
                scheduledAt: new Date(
                  Math.max(Date.parse(item.scheduledAt), now() + 3600000),
                ).toISOString(),
                errorMessage: undefined,
              }
            : item,
        ),
      });
      try {
        await wait(1000, operation.signal);
        if (!active(operation)) return 'cancelled';
        const failed = random() < 0.2;
        retryOriginals.delete(post.id);
        publish({
          pending: snapshot.pending.filter((id) => id !== post.id),
          posts: failed
            ? snapshot.posts.map((item) =>
                item.id === post.id
                  ? { ...post, errorMessage: 'Could not reach the platform. Please try again.' }
                  : item,
              )
            : snapshot.posts,
        });
        persist();
        return failed ? 'failed' : 'success';
      } catch (error) {
        if (!active(operation) || isAbort(error)) return 'cancelled';
        retryOriginals.delete(post.id);
        publish({
          pending: snapshot.pending.filter((id) => id !== post.id),
          posts: snapshot.posts.map((item) => (item.id === post.id ? post : item)),
        });
        persist();
        return 'failed';
      } finally {
        requests.delete(operation.controller);
      }
    },
    reset() {
      cancel();
      publish({ posts: seedPosts(new Date(now())), loading: false, error: null });
      persist();
    },
  };
}
