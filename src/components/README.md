# Shared Button

All application buttons use `Button.tsx`. The native `<button>` is only defined inside that component.

Variants: `primary` (default), `secondary`, `outline`, `soft`, `danger`, `icon`, `text`, and `unstyled` for layout-specific controls such as navigation rows and backdrops.

```tsx
<Button startIcon={<Plus size={16} />}>Create post</Button>
<Button variant="secondary" onClick={onClose}>Cancel</Button>
<Button variant="soft" endIcon={<ArrowUpRight size={16} />}>More info</Button>
<Button variant="danger" startIcon={<Trash size={16} />}>Delete</Button>
<Button variant="icon" aria-label="Edit post"><Pencil size={16} /></Button>
<Button variant="text" startIcon={<ExternalLink size={16} />}>Read more</Button>
<Button loading={saving} loadingText="Saving…" type="submit">Save</Button>
<Button badge={4} shape="pill">Like</Button>
<Button variant="outline" size="lg" fullWidth>Verify email</Button>
```

`loading` disables the button and sets `aria-busy`. Optional loading text replaces the label; otherwise the label remains visible. Native button attributes, event handlers, ARIA attributes, and refs are forwarded. The default type is `button`; use `type="submit"` explicitly for form submission. Always provide an accessible label for an icon-only control. Motion respects reduced-motion preferences.

The existing warm gray/olive palette is retained; the supplied reference informs supported variants and composition rather than replacing the application's colors.

# Shared Select

`Select.tsx` replaces every native select in the application. It is a controlled single-select component accepting string or number values. Options can include icons, descriptions, and disabled states. Search is optional; the month and minute lists enable it. Menus use the browser top layer so they remain visible inside dialogs and scroll containers, and reposition above/below the trigger as space allows.

```tsx
<Select
  label="Filter status"
  value={status}
  onChange={setStatus}
  options={[
    { value: 'all', label: 'All statuses' },
    { value: 'scheduled', label: 'Scheduled', description: 'Ready in your queue' },
  ]}
/>
<Select label="Month" value={month} onChange={setMonth}
  options={monthOptions} size="sm" variant="ghost" searchable />
```

Keyboard support: Arrow Up/Down, Home/End, Enter/Space, Escape, Tab, and type-ahead. Disabled options are skipped. Choosing an option restores focus to the trigger. The component uses combobox/listbox semantics, selected-state check marks, light/dark styling, and an empty search state. All trigger and option buttons reuse Button. An optional `name` emits a hidden field for native form submission. Modern browsers with the HTML Popover API are required.

# Shared component inventory

| Component | Where used |
| --- | --- |
| `Button` | All buttons, including navigation, header, dropdown options, calendar, and dialogs. |
| `Select` | Platform and status filters; calendar month/year; schedule hour/minute/AM-PM. |
| `Avatar` | Sidebar contacts, sidebar profile, and header profile. |
| `Modal` | Composer, Post Details, and reference menu demo panels. |
| `MotionChevron` | Dashboard submenu and sidebar expand/collapse arrows. |
| `DateTimePicker` | Composer scheduling field; composed from Button and Select. |
| `ThemeSwitch` | Header theme control; composed from Button. |

DateTimePicker and ThemeSwitch currently have one application instance each but are isolated reusable components. Composer and the main application remain feature-specific components in `main.tsx`.

# Planner components

| Component | Reuse |
| --- | --- |
| `PostFilters` | Dashboard and All Posts filters. |
| `PostList` / `PostCard` | Dashboard, All Posts list view, and selected-day modal. |
| `PlatformIcon` / `StatusBadge` | Queue cards, filter options, and calendar previews. |
| `SegmentedControl` | List/calendar and week/month/year view selectors. |
| `CalendarToolbar` | Shared calendar navigation and view controls. |
| `PostCalendar` | Week and month calendar rendering. |
| `YearCalendar` | Year overview, delegating selected dates to the month view. |

The page owns calendar view/date state; reusable components receive typed data and callbacks. `src/lib/calendar.ts` contains separately tested local-day grouping, month/week ranges, URL date parsing, and period navigation. No post data is duplicated between views.

# Analytics components

- `DataTable<T>`: typed columns/renderers, row keys, semantic headings/caption, keyboard-accessible horizontal scrolling, and empty state.
- `MetricCard`: shared overview and per-post metric cards.
- `MetricChart`: accessible SVG trend with reusable values/labels, gradient, and textual values in its accessible name.
- `HeatmapValue`: normalized metric shading with exact-value tooltips and unavailable-data state.
- `SegmentedControl`: reused for Analytics sections and chart metrics with the same stretching animation as the planner.

All analytics values are mock fixtures and are generated only for published posts. The fixture calculations are separately tested in `tests/analytics.test.mjs`.
