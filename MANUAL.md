# Manual

## MediaProperty

Renders an editable image or video slot. The media fills whatever container you give it — you control the dimensions from the outside.

### Props

```ts
interface MediaPropertyProps {
	/** Path to the media node */
	path: any[];
	/** Class on the outer element */
	class?: string;
}
```

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

## Markdown pages

A deployment can expose selected repository markdown files as read-only pages rendered through the regular page components. Markdown stays the source of truth — nothing is written to the database, and the pages cannot be edited through any UI path (not even as admin).

### Configuration

Any markdown file in the repository can be mapped to a URL in `src/lib/content_config.js` (server/build-only — never import it from client code). Reference the file with an explicit `?raw` import, so Vite inlines exactly the mapped files and a missing file fails the build:

```js
import manual_md from '../../MANUAL.md?raw';

export const MARKDOWN_SOURCES = [
	{ markdown: manual_md, source: 'MANUAL.md', pathname: '/manual', toc: true }
];
```

- `markdown` — the imported file content
- `source` — the file's repo-relative path, so error messages point at the file to fix
- `pathname` — absolute single-segment URL the page is served at (nested paths are not supported yet)
- `toc` (optional) — generate a table of contents from the file's headings

With `MARKDOWN_SOURCES = []` the feature is inert. A configured pathname wins over a database page with the same slug. Configuration errors — unknown fields, duplicate pathnames, missing content — fail the dev server or production build immediately.

### Table of contents

With `toc: true`, the headings one level below the file's first heading become a linked list, inserted before the first of them. A typical manual has one `#` title followed by `##` chapters: the title and intro prose render first, then the table of contents, then the chapters. Headings get stable, human-readable ids derived from their text (`## Getting started` → `#getting-started`), so the links scroll in place and can be shared as URL fragments. Files with fewer than two chapter headings get no table of contents.

### Sections

Every `##` heading starts a new visual section: the heading and everything up to the next `##` (paragraphs, lists, code blocks) are grouped under one section mark on the page body, which renders them tightly together with more space between sections — the same section mechanism editable pages use. Content before the first `##` (typically the `#` title and intro) and the generated table of contents stay outside any section.

### Supported markdown

The converter accepts the subset of CommonMark that maps onto the built-in content model, and rejects everything else with an error naming the file, line, and column — authored text is never silently dropped or restructured:

- paragraphs, headings 1–5 (heading 6 is rejected)
- `**strong**`, `*emphasis*`, `` `inline code` ``, and `[links](/page)` — but not nested inside one another (marks are mutually exclusive in the content model, so e.g. bold text inside a link is rejected)
- unordered lists (rendered with dash markers) and ordered lists (rendered numbered); nested lists and multi-paragraph items are rejected
- fenced and indented code blocks (no syntax highlighting)
- link targets: `http(s):`, `mailto:`, site-absolute paths, and `#fragments`; other protocols and links to `.md` files are rejected

Not supported (rejected with an error): images, tables, blockquotes, raw HTML, thematic breaks, footnotes, YAML frontmatter, and GFM extensions. Page metadata (title, description) is derived from the first heading and paragraph, as for regular pages. Soft line wraps render as spaces and hard breaks render as line breaks (trailing backslash or two trailing spaces), matching how CommonMark renderers like GitHub's display the same file.
