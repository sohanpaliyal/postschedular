import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dailyPerformance,
  mockMetrics,
  sumMetrics,
  heatLevel,
  metricSeries,
  withinPeriod,
} from '../src/lib/analytics.ts';
const post = {
  id: 'test-post',
  content: 'A new beginning',
  status: 'published',
  scheduledAt: '2026-10-16T09:00:00Z',
};
test('mock performance is stable and unavailable before publishing', () => {
  const first = mockMetrics(post);
  assert.deepEqual(first, mockMetrics(post));
  assert.equal(mockMetrics({ ...post, status: 'scheduled' }), null);
  assert.equal(mockMetrics({ ...post, status: 'failed' }), null);
  assert.ok(first.reach <= first.impressions);
  assert.equal(
    first.engagement,
    Math.round(((first.likes + first.comments + first.shares) / first.impressions) * 1000) / 10,
  );
});
test('aggregate engagement uses total interactions divided by total impressions', () => {
  const first = {
    followers: 1,
    likes: 10,
    comments: 0,
    shares: 0,
    impressions: 100,
    reach: 50,
    engagement: 10,
  };
  const second = { ...first, likes: 180, impressions: 900, engagement: 20 };
  const sum = sumMetrics([first, null, second]);
  assert.equal(sum.likes, 190);
  assert.equal(sum.impressions, 1000);
  assert.equal(sum.engagement, 19);
  assert.equal(sumMetrics([]).engagement, 0);
});
test('heatmap levels are normalized and bounded', () => {
  assert.equal(heatLevel(0, 0), 0);
  assert.equal(heatLevel(10, 100), 1);
  assert.equal(heatLevel(100, 100), 5);
  assert.equal(heatLevel(1000, 100), 5);
});
test('sample intervals preserve the selected total', () => {
  for (const total of [0, 1, 17, 12345]) {
    const values = metricSeries(total);
    assert.equal(values.length, 7);
    assert.equal(
      values.reduce((a, b) => a + b, 0),
      total,
    );
    assert.ok(values.every((value) => value >= 0));
  }
});
test('range includes whole local days and excludes future days', () => {
  const now = new Date(2026, 9, 16, 12);
  const at = (day, hour) => ({ ...post, scheduledAt: new Date(2026, 9, day, hour).toISOString() });
  assert.equal(withinPeriod(at(10, 0), 7, now), true);
  assert.equal(withinPeriod(at(9, 23), 7, now), false);
  assert.equal(withinPeriod(at(16, 23), 7, now), true);
  assert.equal(withinPeriod(at(17, 0), 7, now), false);
  assert.equal(withinPeriod(at(17, 0), 0, now), true);
});

test('daily trends use local day boundaries, published posts only, and weighted engagement', () => {
  const now = new Date(2026, 9, 17, 12);
  const first = { ...post, id: 'first', scheduledAt: new Date(2026, 9, 11, 0).toISOString() };
  const second = {
    ...post,
    id: 'second',
    scheduledAt: new Date(2026, 9, 11, 23, 59).toISOString(),
  };
  const ignored = [
    { ...post, id: 'outside', scheduledAt: new Date(2026, 9, 10, 23, 59).toISOString() },
    { ...post, id: 'future', scheduledAt: new Date(2026, 9, 17, 13).toISOString() },
    { ...post, status: 'scheduled', scheduledAt: first.scheduledAt },
  ];
  const result = dailyPerformance([first, second, ...ignored], 7, now);
  const expected = sumMetrics([mockMetrics(first), mockMetrics(second)]);
  assert.equal(result.length, 7);
  assert.equal(result[0].impressions, expected.impressions);
  assert.equal(result[0].engagement, expected.engagement);
  assert.equal(result[0].interactions, expected.likes + expected.comments + expected.shares);
  assert.ok(result.slice(1).every((day) => day.impressions === 0 && day.engagement === 0));
  assert.equal(dailyPerformance([], 30, now).length, 30);
});
