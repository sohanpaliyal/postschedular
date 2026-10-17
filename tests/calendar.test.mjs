import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calendarRange,
  dateKey,
  groupPostsByDay,
  movePeriod,
  parseCalendarDate,
} from '../src/lib/calendar.ts';

test('month starts Sunday and covers every day plus adjacent dates', () => {
  const days = calendarRange(new Date(2026, 9, 16), 'month');
  assert.equal(days[0].getDay(), 0);
  assert.equal(days.length % 7, 0);
  assert.equal(days.filter((day) => day.getMonth() === 9).length, 31);
  assert.equal(dateKey(days[0]), '2026-09-27');
  assert.equal(dateKey(days.at(-1)), '2026-10-31');
});
test('week crosses a year boundary without losing dates', () => {
  const days = calendarRange(new Date(2027, 0, 1), 'week');
  assert.equal(days.length, 7);
  assert.equal(dateKey(days[0]), '2026-12-27');
  assert.equal(dateKey(days.at(-1)), '2027-01-02');
});
test('month navigation from the 31st does not skip February', () => {
  assert.equal(dateKey(movePeriod(new Date(2028, 0, 31), 'month', 1)), '2028-02-01');
  assert.equal(
    calendarRange(new Date(2028, 1, 1), 'month').filter((day) => day.getMonth() === 1).length,
    29,
  );
  assert.equal(dateKey(movePeriod(new Date(2026, 11, 31), 'month', 1)), '2027-01-01');
});
test('invalid date query values safely fall back', () => {
  assert.equal(dateKey(parseCalendarDate('2026-10-16')), '2026-10-16');
  for (const value of ['2026-02-31', 'invalid', '9999-01-01', null])
    assert.ok(!Number.isNaN(parseCalendarDate(value).getTime()));
  assert.notEqual(dateKey(parseCalendarDate('2026-02-31')), '2026-03-03');
});
test('posts group by local calendar day and sort chronologically without mutating input', () => {
  const posts = [
    { id: 'later', scheduledAt: new Date(2026, 9, 17, 0, 30).toISOString() },
    { id: 'early', scheduledAt: new Date(2026, 9, 16, 23, 45).toISOString() },
    { id: 'first', scheduledAt: new Date(2026, 9, 16, 9, 0).toISOString() },
  ];
  const groups = groupPostsByDay(posts);
  assert.deepEqual(
    groups.get('2026-10-16').map((post) => post.id),
    ['first', 'early'],
  );
  assert.deepEqual(
    groups.get('2026-10-17').map((post) => post.id),
    ['later'],
  );
  assert.deepEqual(
    posts.map((post) => post.id),
    ['later', 'early', 'first'],
  );
});
