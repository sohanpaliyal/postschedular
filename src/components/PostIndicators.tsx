import { statusStyles } from '../ui/layoutStyles';
import { cn } from '../ui/cn';
import type { PostStatus } from '../types/post';
export { PlatformIcon } from './PlatformIcon';
export function StatusBadge({
  status,
  pending = false,
}: {
  status: PostStatus;
  pending?: boolean;
}) {
  return (
    <span
      className={cn(
        cn(
          `status inline-flex items-center gap-[5px] [text-transform:capitalize] ${status}`,
          statusStyles,
        ),
      )}
    >
      <i aria-hidden="true" />
      {pending ? 'Retrying…' : status}
    </span>
  );
}
