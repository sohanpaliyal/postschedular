import { cn } from '../ui/cn';
import { useTimeFormatter } from '../state/preferences';
import { useEffect, useLayoutEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
} from 'lucide-react';
import { Button } from './Button';
import { Select } from './Select';
import { calendarDays, isFuture, localToUtcIso, sameDay, toLocalDateTime } from './dateTime';

/**
 * `value`  — a UTC ISO-8601 string (e.g. "2026-10-17T03:30:00.000Z") or "".
 * `onChange` — called with a UTC ISO-8601 string (or "" when cleared).
 *
 * All calendar / time UI operates in the user's local timezone.
 * The conversion local → UTC happens before calling onChange; UTC → local
 * happens when reading `value` for display.
 */
type DateTimePickerProps = { id: string; value: string; onChange: (value: string) => void };
const months = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleDateString(undefined, { month: 'long' }),
);
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DateTimePicker({ id, value, onChange }: DateTimePickerProps) {
  const formatTime = useTimeFormatter();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date());
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Parse the incoming UTC ISO string into local time for display/editing.
  const selected = value ? new Date(value) : null;
  const valid = isFuture(value);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ');
  const hours = selected?.getHours() ?? 9;
  const minutes = selected?.getMinutes() ?? 0;
  const years = Array.from({ length: 11 }, (_, i) => today.getFullYear() + i);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const node = panel.current;
    if (!node) return;
    node.showPopover();
    function place() {
      const anchor = trigger.current?.getBoundingClientRect();
      if (!anchor || !node) return;
      const viewport = window.visualViewport;
      const leftEdge = viewport?.offsetLeft ?? 0;
      const topEdge = viewport?.offsetTop ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const margin = 12;
      const gap = 8;
      const width = Math.min(anchor.width, 420, viewportWidth - margin * 2);
      node.style.width = `${width}px`;
      const desiredHeight = node.scrollHeight + 2;
      const below = Math.max(0, topEdge + viewportHeight - anchor.bottom - margin - gap);
      const above = Math.max(0, anchor.top - topEdge - margin - gap);
      const placeAbove = below < desiredHeight && above > below;
      const available = placeAbove ? above : below;
      const height = Math.min(desiredHeight, Math.max(available, 0));
      node.style.maxHeight = `${height}px`;
      node.style.left = `${Math.max(leftEdge + margin, Math.min(anchor.left, leftEdge + viewportWidth - width - margin))}px`;
      node.style.top = `${placeAbove ? anchor.top - gap - height : anchor.bottom + gap}px`;
    }
    place();
    const observer = new ResizeObserver(place);
    observer.observe(node);
    if (trigger.current) observer.observe(trigger.current);
    const scroll = (event: Event) => {
      if (!node.contains(event.target as Node)) place();
    };
    document.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', place);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      observer.disconnect();
      node.hidePopover();
      document.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [open]);

  /** Emit UTC ISO from a local Date. */
  function emit(localDate: Date) {
    onChange(localToUtcIso(toLocalDateTime(localDate)));
  }

  function chooseDay(day: Date, now: number) {
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
    // When the user first taps "today", advance to +1 hour so the time is
    // always in the future on first selection.
    if (!selected && sameDay(day, today)) {
      const later = new Date(now + 60 * 60 * 1000);
      next.setTime(later.getTime());
    }
    // If the user picks today with the current time already in the past,
    // bump forward to +1 hour from now.
    if (sameDay(day, today) && next.getTime() <= now) {
      next.setTime(now + 60 * 60 * 1000);
    }
    emit(next);
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  function changeTime(hour: number, minute: number) {
    const next = selected
      ? new Date(selected)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate());
    next.setHours(hour, minute, 0, 0);
    emit(next);
  }

  function quickPick(kind: 'hour' | 'tomorrow' | 'week') {
    const next = new Date();
    if (kind === 'hour') next.setTime(next.getTime() + 60 * 60 * 1000);
    else {
      next.setDate(next.getDate() + (kind === 'tomorrow' ? 1 : 7));
      next.setHours(9, 0, 0, 0);
    }
    emit(next);
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  function dayKey(e: KeyboardEvent<HTMLButtonElement>, day: Date) {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (!(e.key in deltas)) return;
    e.preventDefault();
    const next = new Date(day);
    next.setDate(next.getDate() + deltas[e.key]);
    if (next < midnight) return;
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${toLocalDateTime(next).slice(0, 10)}"]`)
        ?.focus(),
    );
  }
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div
      className={cn('date-picker')}
      ref={root}
      onKeyDown={(e) => {
        if (open && e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
      }}
    >
      <Button
        ref={trigger}
        id={id}
        variant="unstyled"
        className={cn(
          `date-picker-trigger flex items-center gap-[12px] w-full min-h-[52px] p-[10px_13px] text-left ${open ? 'is-open' : ''}`,
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={`${panelId}-zone`}
        onClick={() => {
          if (!open) {
            const date = selected || new Date();
            setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
          }
          setOpen((v) => !v);
        }}
      >
        <span
          className={cn(
            'date-picker-trigger-icon w-[30px] h-[30px] rounded-[8px] grid place-items-center shrink-[0]',
          )}
        >
          <CalendarDays size={18} />
        </span>
        <span
          className={cn(
            `date-picker-value flex-1 flex gap-[8px] items-center flex-wrap ${value ? '' : 'placeholder'}`,
          )}
        >
          {selected ? (
            <>
              <strong>
                {selected.toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
              <span>{formatTime(selected)}</span>
            </>
          ) : (
            'Choose a date and time'
          )}{' '}
        </span>
        <ChevronDown size={16} className={cn(open ? 'turned' : '')} />
      </Button>
      {open && (
        <div
          id={panelId}
          ref={panel}
          popover="manual"
          className={cn(
            'date-picker-panel fixed [inset:auto] m-[0] overflow-y-auto [overscroll-behavior:contain] [box-shadow:0_6px_22px_#29332108]',
          )}
          role="group"
          aria-label="Choose schedule date and time"
        >
          <div className={cn('date-picker-quick flex flex-wrap')}>
            <Button variant="soft" size="sm" onClick={() => quickPick('hour')}>
              In 1 hour
            </Button>
            <Button variant="soft" size="sm" onClick={() => quickPick('tomorrow')}>
              Tomorrow, 9 AM
            </Button>
            <Button variant="soft" size="sm" onClick={() => quickPick('week')}>
              Next week
            </Button>
          </div>
          <div className={cn('flex items-center justify-between gap-[10px] p-[13px_0_9px]')}>
            <div className={cn('date-picker-month')}>
              <Select
                label="Calendar month"
                size="sm"
                variant="ghost"
                searchable
                value={month.getMonth()}
                onChange={(value) => setMonth(new Date(month.getFullYear(), value, 1))}
                options={months.map((label, value) => ({ label, value }))}
              />
              <Select
                label="Calendar year"
                size="sm"
                variant="ghost"
                value={month.getFullYear()}
                onChange={(value) => setMonth(new Date(value, month.getMonth(), 1))}
                options={years.map((value) => ({ label: String(value), value }))}
              />
            </div>
            <div className={cn('date-picker-navigation')}>
              <Button
                variant="icon"
                size="sm"
                aria-label="Previous month"
                disabled={
                  month.getFullYear() === today.getFullYear() &&
                  month.getMonth() <= today.getMonth()
                }
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="icon"
                size="sm"
                aria-label="Next month"
                disabled={month.getFullYear() >= years.at(-1)! && month.getMonth() === 11}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          <div
            className={cn('grid [grid-template-columns:repeat(7,_minmax(0,_1fr))] gap-[4px]')}
            aria-label={month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          >
            {weekdays.map((day) => (
              <span className={cn('text-[9px] text-center [color:#a1a695] p-[8px_0]')} key={day}>
                {day}
              </span>
            ))}
            {calendarDays(month).map((day) => {
              const chosen = !!selected && sameDay(day, selected);
              const outside = day.getMonth() !== month.getMonth();
              const past = day < midnight;
              const isToday = sameDay(day, today);
              const key = toLocalDateTime(day).slice(0, 10);
              return (
                <Button
                  variant="unstyled"
                  key={key}
                  data-day={key}
                  className={cn(
                    `date-picker-day grid place-items-center p-[0] ${chosen ? 'chosen' : ''} ${outside ? 'outside' : ''} ${isToday ? 'today' : ''}`,
                  )}
                  disabled={past || day.getFullYear() > years.at(-1)!}
                  aria-label={day.toLocaleDateString(undefined, { dateStyle: 'full' })}
                  aria-pressed={chosen}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => chooseDay(day, Date.now())}
                  onKeyDown={(e) => dayKey(e, day)}
                >
                  {day.getDate()}
                </Button>
              );
            })}
          </div>
          <div className={cn('date-picker-time justify-between p-[14px_0] mt-[12px]')}>
            <span>
              <Clock3 size={15} /> Time
            </span>
            <div className={cn('date-picker-time-controls flex items-center gap-[5px]')}>
              <Select
                label="Schedule hour"
                size="sm"
                value={hours % 12 || 12}
                onChange={(value) => changeTime((value % 12) + (hours >= 12 ? 12 : 0), minutes)}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: String(i + 1).padStart(2, '0'),
                }))}
              />
              <b>:</b>
              <Select
                label="Schedule minute"
                size="sm"
                searchable
                value={minutes}
                onChange={(value) => changeTime(hours, value)}
                options={Array.from({ length: 60 }, (_, value) => ({
                  value,
                  label: String(value).padStart(2, '0'),
                }))}
              />
              <Select
                label="AM or PM"
                size="sm"
                value={hours >= 12 ? 'PM' : 'AM'}
                onChange={(value) => changeTime((hours % 12) + (value === 'PM' ? 12 : 0), minutes)}
                options={[
                  { value: 'AM', label: 'AM' },
                  { value: 'PM', label: 'PM' },
                ]}
              />
            </div>
          </div>
          {value && !valid && (
            <p className={cn('[color:#b27360] text-[10px] m-[0_0_12px]')} role="alert">
              Scheduled time must be in the future.
            </p>
          )}
          <div className={cn('date-picker-footer flex justify-between items-center pt-[11px]')}>
            <Button variant="text" size="sm" disabled={!value} onClick={() => onChange('')}>
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!valid}
              startIcon={<Check size={14} />}
              onClick={close}
            >
              Done
            </Button>
          </div>
        </div>
      )}
      <p
        className={cn(
          'date-picker-zone flex items-center gap-[5px] text-[10px] m-[10px_0_0] flex-wrap',
        )}
        id={`${panelId}-zone`}
      >
        <Globe2 size={12} />
        {timeZone}
        <span>· Stored in UTC</span>
      </p>
    </div>
  );
}
