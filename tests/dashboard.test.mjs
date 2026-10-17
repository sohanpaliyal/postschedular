import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardPosts } from '../src/lib/dashboard.ts';

const now = Date.parse('2026-10-17T12:00:00Z');
function post(id, offset, status = 'scheduled') {
  return {
    id,
    content: id,
    platforms: ['X'],
    scheduledAt: new Date(now + offset).toISOString(),
    status,
  };
}

test('dashboard shows only the nearest five future scheduled posts without mutating input', () => {
  const posts = [
    post('later', 7000),
    post('past', -1000),
    post('now', 0),
    post('published', 1000, 'published'),
    ...[6, 5, 4, 3, 2, 1].map((n) => post(`future-${n}`, n * 1000)),
  ];
  const original = posts.map((post) => post.id);
  assert.deepEqual(
    dashboardPosts(posts, now).upcoming.map((post) => post.id),
    ['future-1', 'future-2', 'future-3', 'future-4', 'future-5'],
  );
  assert.deepEqual(
    posts.map((post) => post.id),
    original,
  );
});

test('failed posts remain visible during optimistic retries and disappear only on success', () => {
  const posts = [
    post('old-failure', -1000, 'failed'),
    post('retrying', 1000),
    post('future', 2000),
  ];
  const pending = dashboardPosts(posts, now, ['retrying']);
  assert.deepEqual(
    pending.failed.map((post) => post.id),
    ['retrying', 'old-failure'],
  );
  assert.deepEqual(
    pending.upcoming.map((post) => post.id),
    ['future'],
  );
  const settled = dashboardPosts(posts, now);
  assert.deepEqual(
    settled.failed.map((post) => post.id),
    ['old-failure'],
  );
  assert.deepEqual(
    settled.upcoming.map((post) => post.id),
    ['retrying', 'future'],
  );
});

test('dashboard handles an empty queue', () => {
  assert.deepEqual(dashboardPosts([], now), { upcoming: [], failed: [] });
});
