# Pre-commit code review

Reviewed 17 October 2026. No implementation changes, commits, pushes, or deployment were performed during this review.

## Recommendation

Do not treat the current state as submission-ready. Fix the confirmed storage and asynchronous-operation defects first, then finish the mock error flows, accessibility correction, and documentation. The normal UI works and the engineering checks pass, but those checks do not currently cover the failing flows below.

## Findings, in priority order

### 1. P1 — Storage failures can prevent the entire app from rendering

Locations: `src/App.tsx:72`, `src/App.tsx:88`, `src/App.tsx:110`.

The saved posts are parsed without validating that the result is an array of valid posts. Valid JSON such as `{}` passes the catch block and reaches `posts.filter`, causing a blank application. The sidebar storage read and both persistence effects also access localStorage without handling blocked storage or write failures.

Confirmed in an isolated browser profile:

- Set `flintzy-posts` to `{}` and reload: no app shell renders; `TypeError: posts.filter is not a function`.
- Make localStorage throw SecurityError and reload: no app shell renders.

Use a shared storage adapter with schema validation, safe reads/writes, and an in-memory fallback. Add regression tests for invalid JSON, valid JSON with invalid shape, and unavailable/full storage. An error boundary would provide an additional recovery UI.

### 2. P2 — Cancelling a submission still creates the post

Locations: `src/components/Composer.tsx:32`, `src/components/Composer.tsx:47`, `src/components/Composer.tsx:165`.

The delayed submission calls onSave after 500ms even if the composer has been closed or unmounted. Cancel, Escape, backdrop dismissal, and route navigation do not cancel the pending work. The submit function also has no in-flight guard independent of the disabled button.

Confirmed: start with 32 posts, submit valid content, immediately click Cancel; the saved count becomes 33 and navigation ends at `/posts`.

Define cancellation semantics, abort or invalidate pending saves on dismissal/unmount, guard duplicate submissions, and cover cancel/navigation during save with interaction tests.

### 3. P2 — An outstanding retry can modify freshly reset demo data

Locations: `src/App.tsx:231`, `src/App.tsx:253`, `src/App.tsx:489`.

Reset clears pending indicators but does not invalidate the retry timer. Seed IDs are reused, so the old callback can find the same ID in the fresh dataset and apply its obsolete result.

Confirmed: force a retry failure, retry `post-28`, reset demo data before the delay finishes. The newly seeded post's error is subsequently replaced by the stale retry error.

Own async work in a posts service/hook with an operation generation or AbortController. Reset should cancel or invalidate every earlier request. Test retry failure/success and reset/reload during an in-flight retry.

### 4. P2 — Required mock load/create error flows are missing

Locations: `src/App.tsx:43`, `src/App.tsx:106`, `src/components/Composer.tsx:47`.

Initial loading is a timer, creation is an always-successful timer, and seed data is generated in App. There is no list/create mock request layer, fixture JSON, reproducible load/create failure mode, or fetch-error recovery UI. Retry has a failure path, but it does not cover these other error states.

Add a typed mock data service backed by the requested fixture data, deterministic latency/failure controls, and loading/error/retry UI for loading and creating posts. Keep list/create/retry behavior out of App and Composer. Document how an evaluator can trigger each state.

### 5. P2 — Shared dialogs have no accessible name

Location: `src/components/Modal.tsx:22`.

The visible heading is not connected to the dialog through aria-labelledby, and the dialog has no aria-label. Browser accessibility inspection reports an empty dialog name.

Give the heading a useId-generated ID and reference it from aria-labelledby on the dialog. Preserve the native dialog's focus trapping and restoration.

### 6. P2 — Styling reuse is too implicit and globally coupled

Locations: `src/ui/cn.ts:7`, `src/ui/cn.ts:23`, `src/ui/layoutStyles.ts:1`.

The class-name helper imports all page/control style registries and silently expands semantic tokens into long utility lists. It does not resolve conflicting Tailwind utilities; deduplication only removes identical tokens. A caller's className therefore does not reliably override an existing utility by argument order. The layout registry alone is over 1,600 lines, and many compositions restate old selectors as arbitrary variants.

Prefer explicit component-owned utility variants/compositions, a small predictable class-name helper, and typed shared primitives for surfaces, section headings, field rows, metric cards, and anchored popovers. Keep all styling in Tailwind as requested. Avoid reintroducing page CSS or undertaking a visual redesign during the cleanup.

Current production output is approximately 489 KB JavaScript / 136 KB gzip and 196 KB CSS / 32 KB gzip. This is not a build failure, but it is a useful baseline for simplifying the style infrastructure.

### 7. P3 — Submission documentation is stale

Locations: `README.md:264`, `README.md:286`, `QUALITY.md:34`.

The documentation still reports fourteen tests and describes Social Accounts and Settings as placeholders. Both pages now contain working demo features. The README also mixes the original planning document with implementation notes.

Rewrite the README around the actual application: setup, scripts, implemented features, mock behavior, architecture, assumptions/limitations, and deployment instructions. Add the live URL after deployment. Document the SPA fallback required by the chosen host for direct navigation to `/posts`, `/analytics`, and other routes.

## Reusability and architecture

Good existing boundaries:

- Button, Select, SegmentedControl, Modal, PlatformIcon, and DateTimePicker are shared.
- DataTable and PostSummaryTable avoid duplicated table rendering.
- MetricChart and DoughnutChart are reusable chart primitives.
- Post filtering/calendar, analytics, dashboard selection, and route-query logic have separate typed modules.
- Character limits and platform/status types have a shared definition.

Recommended cleanup order:

1. Introduce a typed posts repository/mock service and safe storage adapter.
2. Move post loading, creation, retry cancellation, and persistence into a dedicated hook.
3. Centralize routing/URL ownership rather than extending the large App component.
4. Simplify explicit Tailwind compositions and extract shared surface/field/popover primitives where duplication actually exists.
5. Add committed interaction tests for the reproduced defects, dialogs, URL navigation, and keyboard operation of shared controls.
6. Update documentation and review the final diff before committing.

## Verification completed

- `pnpm run check`: passed lint, formatting, TypeScript, all 21 tests, and production build.
- `TZ=America/New_York pnpm test`: all 21 tests passed.
- `pnpm audit --audit-level high`: no known vulnerabilities reported.
- `git diff --check`: passed.
- Browser reproduction in a separate temporary Chrome profile confirmed findings 1, 2, 3, and 5.
- Browser hit testing confirmed the doughnut's scheduled/published/failed slices map to the correct data.

The current tests primarily cover pure data/date helpers; there are no committed browser/component interaction tests. Hosting, remote setup, and submission were not performed or verified in this review.
