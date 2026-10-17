import { cn } from '../ui/cn';
import { siFacebook, siInstagram, siTiktok, siX } from 'simple-icons';
import type { Platform } from '../types/post';
const icons = { Facebook: siFacebook, Instagram: siInstagram, TikTok: siTiktok, X: siX };
export function PlatformIcon({
  platform,
  size,
  decorative = false,
}: {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  decorative?: boolean;
}) {
  const icon = icons[platform];
  return (
    <span
      className={cn(
        `platform place-items-center brand-icon platform-${platform.toLowerCase()} ${size ? `brand-icon--${size}` : ''}`,
      )}
      data-platform={platform}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : platform}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : platform}
    >
      <svg
        className={cn('social-brand-mark')}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
      >
        {platform === 'TikTok' && (
          <>
            <path d={icon.path} fill="#25f4ee" transform="translate(-.65,-.4)" />
            <path d={icon.path} fill="#fe2c55" transform="translate(.65,.4)" />
          </>
        )}
        <path d={icon.path} />
      </svg>
    </span>
  );
}
