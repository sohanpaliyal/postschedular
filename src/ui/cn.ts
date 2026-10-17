import { elementStyles } from './elementStyles';
import { analyticsStyles } from './analyticsStyles';
import { calendarStyles } from './calendarStyles';
import { controlsStyles } from './controlsStyles';
import { layoutStyles } from './layoutStyles';

const compositions: Record<string, readonly string[]> = {
  ...elementStyles,
  ...analyticsStyles,
  ...calendarStyles,
  ...controlsStyles,
  ...layoutStyles,
};

const styles = Object.fromEntries(
  Object.entries(compositions).map(([name, chunks]) => [
    name,
    chunks.flatMap((chunk) => chunk.split(/\s+/)),
  ]),
);

/** Compose conditional classes and reusable, statically discoverable Tailwind variants. */
export function cn(...values: (string | false | null | undefined)[]): string {
  const tokens = values
    .filter((value): value is string => typeof value === 'string')
    .flatMap((value) => value.split(/\s+/).filter(Boolean));
  return [...new Set(tokens.flatMap((token) => [token, ...(styles[token] ?? [])]))].join(' ');
}
