import type { Platform, PostStatus } from '../types/post';
export function PlatformIcon({ platform }: { platform: Platform }) {
  return <span className={`platform platform-${platform.toLowerCase()}`} aria-label={platform} title={platform}>{platform === 'Instagram' ? '◎' : platform === 'Facebook' ? 'f' : platform === 'TikTok' ? '♪' : '𝕏'}</span>;
}
export function StatusBadge({ status, pending = false }: { status: PostStatus; pending?: boolean }) {
  return <span className={`status ${status}`}><i aria-hidden="true"/>{pending ? 'Retrying…' : status}</span>;
}
