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
