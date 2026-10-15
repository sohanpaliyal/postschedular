# Flintzy — Social Media Post Scheduler

## Project understanding

Build a responsive, frontend-only social media scheduling application using **React or Next.js with TypeScript**. Users can write a post, choose one or more social platforms, schedule it, and manage posts from a single dashboard.

Supported platforms: **Facebook Pages, Instagram, X, and TikTok**.

There is no authentication, real social media integration, or actual publishing. All data and API behavior are mocked. The assignment deadline is **5 days**.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To check the production build:

```bash
npm run build
npm run preview
```

## Current implementation

React + TypeScript + Vite project with a sidebar recreated from the supplied video: expanding/collapsing navigation, branching inline submenu, compact floating submenu, search shortcut, contact rows, profile menu, and reduced-motion support. Sidebar preference survives refresh.

The first scheduler implementation includes 32 generated mock posts, day grouping, URL-based search and filters, a composer modal, per-platform character limits, UTC scheduling, local persistence, optimistic retry, and a Post Details modal. The reference menu labels are preserved; Revenue, Insights, Contracts, Payments, Notification, and Messages open explicitly labeled demo panels.

Visual verification: inspected expanded and collapsed desktop layouts and composer in Chrome. TypeScript and production build pass. Exact reference font, avatar assets, and motion source values were unavailable; similar assets and hand-tuned CSS transitions are used. Google Fonts and demo avatars currently require internet access.

Remaining before submission: extract seed data into a local JSON/mock API layer, add reproducible load/create error states, strengthen persistence/URL validation, verify mobile and core behavior with tests, and complete repository hosting/deployment. This is the initial implementation, not a finished assignment submission.

### Additional screen

**Post Details** opens from a queue card and shows full content, optional media, platforms, local date/time, status, and failure reason. Failed posts can be retried here. Editing and deletion remain optional future enhancements.

## Screens we have to build

Only **two core screens** are needed. Filters, retry actions, and feedback belong inside these screens; they do not need separate pages.

| Screen name | Suggested route | Purpose |
| --- | --- | --- |
| **Post Queue Dashboard** | `/` | View all posts grouped by day, search and filter them, inspect status, and retry failed posts. |
| **Create Post / Post Composer** | `/compose` | Write content, select platforms, optionally add an image URL, choose a future date and time, and schedule the post. |

The composer can alternatively open as a desktop modal and a full-screen mobile panel. A dedicated route is a straightforward option for this assignment.

### 1. Post Queue Dashboard

- Header with application name and a **Create Post** button.
- Content search field.
- Platform filter: All platforms, Facebook, Instagram, X, TikTok.
- Status filter: All statuses, Scheduled, Published, Failed.
- Filters and search reflected in URL query parameters so they survive refresh and can be shared.
- Posts grouped by their scheduled date in the user's local time zone:
  - Today.
  - Tomorrow.
  - Explicit dates for every other day, including past dates.
- Each post card displays:
  - Content preview.
  - Platform icons with accessible labels.
  - Optional media thumbnail.
  - Local scheduled time.
  - Status badge.
  - Error message and **Retry** action for failed posts.
- Show a visible time-zone label so users understand the displayed times.
- Provide loading placeholders, a fetch-error state with a retry action, and empty states.
- Distinguish **no posts yet** from **no posts match the current filters**. Offer Create Post or Clear Filters respectively.
- Use layouts that remain usable on mobile and desktop.

### 2. Create Post / Post Composer

- Text area for post content.
- Multiple platform selection.
- Optional image URL field with preview and a graceful broken-image fallback.
- Date and time picker using the user's local time zone.
- Live character counter for every selected platform.
- Inline validation and a clear scheduling action.
- Pending, success, and submission-error feedback.
- Cancel/back navigation to the dashboard.
- After successful scheduling, return to the queue and show the newly created post with Scheduled status.

| Platform | Character limit |
| --- | ---: |
| X | 280 |
| Instagram | 2,200 |
| TikTok | 2,200 |
| Facebook | 5,000 |

Scheduling is blocked if any selected platform exceeds its limit, the selected time is not in the future, or other required fields are invalid. Exactly reaching a character limit is allowed.

## Functional requirements and behavior

### Mock post data

Provide a local JSON seed with **at least 30 posts** covering all platforms and all three statuses. Include single-platform and multi-platform posts, posts with and without images, and dates that demonstrate the queue grouping.

Each post must have:

```ts
type Platform = 'facebook' | 'instagram' | 'x' | 'tiktok';
type PostStatus = 'scheduled' | 'published' | 'failed';

interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  mediaUrl?: string;
  scheduledAt: string; // UTC ISO 8601, e.g. 2026-10-15T09:00:00.000Z
  status: PostStatus;
  errorMessage?: string; // Required when status is failed
}
```

Seed dates should be generated relative to the first launch date so Today and Tomorrow remain demonstrable. Persist the initialized dataset afterward.

### Search and filters

- Search matches post content, case-insensitively.
- Platform and status filters combine with search using AND behavior.
- A platform filter matches any post containing that platform, including multi-platform posts.
- Suggested URL: `/?platform=instagram&status=failed&q=launch`.
- Initialize controls from the URL on load; keep them synchronized with browser back/forward navigation.
- Ignore unknown query values safely and use the default filter value.

### Scheduling and time zones

- Require non-empty content, at least one platform, and a valid future date/time.
- Treat the selected date/time as local time, convert it to UTC before storage, and display it in local time throughout the queue.
- Recheck that the date is still in the future at submission time.
- Derive date groups from local calendar dates, not UTC date strings.
- All new posts begin with `scheduled` status.
- Prevent duplicate submissions while a scheduling request is pending.

