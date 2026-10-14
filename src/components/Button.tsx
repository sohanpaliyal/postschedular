import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'soft' | 'danger' | 'icon' | 'text' | 'unstyled';
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
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary', size = 'md', shape = 'rounded', loading = false,
  loadingText, startIcon, endIcon, badge, fullWidth = false,
  disabled, type = 'button', className = '', children, ...props
}, ref) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={['button', `button--${variant}`, `button--${size}`, `button--${shape}`, fullWidth && 'button--full', className].filter(Boolean).join(' ')}
    >
      {loading ? <LoaderCircle className="button-spinner" size={16} aria-hidden="true" /> : startIcon && <span className="button-icon" aria-hidden="true">{startIcon}</span>}
      {loading && loadingText ? loadingText : children}
      {endIcon && <span className="button-icon" aria-hidden="true">{endIcon}</span>}
      {badge !== undefined && <span className="button-badge">{badge}</span>}
    </button>
  );
});
