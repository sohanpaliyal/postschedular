import { useSyncExternalStore } from 'react';
import { storage } from '../services';
import { platforms, type Platform } from '../types';

export interface Preferences {
  name: string;
  avatarId: string;
  theme: 'light' | 'dark' | 'system';
  timeFormat: '12' | '24';
  defaultPlatforms: Platform[];
  postingTime: string;
}
const key = 'flintzy-preferences';
const defaults: Preferences = {
  name: 'John Doe',
  avatarId: '60',
  theme: 'light',
  timeFormat: '12',
  defaultPlatforms: ['X'],
  postingTime: '09:00',
};
function readPreferences(): Preferences {
  try {
    const value = JSON.parse(storage.get(key) || '{}') as Partial<Preferences>;
    const oldTheme = storage.get('postflow-theme');
    return {
      name: typeof value.name === 'string' && value.name.trim() ? value.name : defaults.name,
      avatarId: ['12', '47', '60', '49'].includes(value.avatarId || '')
        ? value.avatarId!
        : defaults.avatarId,
      theme:
        value.theme === 'system' || value.theme === 'dark' || value.theme === 'light'
          ? value.theme
          : oldTheme === 'dark'
            ? 'dark'
            : 'light',
      timeFormat: value.timeFormat === '24' ? '24' : '12',
      defaultPlatforms:
        Array.isArray(value.defaultPlatforms) &&
        value.defaultPlatforms.some((p) => platforms.includes(p))
          ? value.defaultPlatforms.filter((p) => platforms.includes(p))
          : defaults.defaultPlatforms,
      postingTime:
        typeof value.postingTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.postingTime)
          ? value.postingTime
          : defaults.postingTime,
    };
  } catch {
    return defaults;
  }
}
let preferences = readPreferences();
const listeners = new Set<() => void>();
const media = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  document.documentElement.dataset.theme =
    preferences.theme === 'system' ? (media.matches ? 'dark' : 'light') : preferences.theme;
}
applyTheme();
media.addEventListener('change', () => {
  preferences = { ...preferences };
  applyTheme();
  listeners.forEach((listener) => listener());
});
export function updatePreferences(update: Partial<Preferences>) {
  preferences = { ...preferences, ...update };
  applyTheme();
  try {
    storage.set(key, JSON.stringify(preferences));
    storage.set('postflow-theme', document.documentElement.dataset.theme!);
  } catch {
    /* Preferences remain available for this session. */
  }
  listeners.forEach((listener) => listener());
}
export function usePreferences() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => preferences,
  );
}
export function useTimeFormatter() {
  const { timeFormat } = usePreferences();
  return (date: Date) =>
    date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12',
    });
}
export function preferredSchedule() {
  const date = new Date();
  const [hour, minute] = preferences.postingTime.split(':').map(Number);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date.toISOString();
}

export function useDarkTheme() {
  const { theme } = usePreferences();
  const systemDark = useSyncExternalStore(
    (listener) => {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    },
    () => media.matches,
  );
  return theme === 'system' ? systemDark : theme === 'dark';
}
