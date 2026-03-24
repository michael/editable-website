# Manual

## MediaProperty

Renders an editable image or video slot with built-in placeholder and sizing logic.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `any[]` | required | Path to the media node |
| `sizing` | `'fill'` \| `'fit'` \| `'native'` | `'fill'` | Sizing mode (see below) |
| `fallback_aspect_ratio` | `string \| number` | `'16 / 9'` | Placeholder shape when empty (`fit`/`native`) |
| `fallback_width` | `number` | `200` | Placeholder width when empty (`native` only) |
| `class` | `string` | — | Class on the outer element |

### Sizing modes

**`fill`** — parent controls dimensions. No aspect ratio is set; the image fills whatever space the parent gives it.

```svelte
<div class="image-wrapper" style:aspect-ratio="4 / 3">
  <MediaProperty class="h-full" path={[...path, 'media']} sizing="fill" />
</div>
```

**`fit`** — image aspect ratio, full container width. The image determines its proportions but stretches to fill the parent's width.

```svelte
<MediaProperty path={[...path, 'media']} sizing="fit" fallback_aspect_ratio="16 / 9" />
```

**`native`** — image aspect ratio and native pixel size. The image renders at its authored CSS-pixel size (retina-aware: raster images are divided by `devicePixelRatio`, SVGs use viewBox dimensions directly). Useful for logos, icons, and small decorative elements.

```svelte
<MediaProperty path={[...path, 'media']} sizing="native" fallback_width={200} fallback_aspect_ratio="16 / 9" />
```
