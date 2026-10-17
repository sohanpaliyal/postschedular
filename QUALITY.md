# Code review guide

## Before pushing

Run `pnpm run check`. It must finish without lint warnings, formatting changes, type errors, failing tests, or build errors. Use the frozen pnpm lockfile in CI and keep one package-manager lockfile.

Husky runs staged-file checks before commits and the complete quality gate before pushes. GitHub Actions provides the same checks independently of local hooks. No repository has been pushed or deployed by this setup.

## Suggested file-by-file review order

1. `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.nvmrc`: dependency reproducibility and runtime.
2. `eslint.config.js`, `.prettierrc.json`, `.editorconfig`, `tsconfig.json`: quality rules and formatting.
3. `.husky/`, `.github/workflows/ci.yml`, `.vscode/`: hooks, CI, and editor integration.
4. `src/main.tsx`, `src/App.tsx`: entry point, navigation, state ownership, URL handling, persistence, and retry behavior.
5. `src/types/post.ts`, `src/lib/`, `tests/`: data contracts, local dates, mock metrics, and meaningful boundary tests.
6. `src/components/Button.tsx`, `Select.tsx`, `SegmentedControl.tsx`: shared controls, accessibility, focus, and motion.
7. `DateTimePicker.tsx`, `Composer.tsx`: validation, local scheduling, UTC conversion, and submission states.
8. Post list/calendar, indicators, tables, cards, charts, modal, avatar, and theme components.
9. `src/pages/`: dashboard integration, All Posts, Analytics, and placeholder routes.
10. Styles, README, responsive behavior, and a browser pass of the complete user flows.

## What the automated checks cover

- Recommended JavaScript/TypeScript linting, standard React Hooks rules, Fast Refresh boundaries, consistent type imports, unused variables, and promise handling.
- Strict TypeScript, unused locals/parameters, and file-name casing.
- Consistent source/style/document formatting with a pinned Prettier version.
- Date/calendar and mock analytics unit tests, also exercised in a second time zone in CI.
- Vite production compilation.

React Compiler is enabled through the Vite React Babel plugin for React 19. The recommended React Hooks lint rules include compiler diagnostics. Derived values and handlers use automatic memoization instead of manual `useMemo` or `useCallback`. ESLint and TypeScript checks complement browser testing and code review rather than replacing them.

## Known feature work remaining

The original assignment still needs final end-to-end browser/mobile QA, a mock API/local JSON data layer and reproducible fetch/create error states, and review of storage/URL edge cases. Social Accounts and Settings currently provide routes/placeholders. Hosting, remote repository setup, and submission remain separate tasks.
