import { motionChevronStyles } from '../ui/controlsStyles';
import { navChevronStyles, labelStyles } from '../ui/layoutStyles';
import { cn } from '../ui/cn';
export function MotionChevron({
  flipped,
  horizontal = false,
}: {
  flipped: boolean;
  horizontal?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn(
        cn(
          `motion-chevron [overflow:visible] shrink-[0] ${horizontal ? 'horizontal' : cn('nav-chevron [color:#8d8d8d] label', navChevronStyles, labelStyles)} ${flipped ? 'flipped' : ''}`,
          motionChevronStyles,
        ),
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
    >
      <g className={cn('chevron-joint')}>
        <line className={cn('chevron-arm first')} x1="12" y1="12" x2="3.515" y2="12" />
        <line className={cn('chevron-arm second')} x1="12" y1="12" x2="20.485" y2="12" />
      </g>
    </svg>
  );
}
