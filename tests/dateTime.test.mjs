import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDays, toLocalDateTime, isFuture, sameDay } from '../src/components/dateTime.ts';

test('calendar starts on Monday and includes leap day', () => {
 const days = calendarDays(new Date(2028, 1, 1));
 assert.equal(days.length, 42);
 assert.equal(days[0].getDay(), 1);
 assert.ok(days.some(d => d.getMonth() === 1 && d.getDate() === 29));
 for (let i = 1; i < days.length; i++) {
  const next = new Date(days[i - 1]); next.setDate(next.getDate() + 1);
  assert.ok(sameDay(days[i], next));
 }
});
test('local values preserve wall-clock time and round-trip to the same UTC instant', () => {
 const date = new Date(2026, 9, 15, 9, 5);
 const value = toLocalDateTime(date);
 assert.equal(value, '2026-10-15T09:05');
 assert.equal(new Date(value).toISOString(), date.toISOString());
});
test('future validation rejects empty, invalid, equal, and past values', () => {
 const now = new Date(2026, 9, 15, 9).getTime();
 assert.equal(isFuture('', now), false);
 assert.equal(isFuture('invalid', now), false);
 assert.equal(isFuture('2026-10-15T09:00', now), false);
 assert.equal(isFuture('2026-10-14T09:00', now), false);
 assert.equal(isFuture('2026-10-15T09:01', now), true);
});
test('calendar handles December to January without UTC day shifts', () => {
 const days = calendarDays(new Date(2026, 11, 1));
 assert.ok(days.some(d => d.getFullYear() === 2027 && d.getMonth() === 0));
 assert.equal(toLocalDateTime(new Date(2027, 0, 1, 0, 0)), '2027-01-01T00:00');
});
