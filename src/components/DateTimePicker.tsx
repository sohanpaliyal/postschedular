import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Globe2 } from 'lucide-react';
import { Button } from './Button';
import { calendarDays, isFuture, sameDay, toLocalDateTime } from './dateTime';
import './DateTimePicker.css';

type DateTimePickerProps = { id: string; value: string; onChange: (value: string) => void };
const months = Array.from({ length: 12 }, (_, month) => new Date(2026, month, 1).toLocaleDateString(undefined, { month: 'long' }));
const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function DateTimePicker({ id, value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date());
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const selected = value ? new Date(value) : null;
  const valid = isFuture(value);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ');
  const hours = selected?.getHours() ?? 9;
  const minutes = selected?.getMinutes() ?? 0;
  const years = Array.from({ length: 11 }, (_, i) => today.getFullYear() + i);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  function chooseDay(day: Date) {
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
    // An initial Today selection starts one hour ahead rather than at a past default time.
    if (!selected && sameDay(day, today)) {
      const later = new Date(Date.now() + 60 * 60 * 1000);
      next.setTime(later.getTime());
    }
    onChange(toLocalDateTime(next));
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  }
  function changeTime(hour: number, minute: number) {
    const next = selected ? new Date(selected) : new Date(today.getFullYear(), today.getMonth(), today.getDate());
    next.setHours(hour, minute, 0, 0);
    onChange(toLocalDateTime(next));
  }
  function quickPick(kind: 'hour' | 'tomorrow' | 'week') {
    const next = new Date();
    if (kind === 'hour') next.setTime(next.getTime() + 60 * 60 * 1000);
    else { next.setDate(next.getDate() + (kind === 'tomorrow' ? 1 : 7)); next.setHours(9, 0, 0, 0); }
    onChange(toLocalDateTime(next));
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  }
  function dayKey(e: KeyboardEvent<HTMLButtonElement>, day: Date) {
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(e.key in deltas)) return;
    e.preventDefault();
    const next = new Date(day); next.setDate(next.getDate() + deltas[e.key]);
    if (next < midnight) return;
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>(`[data-day="${toLocalDateTime(next).slice(0, 10)}"]`)?.focus());
  }
  function close() { setOpen(false); trigger.current?.focus(); }

  return <div className="date-picker" ref={root} onKeyDown={e => {
    if (open && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  }}>
    <Button ref={trigger} id={id} variant="unstyled" className={`date-picker-trigger ${open ? 'is-open' : ''}`} aria-expanded={open} aria-controls={panelId} aria-describedby={`${panelId}-zone`} onClick={() => {
      if (!open) { const date = selected || new Date(); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }
      setOpen(v => !v);
    }}>
      <span className="date-picker-trigger-icon"><CalendarDays size={18}/></span>
      <span className={`date-picker-value ${value ? '' : 'placeholder'}`}>{selected ? <><strong>{selected.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong><span>{selected.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></> : 'Choose a date and time'} </span>
      <ChevronDown size={16} className={open ? 'turned' : ''}/>
    </Button>
    {open && <div id={panelId} className="date-picker-panel" role="group" aria-label="Choose schedule date and time">
      <div className="date-picker-quick"><Button variant="soft" size="sm" onClick={() => quickPick('hour')}>In 1 hour</Button><Button variant="soft" size="sm" onClick={() => quickPick('tomorrow')}>Tomorrow, 9 AM</Button><Button variant="soft" size="sm" onClick={() => quickPick('week')}>Next week</Button></div>
      <div className="date-picker-calendar-header">
        <div className="date-picker-month"><select aria-label="Calendar month" value={month.getMonth()} onChange={e => setMonth(new Date(month.getFullYear(), Number(e.target.value), 1))}>{months.map((name, i) => <option key={name} value={i}>{name}</option>)}</select><select aria-label="Calendar year" value={month.getFullYear()} onChange={e => setMonth(new Date(Number(e.target.value), month.getMonth(), 1))}>{years.map(year => <option key={year}>{year}</option>)}</select></div>
        <div className="date-picker-navigation"><Button variant="icon" size="sm" aria-label="Previous month" disabled={month.getFullYear() === today.getFullYear() && month.getMonth() <= today.getMonth()} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16}/></Button><Button variant="icon" size="sm" aria-label="Next month" disabled={month.getFullYear() >= years.at(-1)! && month.getMonth() === 11} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16}/></Button></div>
      </div>
      <div className="date-picker-calendar" aria-label={month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}>
        {weekdays.map(day => <span className="date-picker-weekday" key={day}>{day}</span>)}
        {calendarDays(month).map(day => {
          const chosen = !!selected && sameDay(day, selected);
          const outside = day.getMonth() !== month.getMonth();
          const past = day < midnight;
          const isToday = sameDay(day, today);
          const key = toLocalDateTime(day).slice(0, 10);
          return <Button variant="unstyled" key={key} data-day={key} className={`date-picker-day ${chosen ? 'chosen' : ''} ${outside ? 'outside' : ''} ${isToday ? 'today' : ''}`} disabled={past || day.getFullYear() > years.at(-1)!} aria-label={day.toLocaleDateString(undefined, { dateStyle: 'full' })} aria-pressed={chosen} aria-current={isToday ? 'date' : undefined} onClick={() => chooseDay(day)} onKeyDown={e => dayKey(e, day)}>{day.getDate()}</Button>;
        })}
      </div>
      <div className="date-picker-time"><span><Clock3 size={15}/> Time</span><div className="date-picker-time-controls"><select aria-label="Schedule hour" value={hours % 12 || 12} onChange={e => changeTime(Number(e.target.value) % 12 + (hours >= 12 ? 12 : 0), minutes)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select><b>:</b><select aria-label="Schedule minute" value={minutes} onChange={e => changeTime(hours, Number(e.target.value))}>{Array.from({ length: 60 }, (_, i) => <option value={i} key={i}>{String(i).padStart(2, '0')}</option>)}</select><select aria-label="AM or PM" value={hours >= 12 ? 'PM' : 'AM'} onChange={e => changeTime(hours % 12 + (e.target.value === 'PM' ? 12 : 0), minutes)}><option>AM</option><option>PM</option></select></div></div>
      {value && !valid && <p className="date-picker-error" role="alert">Choose a time in the future.</p>}
      <div className="date-picker-footer"><Button variant="text" size="sm" disabled={!value} onClick={() => onChange('')}>Clear</Button><Button variant="primary" size="sm" disabled={!valid} startIcon={<Check size={14}/>} onClick={close}>Done</Button></div>
    </div>}
    <p className="date-picker-zone" id={`${panelId}-zone`}><Globe2 size={12}/>{timeZone}<span>· Stored in UTC</span></p>
  </div>;
}
