import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import './ThemeSwitch.css';

export function ThemeSwitch() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  const indicator = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('postflow-theme', dark ? 'dark' : 'light'); } catch { /* Theme still works when storage is unavailable. */ }
  }, [dark]);
  useEffect(() => () => animation.current?.cancel(), []);

  function toggle() {
    const node = indicator.current;
    if (node && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Start at the currently painted position, including during a rapid reversal.
      const current = getComputedStyle(node);
      const left = current.left;
      const width = current.width;
      animation.current?.cancel();
      animation.current = node.animate([
        { left, width, offset: 0 },
        { left: '5px', width: '64px', offset: .48 },
        { left: dark ? '5px' : '39px', width: '30px', offset: 1 },
      ], { duration: 650, easing: 'cubic-bezier(.65, 0, .35, 1)' });
    }
    setDark(value => !value);
  }

  return <Button variant="unstyled" className={`theme-switch ${dark ? 'is-dark' : ''}`} role="switch" aria-checked={dark} aria-label="Dark mode" title={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggle}>
    <span className="theme-switch-indicator" ref={indicator} aria-hidden="true"/>
    <span className="theme-switch-icon theme-switch-sun" aria-hidden="true"><Sun size={20} fill="currentColor"/></span>
    <span className="theme-switch-icon theme-switch-moon" aria-hidden="true"><Moon size={20} fill="currentColor"/></span>
  </Button>;
}
