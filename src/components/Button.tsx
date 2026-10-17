import {
  buttonDangerStyles,
  buttonFullStyles,
  buttonIconStyles,
  buttonOutlineStyles,
  buttonPillStyles,
  buttonPrimaryStyles,
  buttonRoundedStyles,
  buttonSecondaryStyles,
  buttonSizeLgStyles,
  buttonSizeMdStyles,
  buttonSizeSmStyles,
  buttonSoftStyles,
  buttonSpinnerStyles,
  buttonStyledStyles,
  buttonStyles,
  buttonTextStyles,
  buttonUnstyledStyles,
  cn,
} from '@/ui';
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
const variantClasses: Record<ButtonVariant, readonly string[]> = {
  primary: buttonPrimaryStyles,
  secondary: buttonSecondaryStyles,
  outline: buttonOutlineStyles,
  soft: buttonSoftStyles,
  danger: buttonDangerStyles,
  icon: buttonIconStyles,
  text: buttonTextStyles,
  unstyled: buttonUnstyledStyles,
};
const sizeClasses = { sm: buttonSizeSmStyles, md: buttonSizeMdStyles, lg: buttonSizeLgStyles };

/** Shared native button. Icon-only controls require an accessible aria-label. */
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
        'button',
        buttonStyles,
        `button--${variant}`,
        variantClasses[variant],
        `button--${size}`,
        `button--${shape}`,
        variant !== 'unstyled' && buttonStyledStyles,
        variant !== 'unstyled' && (shape === 'pill' ? buttonPillStyles : buttonRoundedStyles),
        variant !== 'unstyled' && variant !== 'icon' && variant !== 'text' && sizeClasses[size],
        fullWidth && buttonFullStyles,
        className,
      )}
    >
      {loading ? (
        <LoaderCircle
          className={cn('button-spinner shrink-0', buttonSpinnerStyles)}
          size={16}
          aria-hidden="true"
        />
      ) : (
        startIcon && (
          <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
            {startIcon}
          </span>
        )
      )}
      {loading && loadingText ? loadingText : children}
      {endIcon && (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
          {endIcon}
        </span>
      )}
      {badge !== undefined && (
        <span className="inline-grid h-[22px] min-w-[22px] place-items-center rounded-full border border-current px-[5px] text-[0.85em]">
          {badge}
        </span>
      )}
    </button>
  );
});
