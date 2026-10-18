import test from 'node:test';
import assert from 'node:assert/strict';
import { scopedQuery } from '@/lib/routeQuery.ts';

test('posts retain refreshable filters and calendar state only', () => {
  assert.equal(
    scopedQuery(
      '/posts',
      '?q=hello&platform=Instagram&status=failed&view=week&date=2026-10-17&tab=audience&period=7',
    ).toString(),
    'q=hello&platform=Instagram&status=failed&view=week&date=2026-10-17',
  );
});
test('analytics retain their own filters without calendar parameters', () => {
  assert.equal(
    scopedQuery(
      '/analytics/',
      '?platform=X&view=year&date=2026-10-17&tab=overview&period=30',
    ).toString(),
    'platform=X&tab=overview&period=30',
  );
});
test('dashboard and other pages remove stale query parameters', () => {
  for (const path of ['/', '/settings', '/social-accounts', '/compose']) {
    assert.equal(
      scopedQuery(path, '?platform=Instagram&status=failed&view=month&tab=overview').toString(),
      '',
    );
  }
});

test('default filters, calendar view and today are omitted', () => {
  const today = new Date(2026, 9, 18, 12);
  assert.equal(
    scopedQuery(
      '/posts',
      '?q=&platform=all&status=all&view=month&date=2026-10-18',
      today,
    ).toString(),
    '',
  );
  assert.equal(
    scopedQuery('/posts', '?view=week&date=2026-10-19&platform=X', today).toString(),
    'platform=X&view=week&date=2026-10-19',
  );
});
test('analytics defaults are omitted and non-default choices remain', () => {
  assert.equal(
    scopedQuery('/analytics', '?tab=performance&period=0&platform=all&status=all').toString(),
    '',
  );
  assert.equal(
    scopedQuery('/analytics', '?tab=platforms&period=7').toString(),
    'tab=platforms&period=7',
  );
});
