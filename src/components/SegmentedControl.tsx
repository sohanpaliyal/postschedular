import { cn, segmentedControlStyles } from '@/ui';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/Button';
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: {
    value: T;
    label: string;
    icon?: ReactNode;
  }[];
  onChange: (value: T) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  const target = useRef<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);
  useLayoutEffect(() => {
    function update(animate: boolean) {
      const node = indicator.current;
      const active = root.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!node || !active) return;
      const next = {
        left: active.offsetLeft,
        width: active.offsetWidth,
        top: active.offsetTop,
        height: active.offsetHeight,
      };
      if (
        target.current?.left === next.left &&
        target.current.width === next.width &&
        target.current.top === next.top &&
        target.current.height === next.height
      )
        return;
      const first = target.current === null;
      const painted = getComputedStyle(node);
      const left = first ? next.left : parseFloat(painted.left);
      const width = first ? next.width : parseFloat(painted.width);
      animation.current?.cancel();
      target.current = next;
      Object.assign(node.style, {
        left: `${next.left}px`,
        width: `${next.width}px`,
        top: `${next.top}px`,
        height: `${next.height}px`,
        opacity: '1',
      });
      if (first || !animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return;
      const stretchLeft = Math.min(left, next.left);
      const stretchRight = Math.max(left + width, next.left + next.width);
      animation.current = node.animate(
        [
          { left: `${left}px`, width: `${width}px`, offset: 0 },
          { left: `${stretchLeft}px`, width: `${stretchRight - stretchLeft}px`, offset: 0.48 },
          { left: `${next.left}px`, width: `${next.width}px`, offset: 1 },
        ],
        { duration: 650, easing: 'cubic-bezier(.65, 0, .35, 1)' },
      );
    }
    update(true);
    const observer = new ResizeObserver(() => update(false));
    if (root.current) {
      observer.observe(root.current);
      root.current.querySelectorAll('button').forEach((button) => observer.observe(button));
    }
    return () => observer.disconnect();
  }, [value, options]);
  useLayoutEffect(() => () => animation.current?.cancel(), []);
  return (
    <div
      className={cn(cn('segmented-control isolate gap-[2px]', segmentedControlStyles))}
      ref={root}
      role="group"
      aria-label={label}
    >
      <span
        ref={indicator}
        className={cn(
          'absolute pointer-events-none opacity-[0] left-[3px] top-[3px] rounded-[7px] [background:var(--tab-active)] [box-shadow:0_1px_4px_#0000000a] z-[0]',
        )}
        aria-hidden="true"
      />
      {options.map((option) => (
        <Button
          key={option.value}
          variant="unstyled"
          aria-pressed={option.value === value}
          aria-label={option.label}
          title={option.label}
          className={cn(option.value === value ? 'is-active' : '')}
          onClick={() => onChange(option.value)}
        >
          {option.icon || option.label}
        </Button>
      ))}
    </div>
  );
}
