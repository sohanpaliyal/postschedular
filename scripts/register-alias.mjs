import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';

// Match the source alias used by TypeScript and Vite for the native Node test runner.
const sourceRoot = new URL('../src/', import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    const url = specifier.startsWith('@/')
      ? new URL(specifier.slice(2), sourceRoot)
      : specifier.startsWith('.') && context.parentURL?.startsWith(sourceRoot.href)
        ? new URL(specifier, context.parentURL)
        : null;
    if (url) {
      for (const suffix of ['', '.ts', '/index.ts']) {
        const candidate = new URL(url.href + suffix);
        if (
          existsSync(candidate) &&
          (candidate.pathname.endsWith('.ts') || candidate.pathname.endsWith('.json'))
        ) {
          return nextResolve(candidate.href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
