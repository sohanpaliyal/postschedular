export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Cache writes in memory first so denied/full browser storage never loses session changes. */
export function createSafeStorage(provider: () => Storage): StorageAdapter {
  const memory = new Map<string, string | null>();
  return {
    get(key) {
      if (memory.has(key)) return memory.get(key) ?? null;
      try {
        return provider().getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      memory.set(key, value);
      try {
        provider().setItem(key, value);
      } catch {
        /* Session fallback remains available. */
      }
    },
    remove(key) {
      memory.set(key, null);
      try {
        provider().removeItem(key);
      } catch {
        /* Session fallback remains available. */
      }
    },
  };
}
export const storage = createSafeStorage(() => window.localStorage);
