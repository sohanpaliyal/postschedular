import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import './SegmentedControl.css';

export function SegmentedControl<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  const target = useRef<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    function update(animate: boolean) {
      const node = indicator.current;
      const active = root.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!node || !active) return;
      const next = { left: active.offsetLeft, width: active.offsetWidth };
      if (target.current?.left === next.left && target.current.width === next.width) return;
      const first = target.current === null;
      const painted = getComputedStyle(node);
      const left = first ? next.left : parseFloat(painted.left);
      const width = first ? next.width : parseFloat(painted.width);
      animation.current?.cancel();
      target.current = next;
      Object.assign(node.style, { left: `${next.left}px`, width: `${next.width}px`, top: `${active.offsetTop}px`, height: `${active.offsetHeight}px`, opacity: '1' });
      if (first || !animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const stretchLeft = Math.min(left, next.left);
      const stretchRight = Math.max(left + width, next.left + next.width);
      animation.current = node.animate([
        { left: `${left}px`, width: `${width}px`, offset: 0 },
        { left: `${stretchLeft}px`, width: `${stretchRight - stretchLeft}px`, offset: .48 },
        { left: `${next.left}px`, width: `${next.width}px`, offset: 1 },
      ], { duration: 650, easing: 'cubic-bezier(.65, 0, .35, 1)' });
    }
    update(true);
    const observer = new ResizeObserver(() => update(false));
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [value, options]);
  useLayoutEffect(() => () => animation.current?.cancel(), []);

  return <div className="segmented-control" ref={root} role="group" aria-label={label}>
    <span ref={indicator} className="segmented-control-indicator" aria-hidden="true"/>
    {options.map(option => <Button key={option.value} variant="unstyled" aria-pressed={option.value === value} aria-label={option.label} title={option.label} className={option.value === value ? 'is-active' : ''} onClick={() => onChange(option.value)}>{option.icon || option.label}</Button>)}
  </div>;
}
