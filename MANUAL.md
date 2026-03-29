# Manual

## MediaProperty

Renders an editable image or video slot. The media fills whatever container you give it — you control the dimensions from the outside.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `any[]` | required | Path to the media node |
| `class` | `string` | — | Class on the outer element |

### Basic usage

`MediaProperty` always uses `width: 100%; height: 100%` and fills its parent. You control the size and shape by setting dimensions on a wrapping container.

**Fixed aspect ratio** — the layout defines the shape, the image fills it via `object-fit`:

```svelte
<div class="overflow-hidden" style:aspect-ratio="4 / 3">
    <MediaProperty path={[...path, 'media']} />
</div>
```

**Intrinsic aspect ratio** — read the media node's dimensions so the container matches the image's natural shape:

```svelte
<script>
    let media_node = $derived(svedit.session.get([...path, 'media']));
</script>

<div
    class="overflow-hidden"
    style:aspect-ratio={media_node.width && media_node.height
        ? `${media_node.width} / ${media_node.height}`
        : '16 / 9'}
>
    <MediaProperty path={[...path, 'media']} />
</div>
```

The ternary provides a placeholder aspect ratio (`16 / 9`) shown when no image has been pasted yet. Once the user pastes an image, `media_node.width` and `media_node.height` are populated and the container adopts the image's natural proportions.

## SizableViewbox

Wraps a `MediaProperty` and gives the user drag handles to control `max-width` and `aspect-ratio`. Useful for inline images, logos, or anywhere the user should control the container size.

The node at `path` needs `{media_property}_max_width` (integer) and `{media_property}_aspect_ratio` (number) properties in the schema. A value of `0` means no constraint (full width / natural aspect ratio).

```svelte
<SizableViewbox {path}>
    <MediaProperty path={[...path, 'media']} />
</SizableViewbox>
```

For a different media property name (e.g. `logo` on a footer node):

```svelte
<SizableViewbox {path} media_property="logo" placeholder_aspect_ratio={1}>
    <MediaProperty path={[...path, 'logo']} />
</SizableViewbox>
```

Layout is the caller's responsibility — pass a class for centering, etc:

```svelte
<SizableViewbox {path} class="mx-auto">
```

In edit mode, three handles appear when the media inside is selected: left/right edges for width (snapped to 4px grid), bottom edge for aspect ratio. Dragging beyond the container snaps width back to `0`; dragging close to the media's natural ratio snaps aspect ratio back to `0`. The viewbox uses `max-width` + `width: 100%` so it never overflows its parent.
