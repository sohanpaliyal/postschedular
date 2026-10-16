import type { PostStatus } from '../types/post';
export { PlatformIcon } from './PlatformIcon';
export function StatusBadge({ status, pending = false }: { status: PostStatus; pending?: boolean }) {
  return <span className={`status ${status}`}><i aria-hidden="true"/>{pending ? 'Retrying…' : status}</span>;
}
