import { CalendarDays, ChevronLeft, ChevronRight, Eye, EyeOff, List } from 'lucide-react';
import { Button } from './Button';
import { Select } from './Select';
import { SegmentedControl } from './SegmentedControl';
import type { CalendarView } from '../lib/calendar';
const months = Array.from({ length: 12 }, (_, value) => ({ value, label: new Date(2026, value, 1).toLocaleDateString(undefined, { month: 'long' }) }));
export function CalendarToolbar({ view, date, details, onView, onDate, onMove, onDetails }: { view: CalendarView; date: Date; details: boolean; onView: (view: CalendarView) => void; onDate: (date: Date) => void; onMove: (direction: number) => void; onDetails: () => void }) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => thisYear - 5 + i);
  if (!years.includes(date.getFullYear())) years.push(date.getFullYear());
  return <div className="calendar-toolbar"><div className="calendar-view-controls"><SegmentedControl label="Post layout" value={view === 'list' ? 'list' : 'calendar'} onChange={value => onView(value === 'list' ? 'list' : 'month')} options={[{ value: 'list', label: 'List view', icon: <List size={16}/> }, { value: 'calendar', label: 'Calendar view', icon: <CalendarDays size={16}/> }]}/>{view !== 'list' && <SegmentedControl<CalendarView> label="Calendar period" value={view} onChange={onView} options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]}/>}</div>
    {view !== 'list' && <div className="calendar-period-controls"><Button variant="icon" size="sm" aria-label={`Previous ${view}`} onClick={() => onMove(-1)}><ChevronLeft size={16}/></Button>{view !== 'year' && <Select label="Calendar month" size="sm" variant="ghost" value={date.getMonth()} options={months} onChange={month => onDate(new Date(date.getFullYear(), month, 1, 12))}/>}<Select label="Calendar year" size="sm" variant="ghost" value={date.getFullYear()} options={years.sort((a, b) => a - b).map(value => ({ value, label: String(value) }))} onChange={year => onDate(new Date(year, date.getMonth(), 1, 12))}/><Button variant="icon" size="sm" aria-label={`Next ${view}`} onClick={() => onMove(1)}><ChevronRight size={16}/></Button><Button variant="text" size="sm" onClick={() => onDate(new Date())}>Today</Button></div>}
    {view !== 'list' && <Button variant="secondary" size="sm" startIcon={details ? <EyeOff size={14}/> : <Eye size={14}/>} onClick={onDetails} aria-pressed={details}>{details ? 'Compact posts' : 'Show details'}</Button>}
  </div>;
}
