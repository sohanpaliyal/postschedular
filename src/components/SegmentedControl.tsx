import type { ReactNode } from 'react';
import { Button } from './Button';
export function SegmentedControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string; icon?: ReactNode }[]; onChange: (value: T) => void }) {
  return <div className="segmented-control" role="group" aria-label={label}>{options.map(option => <Button key={option.value} variant="unstyled" aria-pressed={option.value === value} aria-label={option.label} title={option.label} className={option.value === value ? 'is-active' : ''} onClick={() => onChange(option.value)}>{option.icon || option.label}</Button>)}</div>;
}
