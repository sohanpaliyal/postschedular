import { useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/Button';
import { updatePreferences, useDarkTheme } from '@/state';
import {
  cn,
  themeSwitchIconStyles,
  themeSwitchIndicatorStyles,
  themeSwitchMoonStyles,
  themeSwitchSunStyles,
  themeSwitchStyles,
} from '@/ui';
export function ThemeSwitch() {
  const dark = useDarkTheme();
  const indicator = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  useEffect(() => () => animation.current?.cancel(), []);
  function toggle() {
    const node = indicator.current;
    if (node && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Start at the currently painted position, including during a rapid reversal.
      const current = getComputedStyle(node);
      const left = current.left;
      const width = current.width;
      animation.current?.cancel();
      animation.current = node.animate(
        [
          { left, width, offset: 0 },
          { left: '5px', width: '64px', offset: 0.48 },
          { left: dark ? '5px' : '39px', width: '30px', offset: 1 },
        ],
        { duration: 650, easing: 'cubic-bezier(.65, 0, .35, 1)' },
      );
    }
    updatePreferences({ theme: dark ? 'light' : 'dark' });
  }
  return (
    <Button
      variant="unstyled"
      className={cn(
        cn(
          `theme-switch relative block shrink-[0] w-[74px] h-[40px] p-[0] border-0 rounded-[999px] isolate ${dark ? 'is-dark' : ''}`,
          themeSwitchStyles,
        ),
      )}
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
    >
      <span
        className={cn(
          cn(
            'theme-switch-indicator absolute top-[5px] w-[30px] h-[30px] [background:#2d3329] rounded-[999px] z-[-1]',
            themeSwitchIndicatorStyles,
          ),
        )}
        ref={indicator}
        aria-hidden="true"
      />
      <span
        className={cn(
          cn(
            'theme-switch-icon absolute top-[5px] w-[30px] h-[30px] grid place-items-center pointer-events-none theme-switch-sun left-[5px]',
            themeSwitchIconStyles,
            themeSwitchSunStyles,
          ),
        )}
        aria-hidden="true"
      >
        <Sun size={20} fill="currentColor" />
      </span>
      <span
        className={cn(
          cn(
            'theme-switch-icon absolute top-[5px] w-[30px] h-[30px] grid place-items-center pointer-events-none theme-switch-moon right-[5px]',
            themeSwitchIconStyles,
            themeSwitchMoonStyles,
          ),
        )}
        aria-hidden="true"
      >
        <Moon size={20} fill="currentColor" />
      </span>
    </Button>
  );
}
