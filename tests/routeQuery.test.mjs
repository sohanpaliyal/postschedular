import test from 'node:test';
import assert from 'node:assert/strict';
import { scopedQuery } from '../src/lib/routeQuery.ts';

test('posts retain refreshable filters and calendar state only', () => {
  assert.equal(
    scopedQuery(
      '/posts',
      '?q=hello&platform=Instagram&status=failed&view=month&date=2026-10-17&tab=audience&period=7',
    ).toString(),
    'q=hello&platform=Instagram&status=failed&view=month&date=2026-10-17',
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
