export type ClassValue = string | false | null | undefined | readonly ClassValue[];

/** Join explicit classes; component variants own their styles and never expand global aliases. */
export function cn(...values: readonly ClassValue[]): string {
  const tokens: string[] = [];
  function collect(value: ClassValue): void {
    if (typeof value === 'string') tokens.push(...value.split(/\s+/).filter(Boolean));
    else if (Array.isArray(value)) value.forEach(collect);
  }
  values.forEach(collect);
  return [...new Set(tokens)].join(' ');
}