### Retry failed posts

1. User selects Retry on a failed post.
2. Immediately update that post to Scheduled and clear its displayed error optimistically.
3. Mark that post as pending and prevent duplicate retries.
4. Simulate an API request with a **1-second delay**.
5. The request succeeds **80%** of the time and fails **20%** of the time.
6. On success, retain Scheduled status and persist the change.
7. On failure, restore the previous Failed state and show the retry error message.

With a Failed status filter active, an optimistically scheduled post may disappear from the results. Keep request feedback visible, and restore the post to the filtered queue if the request fails.

### Loading, empty, and error states

These are states within the two core screens, not extra screens:

| State | Expected UI |
| --- | --- |
| Initial loading | Queue skeletons or a clear loading indicator. |
| Queue load failure | Error message and Try Again action. |
| Empty dataset | Explanation and Create Post action. |
| No filter/search matches | Explanation and Clear Filters action. |
| Invalid composer input | Inline field errors and blocked submission. |
| Scheduling in progress | Pending button and duplicate-submit prevention. |
| Scheduling failure | Preserve the draft, show an error, and allow retry. |
| Retry in progress | Immediate optimistic update and visible pending feedback. |
| Retry failure | Rollback plus a clear error message. |
| Broken media URL | Image fallback without breaking the card or composer. |

## Proposed implementation decisions

- **React + TypeScript + Vite** for a focused frontend application; Next.js is also acceptable.
- **React Router** for the dashboard and composer routes and URL query handling.
- A small mocked API layer over local seed data, with simulated latency and failures.
- **localStorage** for created posts and successful status changes so work survives refresh. URL query parameters remain the source of truth for filters and search.
- A shared styled date/time picker with a calendar, month/year navigation, 12-hour time controls, quick presets, past-date restrictions, and `Intl.DateTimeFormat` for local time display. Local values convert to UTC on submission.
- Accessible form labels, keyboard interaction, focus handling, and status feedback that does not rely on color alone.
- Test the meaningful behavior: validation, URL filter restoration, UTC conversion/local grouping, and optimistic retry success and rollback.

These are proposed choices, not extra assignment requirements.

## Assumptions and scope boundaries

- No login, account linking, platform APIs, backend server, or actual publishing.
- A single post shares the same content, image URL, and scheduled time across its selected platforms.
- Optional media is provided by URL; file upload and media editing are outside scope.
- Retry changes a failed post back to Scheduled and retains its existing scheduled time, even if that time is in the past. This models a queued retry without introducing an unspecified rescheduling workflow.
- The future-time requirement applies to newly created posts. Existing published or failed mock posts may have past timestamps.
- Published posts are viewable but have no publishing or retry action.
- Editing, deleting, calendar views, analytics, notifications, and account settings are not required.
- Queue groups are ordered by date ascending, and posts within each group by scheduled time ascending.
- Character counting will use Unicode code points consistently. Platform-specific weighted counting rules are outside the assignment's stated limits.
- Simulated load and create errors should be reproducible through a development-only mock setting so error states can be reviewed.
- Local persistence is a convenience for the demo, not multi-user storage.

## Suggested 5-day delivery plan

| Day | Work |
| --- | --- |
| 1 | Set up React/TypeScript, routes, styles, post types, mock seed data, and queue layout. |
| 2 | Add date grouping, post cards, search, filters, and URL persistence. |
| 3 | Build the composer, character limits, validation, UTC storage, and local persistence. |
| 4 | Implement optimistic retry, loading/empty/error states, accessibility, and mobile polish. |
| 5 | Verify key behavior, finish documentation, deploy, and prepare submission. |

## Completion checklist

- [ ] React or Next.js application using TypeScript.
- [ ] At least 30 mock posts with the required fields and status coverage.
- [ ] Queue grouped by local day with previews, icons, times, and statuses.
- [ ] Platform/status filters and content search persisted in the URL.
- [ ] Composer with multiple platforms, optional image URL, and date/time picker.
- [ ] Live per-platform counters and over-limit submission prevention.
- [ ] Future scheduling, UTC storage, and local time display.
- [ ] Optimistic retry with a 1-second delay, 20% failure rate, and rollback.
- [ ] Loading, empty, and error states.
- [ ] Responsive mobile and desktop layouts.
- [ ] Meaningful behavior verified.
- [ ] GitHub or Bitbucket repository with progress commits and clear commit messages.
- [ ] README with installation/run steps, key decisions, and assumptions.
- [ ] Deploy to Vercel, Netlify, or similar and add the live URL to the README.
- [ ] Share the repository and live link with **bhanu@flintzy.com** when ready.

Repository creation, deployment, and submission are future delivery tasks; this planning step does not perform them.

## Scheduling picker

`src/components/DateTimePicker.tsx` replaces the native datetime input. It uses the shared Button component and includes calendar navigation, keyboard arrow navigation, today/selected indicators, hour/minute/AM-PM controls, quick presets, clearing, and future-time validation. Escape closes the picker before closing the composer. The expandable panel stays inside the dialog and scrolls with it on small screens.

Run the date/calendar checks with `npm test` (Node.js 22.6+).

## Theme switch

The header contains a sun/moon switch inspired by the supplied animation reference. Its blue indicator stretches across the track and settles on the selected icon over 650 ms, with synchronized surface color fades. Light/dark preference is saved locally and restored before React loads. The switch reuses Button, supports keyboard interaction and `role="switch"`, and respects reduced-motion preferences. Rapid reversals continue from the indicator's current position. Dark styling covers navigation, cards, dialogs, shared buttons, and the scheduling picker. Motion values are recreated from the video; original animation source was not supplied.
