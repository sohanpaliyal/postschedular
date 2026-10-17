/**
 * Convert a JS Date to the local datetime string used only inside the
 * DateTimePicker UI (format: "YYYY-MM-DDTHH:MM", no timezone suffix).
 */
export function toLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Convert a local datetime string (from the picker UI) to a UTC ISO-8601
 * string for storage.  `new Date(localStr)` is parsed as local time by all
 * modern engines when the string has no "Z" / offset suffix.
 */
export function localToUtcIso(localDateTimeStr: string): string {
  return new Date(localDateTimeStr).toISOString();
}

/**
 * Convert a UTC ISO-8601 string (as stored in Post.scheduledAt) back to a
 * local datetime string for the picker UI.
 */
export function utcIsoToLocal(utcIso: string): string {
  return toLocalDateTime(new Date(utcIso));
}

export function calendarDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = first.getDay(); // Sunday = 0, so no adjustment needed
  return Array.from(
    { length: 42 },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + i),
  );
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Returns true only when `value` represents a moment strictly in the future.
 * Accepts both UTC ISO strings (Post.scheduledAt) and local datetime strings
 * (DateTimePicker internal state) — both parse correctly with `new Date()`.
 */
export function isFuture(value: string, now = Date.now()): boolean {
  if (!value) return false;
  const t = new Date(value).getTime();
  return Number.isFinite(t) && t > now;
}
