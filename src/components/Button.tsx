import { cn } from '../ui/cn';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'soft' | 'danger' | 'icon' | 'text' | 'unstyled';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  loading?: boolean;
  loadingText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  badge?: ReactNode;
  fullWidth?: boolean;
}

/** Native button semantics with shared visual variants and async feedback.
 * Use `unstyled` for navigation rows, backdrops, and other custom layouts.
 * Icon-only buttons must receive an accessible `aria-label`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    loading = false,
    loadingText,
    startIcon,
    endIcon,
    badge,
    fullWidth = false,
    disabled,
    type = 'button',
    className = '',
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        [
          'button',
          variant !== 'unstyled' && 'button--styled',
          variant !== 'unstyled' &&
            variant !== 'icon' &&
            variant !== 'text' &&
            `button-size-${size}`,
          `button--${variant}`,
          `button--${size}`,
          `button--${shape}`,
          fullWidth && 'button--full',
          className,
        ]
          .filter(Boolean)
          .join(' '),
      )}
    >
      {loading ? (
        <LoaderCircle className={cn('button-spinner shrink-[0]')} size={16} aria-hidden="true" />
      ) : (
        startIcon && (
          <span
            className={cn('inline-flex items-center justify-center shrink-[0]')}
            aria-hidden="true"
          >
            {startIcon}
          </span>
        )
      )}
      {loading && loadingText ? loadingText : children}
      {endIcon && (
        <span
          className={cn('inline-flex items-center justify-center shrink-[0]')}
          aria-hidden="true"
        >
          {endIcon}
        </span>
      )}
      {badge !== undefined && (
        <span
          className={cn(
            'inline-grid place-items-center min-w-[22px] h-[22px] p-[0_5px] [border:1px_solid_currentColor] rounded-[999px] text-[0.85em]',
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
});
