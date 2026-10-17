# Flintzy — Social Media Post Scheduler

A responsive, frontend-only social media scheduling application built with **React 19 + TypeScript + Vite**. Users can compose posts, select platforms, schedule them for the future, and manage everything from a single dashboard.

**Live demo:** _[Add your Vercel/Netlify URL here]_

---

## Getting started

Requires **Node.js ≥ 22** and **pnpm ≥ 10**. If you use `nvm`, run `nvm use` to pick the version from `.nvmrc`.

```bash
pnpm install
pnpm run dev
```

Open the local URL printed by Vite. To verify the production build:

```bash
pnpm run build
pnpm run preview
```

### Quality checks

```bash
pnpm run lint          # ESLint (warnings fail the check)
pnpm run typecheck     # Strict TypeScript check
pnpm test              # Unit tests (date/calendar/retry/analytics)
pnpm run check         # All checks + production build in one command
```

---

## Features

| Requirement                                 | Implementation                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 32 mock posts (all platforms, all statuses) | `src/data/posts.json` — seeded relative to launch date so Today/Tomorrow always have posts       |
| Post queue grouped by day                   | List view with Today / Tomorrow / explicit dates, sorted ascending                               |
| Platform & status filters + content search  | URL query params (`?q=&platform=&status=`) — persist across refresh and browser back/forward     |
| Post composer                               | Modal and full-page route (`/compose`) with platform picker, image URL, and date/time picker     |
| Live per-platform character counter         | X 280 · Instagram 2,200 · TikTok 2,200 · Facebook 5,000 — scheduling blocked when any is over    |
| Future-time enforcement                     | Checked in the UI and re-validated at submission time in the service layer                       |
| UTC storage, local time display             | DateTimePicker works in local time; stores UTC ISO strings; displayed with `Intl` throughout     |
| Optimistic retry                            | 1 s simulated delay, 80 % success / 20 % failure, instant UI update with rollback on failure     |
| Loading / empty / error states              | Skeletons, fetch-error + retry, empty queue, no-filter-match, scheduling failure with draft kept |
| Responsive layout                           | Sidebar collapses on mobile; calendar scrolls horizontally; composer adapts to screen size       |
| Dark mode                                   | System / light / dark preference saved in localStorage, animated theme switch in the header      |
| Calendar views                              | Month, week, year, and list views on the All Posts page                                          |
| Analytics page                              | Mock per-post metrics, overview chart, platform breakdown, CSV export                            |

---

## Key decisions

### No React Router — manual SPA routing

The app implements lightweight SPA routing with `history.pushState`, `popstate`, and `URLSearchParams` rather than pulling in React Router. Given the small number of routes (Dashboard, All Posts, Compose, Analytics, Social Accounts, Settings), this avoids a dependency, keeps the bundle smaller, and makes URL query-param management explicit and easy to test. The trade-off is that the routing logic lives in `App.tsx` rather than a dedicated router config.

### `useSyncExternalStore` for the posts store

Instead of a state management library, posts are managed in a plain TypeScript store object that implements the `useSyncExternalStore` contract. This is idiomatic React 19, avoids extra dependencies, and is straightforward to unit test with injected options (`storage`, `random`, `wait`, `now`) without mocking globals.

### LocalStorage persistence with in-memory fallback

`createSafeStorage` writes through to `localStorage` but keeps a memory cache so the app never loses in-session changes if storage is full or blocked (e.g., private browsing). The session experience is always correct; persistence is a best-effort bonus.

### React Compiler enabled

`babel-plugin-react-compiler` is enabled through the Vite Babel plugin with React 19 as its target. It automatically memoizes eligible components and hooks, so the codebase intentionally has no manual `useMemo` or `useCallback` calls.

### Custom DateTimePicker instead of `<input type="datetime-local">`

The native datetime input has inconsistent cross-browser/OS styling and no way to restrict past dates gracefully. The custom picker provides calendar navigation, keyboard arrow movement, quick presets (In 1 hour / Tomorrow 9 AM / Next week), AM/PM selection, a timezone indicator, and a future-time warning — all within the existing design system.

### Mock data seeded relative to launch date

`seedPosts()` shifts every fixture date so that October 17 in the JSON always maps to "today" at runtime. This keeps Today and Tomorrow populated regardless of when the reviewer runs the app.

### Optimistic retry with rollback

When a user retries a failed post, the UI immediately shows it as `scheduled` and removes the error. The original post is stored in a `Map` keyed by post ID. If the simulated API call fails (20 % of the time), the original failed state is restored and an error toast is shown. If it succeeds, the in-memory original is discarded and the new state is persisted.

---

## Assumptions

- A single post shares the same content, image URL, and scheduled time across all selected platforms.
- Media is provided by URL; file upload is out of scope.
- Retry changes a failed post back to `scheduled` and moves its time to at least 1 hour from now if the original time is in the past. This avoids introducing an unspecified rescheduling workflow.
- The future-time requirement applies only to newly created posts. Existing published or failed mock posts may have past timestamps.
- Editing and deleting posts are not required by the assignment and are not implemented.
- Character counting uses Unicode code points uniformly. Platform-specific weighted rules (e.g., Twitter's 2-unit URL counting) are outside the stated scope.
- Analytics metrics are illustrative mock values derived from post IDs. They are clearly labelled as simulated in the UI.
- Social Accounts and Settings pages are implemented (connect/disconnect demo accounts, profile name, avatar, theme, time format, default platforms, posting time). They are not required by the core assignment.
