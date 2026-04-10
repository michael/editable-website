# Architecture

> **Work in progress** — this document is actively being developed and may change significantly. It was written with AI assistance and iterated on to serve as a specification for implementation.

This document describes the backend architecture for Editable Website v2.

## Overview

Editable Website is a SvelteKit application that lets site owners edit content directly in the browser. The editor (Svedit) works with a graph-based document model — a flat map of nodes with references between them. The backend stores these documents in SQLite and serves them to the frontend, stitching together shared content (nav, footer) with page-specific content into a single document that Svedit can edit locally.

The production architecture is database-backed and supports multiple pages, but the project must also continue to support static preview/local development mode (for example `VERCEL=1`) where the app falls back to the demo document. In that mode, only the `/` route needs to work, multi-page features are disabled, authentication is disabled, and code paths must avoid hard dependencies on server-only runtime features that would break static deployments.

## SvelteKit configuration

The app uses Svelte's experimental async features and SvelteKit's remote functions. Both are enabled in `svelte.config.js`:

```js
const config = {
  kit: {
    adapter: adapter(),
    experimental: {
      remoteFunctions: true
    }
  },
  compilerOptions: {
    experimental: {
      async: true
    }
  }
};
```

**Experimental async** allows `await` in Svelte markup and top-level `await` in `<script>` tags, enabling components to load data inline without separate `+page.server.js` load functions.

**Remote functions** (`$app/server`) allow server-side functions to be called directly from components via `query()` and `action()`. This replaces traditional REST endpoints for document loading and saving:

- **`src/lib/api.remote.js`** — server-side functions for document and asset operations, called directly from components. Uses `query()` for reads and `action()` for writes. Access to `locals` (e.g. for auth checks) via `getRequestEvent()`.

**Server initialization** — `src/hooks.server.js` exports an `init()` function (SvelteKit's `ServerInit` hook) that runs once on server startup. This is where database migration runs:

```js
import migrate from '$lib/server/migrate.js';

export async function init() {
  migrate();
}
```

The `handle` hook runs on every request and is where session validation and `event.locals.user` assignment will happen once authentication is implemented.

## Static / Vercel compatibility mode

Editable Website must preserve a lightweight static-compatible mode for preview deployments and single-page local development. This mode is currently used when the app runs in a Vercel-style environment (`VERCEL=1`) and should keep working even as the full multi-page setup is introduced.

**Requirements:**

- Only the `/` route must support static/Vercel mode.
- In static/Vercel mode, `/` renders from the existing demo document instead of the database.
- multi-page features are disabled in this mode at the **UI / integration** level:
  - no pages drawer
  - no links or flows that send the user to `/new`
  - no links or flows that send the user to dynamic `/:page_id` pages
- the multi-page routes may still exist in the codebase and may assume a full Node + database runtime; they just must not be linked to or otherwise used from the `VERCEL=1` branch.
- authentication is disabled in this mode.
- Client code must not hardwire imports or execution paths that force server-only database/remote-function behavior for the `/` route in static/Vercel mode.
- Be especially careful with top-level async imports and route setup so the static adapter / preview deployment path remains viable.

This means the app effectively has two operating modes:

1. **Full runtime mode** — database-backed, multi-page, shared nav/footer, authentication-ready
2. **Static/Vercel mode** — single-page demo-doc fallback on `/`, while multi-page routes may still exist but are not surfaced or used

The static/Vercel mode is a compatibility constraint on all future multi-page work.

## Data storage

All persistent data lives in a single directory, controlled by the `DATA_DIR` environment variable (defaults to `data/`):

```js
export const DATA_DIR = process.env.DATA_DIR || 'data';
const DB_PATH = join(DATA_DIR, 'db.sqlite3');
const ASSET_PATH = join(DATA_DIR, 'assets');
```

On Fly.io deployments, `DATA_DIR` points to a persistent volume (e.g. `/data`). Locally it defaults to `./data`.

```
data/
├── db.sqlite3                                # all documents
└── assets/
    ├── c4b519da...fabdb.webp                 # stored original (≤ MAX_IMAGE_WIDTH)
    ├── c4b519da...fabdb/
    │   ├── w320.webp                         # variant
    │   ├── w640.webp
    │   ├── w1024.webp
    │   └── w1536.webp
    ├── e7a3f1bc...abcd.mp4                   # video passthrough
    ├── f9c2d4ae...cdef.gif                   # animated gif passthrough
    └── ...
```

### SQLite database

The database uses Node.js's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) module (available since Node.js v22.5). No native addons to compile, no external dependencies — just the runtime.

The database (`DB_PATH`) contains five tables:

```sql
CREATE TABLE documents (
    document_id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    data TEXT
);

CREATE TABLE site_settings (
    key TEXT NOT NULL PRIMARY KEY,
    value TEXT
);

CREATE TABLE document_refs (
    target_document_id TEXT NOT NULL,
    source_document_id TEXT NOT NULL,
    PRIMARY KEY (target_document_id, source_document_id)
);

CREATE TABLE asset_refs (
    asset_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    PRIMARY KEY (asset_id, document_id)
);

CREATE TABLE sessions (
    session_id TEXT NOT NULL PRIMARY KEY,
    expires INTEGER NOT NULL
);
```

**`documents`**

- `document_id` — a persistent identifier (nanoid with a custom alphabet — letters only, no numbers, no `_` or `-` — so ids are safe to use as HTML ids; see `src/routes/nanoid.js`)
- `type` — categorizes the document, e.g. `page`, `nav`, or `footer`
- `data` — the full Svedit document serialized as JSON (`{ document_id, nodes }`)

Each document's `data` column contains a self-contained Svedit document: a `document_id` and a flat `nodes` map where every node is keyed by its `id`.

**`site_settings`**

A simple key-value table for site-wide configuration. Currently stores:

- `home_page_id` — the `document_id` of the page that renders at `/` (e.g. `page_1`)

**`document_refs`**

Tracks which documents link to which other documents. Updated on save — the server scans the document's nodes for internal links (annotations on text nodes that point to other pages) and rewrites the rows for that source document. Same pattern as `asset_refs`.

This table tracks links from all document types — pages, nav, and footer. Since nav and footer are stitched into every page, their links are always live. This is the basis for determining page reachability (see "Page reachability" below).

`document_refs` must also preserve the **first-seen link order** for each `source_document_id`, because the page browser sitemap uses that order when projecting the reachable graph into a tree. In other words, if a page body links to pages in the order A, then B, then C, the stored outgoing refs for that page must preserve A → B → C. Duplicate links to the same target are collapsed to the first occurrence only.

**`asset_refs`**

Tracks which assets are referenced by which documents. The compound primary key `(asset_id, document_id)` naturally deduplicates — a document referencing the same image five times still produces one row.

This table is the single source of truth for asset ownership. It enables cleanup of orphaned assets and makes cross-page copy-paste work without complications (pasted image nodes point to shared assets that already exist on disk).

**`sessions`**

- `session_id` — a cryptographically secure UUID (generated via `crypto.randomUUID()`)
- `expires` — Unix timestamp (seconds) when the session expires

Expired sessions are deleted on lookup. No background cleanup job needed.

### Assets

Assets (images, videos) are stored as files in `ASSET_PATH`. Assets are referenced from image nodes via their `src` property. The `asset_refs` table tracks which documents reference which assets.

## Documents

### Document types

- **Page documents** — each page on the site (e.g. home, about, blog posts). Contains all the page-specific nodes: prose, features, galleries, figures, etc. Also contains references to shared documents (nav, footer) via node properties.
- **Nav document** — a single shared document containing the navigation structure (`nav` node + `nav_item` nodes). Referenced by page documents via the `nav` property on the `page` node.
- **Footer document** — a single shared document containing the footer structure (`footer` node + `footer_link_column` + `footer_link` nodes). Referenced by page documents via the `footer` property on the `page` node.

### Page ids, slugs, and routes

Page documents continue to have a stable internal `document_id`, but public page URLs are **slug-based**, not id-based.

**Key rule:**
- `document_id` is the durable internal identity
- `slug` is the human-readable public route segment

Examples:
- internal id: `WRfteHhfPvzJBJjvFxQCEpg`
- public slug: `survey`
- public URL: `/survey`

This separation keeps internal references stable while allowing pretty URLs.

#### Slug generation

Auto-generated slugs are derived from the page summary title using the `slugify` package.

Use:
- `slugify(title, { lower: true, strict: true, trim: true })`

If no title can be extracted on save:
- fall back to the page's `document_id` as the slug source

If the generated slug is empty after slugification:
- fall back to the page's `document_id`

If the candidate slug collides with an existing active slug:
- generate a unique slug deterministically by suffixing
- examples: `survey`, `survey-2`, `survey-3`, ...

Auto-generated slugs are assigned once on first save and then remain stable until the user explicitly changes them:
- they are created on first save
- they do **not** auto-update when the extracted title changes later
- they must **not** overwrite a user-defined custom slug
- they must **not** take over a slug that is currently active on another page
- they must **not** take over a slug that is currently reserved as a historical alias of another page

#### Slug ownership and history

The system needs a durable mapping from slugs to page documents, including old slugs that should continue to resolve.

A page therefore has:
- one **current active slug**
- zero or more **historical slugs**

Historical slugs exist so that when a page's active slug is changed later, old shared URLs do not break.

This requires a slug mapping table in the database rather than storing only a single slug string on the page row.

Conceptually, the mapping must support:
- resolving a slug to a `document_id`
- distinguishing the current active slug from historical aliases

#### Custom slugs

Users can change a page's Page URL from the page browser ellipsis menu.

When a user changes a page's slug:
- that slug becomes the page's active slug
- the previously active slug becomes a historical alias unless that slug is explicitly reassigned to another page

User-facing behavior should stay simple:
- the UI shows the current Page URL
- the UI can describe it in user-facing copy as "the Page URL your page will be reachable at"
- the UI can present it as `example.com/[your-slug-here]`, with only the part after the slash editable
- the UI does not expose an "auto mode" vs "custom mode" concept
- the system auto-generates the first slug on first save
- after that, the slug stays stable unless the user explicitly changes it

This keeps the mental model simple for users while preserving deterministic behavior internally.

#### Slug collisions and reassignment

If a user tries to assign a slug that is already used elsewhere, there are two collision cases:

**Case A — the slug is the active slug of another page**

This is rejected.

The UI should explain that:
- this address is currently in use by another page
- the user must first rename that other page if they want to free up this address
- no automatic reassignment of another page's active slug is ever performed in the background

This keeps active page URLs stable and avoids surprising background rewrites.

**Case B — the slug is only a historical alias of another page**

The UI must offer:
1. **Cancel** — keep everything unchanged
2. **Enforce** — claim that address for the current page

If the user chooses **Enforce**:
1. remove that historical alias from the page that currently owns it
2. assign the slug as the new active slug of the target page
3. if the target page's active slug changed, rewrite all internal links that target the target page
4. do not change the other page's active slug, because it did not lose its current slug

This is the one case where an old slug should **not** remain as a historical alias for the previous owner, because the slug has been intentionally reassigned.

#### Link rewriting rule

Internal page links are slug-based, so whenever a page's active slug changes, all internal links that target that page must be updated to the new slug.

This applies to:
- manually changing a page slug
- enforcing reassignment of a historical alias from one page to another

This is a deliberate tradeoff:
- stable ids would make link maintenance simpler
- but pretty shareable URLs are more important for this product

The system therefore treats slug changes as a graph rewrite operation, not just a local page metadata update.

#### Resolution rules

Slug resolution must behave as follows:

- `/` still resolves to the configured home page
- `/:slug` resolves by looking up the slug mapping table
- if the slug is the current active slug of a page, load that page
- if the slug is a historical alias of a page, also load that page
- if the slug is unknown, return 404

For canonicalization:
- if a request comes in via a historical alias, the app should still resolve the page
- the response must issue a `301` redirect to the page's current active slug
- old slugs continue to work only as redirecting aliases unless that slug has been explicitly reassigned to another page
- `/` is always the canonical URL for the home page
- the home page itself is not user-switchable as a different page; users edit the home page's content rather than reassigning which page is home
- slug editing is hidden entirely for the home page in the page browser UI

### Document composition

Svedit operates on a single flat document — it has no concept of "shared" vs. "local" nodes. The server is responsible for stitching documents together on read and splitting them apart on write.

**On read (loading a page):**

1. Resolve the incoming slug to a page document
2. Fetch the page document from the database
3. Read the `nav` and `footer` references from the page's root node
4. Fetch those shared documents from the database
5. Merge all nodes into a single flat `nodes` map
6. Return the combined document to the client

```
slug mapping           page document          nav document          footer document
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ survey       │─────▶│ page_1       │      │ nav_1        │      │ footer_1     │
│ about        │      │   nav: nav_1 │─────▶│ nav_item_1   │      │ footer_col_1 │
│ old-survey   │──┐   │   footer: …  │──┐   │ nav_item_2   │      │ footer_lnk_1 │
└──────────────┘  │   │ prose_1      │  │   │ ...          │      │ ...          │
                  │   │ feature_1    │  │   └──────────────┘      └──────────────┘
                  └──▶│ ...          │  └────────────────────────────────▲
                      └──────────────┘

                           combined document sent to client
                    ┌──────────────────────────────────────────┐
                    │ page_1, nav_1, nav_item_1, ...           │
                    │ prose_1, feature_1, ...                   │
                    │ footer_1, footer_col_1, ...               │
                    └──────────────────────────────────────────┘
```

**On write (saving a page):**

1. Receive the combined document from the client
2. Determine which nodes belong to the nav document, the footer document, and the page document (by walking the graph from each root node)
3. On first save only, extract the page summary title and assign the page its first slug using `slugify`, falling back to `document_id` if needed
4. On later saves, keep the existing active slug unchanged unless the user explicitly changed it through the slug editing flow
5. If the active slug changes, update slug mappings and rewrite all internal links that target that page
6. Write each document back to its own row in the database

This means changes to the nav or footer made on any page are persisted to the shared document and will be reflected on all pages.

### New pages (`/new`)

The `/new` route uses an **ephemeral client-created document**. When the user opens `/new`, the client creates a fresh page document locally using the existing nanoid generator. The generated id is used immediately for both:

- the document's `document_id`
- the root page node's `id`

This id is stable from the beginning, even before the document is persisted. The page remains ephemeral only in the sense that it is not stored in the database until the first save.

The transient `/new` document must be composed from the **current shared nav and footer documents in the database**, not from the static demo document. This ensures that if shared nav or footer content has been edited elsewhere, the new page starts from that latest shared state.

On first save:
- the client sends that already-generated id to the server with `create: true`
- the server persists the page under that id if it does not already exist
- the server also assigns the page its first active slug
- that first slug is auto-generated from the extracted title, or falls back to the id if no title can be extracted

No server-side id allocation or root-id rewrite is needed.

The `/new` route starts in edit mode immediately.

If editing is cancelled on `/new`, the ephemeral document is discarded and the app returns to `/`.

## Assets

### Media node types

There are two media node types: `image` and `video`. Each has the same visual properties (they fill containers identically), plus type-specific extras.

> **Future:** a third type `audio` may be added later.

**`image`** — static images (stored as WebP), animated GIFs, SVGs:

```json
{
    "id": "feature_1_image",
    "type": "image",
    "src": "c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb.webp",
    "width": 1600,
    "height": 900,
    "alt": "Feature image",
    "scale": 1.0,
    "focal_point_x": 0.5,
    "focal_point_y": 0.5,
    "object_fit": "cover"
}
```

**`video`** — MP4 (WebM may be added later):

```json
{
    "id": "hero_video",
    "type": "video",
    "src": "e7a3f1bc...abcd.mp4",
    "width": 1920,
    "height": 1080,
    "alt": "Product demo",
    "scale": 1.0,
    "focal_point_x": 0.5,
    "focal_point_y": 0.5,
    "object_fit": "cover"
}
```

Video has the same properties as image. No `duration` — the browser reads it from the file on playback. This keeps video and image nodes structurally identical except for `type`, which simplifies the schema and paste logic.

### Media property

Container nodes that currently have an `image` property referencing only `["image"]` need to be widened to also accept `"video"`. The property is **renamed from `image` to `media`** to reflect that it can hold either type. This affects:

- `gallery_item.image` → `gallery_item.media`
- `figure.image` → `figure.media`
- `feature.image` → `feature.media`
- `link_collection_item.image` → `link_collection_item.media`
- `nav.logo` and `footer.logo` — **stay as `logo`**, but widen to `["image", "video"]`

Each of these becomes:

```
type: 'node', node_types: ['image', 'video'], default_node_type: 'image'
```

The `default_node_type` stays `image` — when inserting a new empty container, it starts with a placeholder image node.

**Migration:** existing documents have the old property name `image`. On document load, the server (or a one-time migration) renames `image` → `media` on affected node types. Existing `image` nodes inside those properties are valid — their `type` is still `"image"`, only the property name on the parent changes.

### Visual treatment

Both media types fill their container the same way visually. Images and videos use `object-fit` (toggled between `cover` and `contain` via double-click) and position via `focal_point_x/y`. Zooming (scroll wheel to adjust `scale`) and panning (drag to move `focal_point_x/y`) work identically for both media types.

### MediaControls

`MediaControls.svelte` (renamed from `ImageControls.svelte`) provides the zoom/pan overlay for both images and videos. It reads `scale`, `focal_point_x`, `focal_point_y`, and `object_fit` from the node at `path` — no type-specific logic. The same crosshair marker, drag-to-pan, scroll-to-zoom, and double-click-to-toggle-object-fit behavior applies to both media types.

`Overlays.svelte` shows `MediaControls` whenever a media node (image or video) is selected as a property. The selection check is `is_media_selected`: `selected_property?.type === 'image' || selected_property?.type === 'video'`.

### Video.svelte component

`Video.svelte` receives the same `path` prop as `Image.svelte` and reads the same visual properties. It renders a `<video>` element with:

- `autoplay`, `muted`, `loop`, `playsinline`, `disablepictureinpicture` — videos play silently and loop like background/ambient video. No play button, no controls visible inline.
- `src` resolved the same way as images: blob URLs used directly, saved asset ids prefixed with `ASSET_BASE`.
- `object-fit`, `object-position`, and `transform: scale(...)` applied identically to how `Image.svelte` does it.
- `width` and `height` attributes set from node properties.
- `contenteditable="false"` to prevent the browser from trying to edit the video element.
- No `srcset` or variants — videos are served as-is.
- The `alt` property is rendered as `aria-label` on the `<video>` element.
- **Autoplay handling:** uses `$effect` with multiple retry strategies — checks `readyState >= 2`, listens for `canplay`/`loadeddata`, and falls back to `setTimeout`. This handles late hydration where readiness events may have already fired.
- **Click-to-fullscreen (published view only):** clicking the video enters native fullscreen with controls enabled and audio unmuted. On fullscreen exit (including iOS Safari's `webkitendfullscreen`), the video restores to muted inline autoplay. iOS sometimes re-pauses ~400ms after play succeeds, so a `setTimeout(500)` retry is needed. Inline-playing videos show `cursor: zoom-in`.
- **Edit mode:** click-to-fullscreen is disabled — `MediaControls` overlay captures pointer events for zoom/pan instead.

The `image-resize` project's `src/lib/components/Video.svelte` is the reference implementation for autoplay, fullscreen, and iOS handling.

### Video metadata extraction

When a video file is pasted/dropped, the client needs `width` and `height` for the node. This is extracted by creating a temporary `<video>` element, setting its `src` to the blob URL, and reading `videoWidth` / `videoHeight` after the `loadedmetadata` event fires. This runs as part of the paste handler before creating the node.

### Handle media paste

The current `handle_image_paste` callback is renamed to `handle_media_paste` to reflect that it handles both images and videos. Svedit's paste system already filters for image and video MIME types — the callback receives all pasted media files.

The paste handler uses `get_media_type(file)` to map each file's MIME type to a node type:

```js
/** @returns {'image' | 'video'} */
function get_media_type(file) {
    if (file.type.startsWith('video/')) return 'video';
    return 'image';
}
```

This returns the Svedit node type that corresponds to the file. Currently only `'image'` and `'video'` — `'audio'` can be added later.

**When pasting over an existing media node** (property selection on an image or video node): if `get_media_type(file)` matches the existing node's `type`, replace `src` on the existing node (current behavior). If it differs (e.g. pasting a video over an image), **replace the entire node** — create a new node of the correct type, delete the old node, and update the parent's `media` reference. This works because the parent's `media` property allows both `["image", "video"]`.

**When pasting into a container** (text selection / inserting new nodes): use `get_media_type(file)` to decide the child node type. The wrapper node (`gallery_item` or `figure`) uses `media` as the property name.

### Video in the asset pipeline

Videos are **passthrough** assets — no client-side processing, no variants.

**`start_processing`** (in `asset-upload.js`): detects video MIME types (`video/mp4`, `video/webm`) and creates a pending asset entry with the file as-is. The hash is computed from the source file. The stored extension matches the source (`.mp4` or `.webm`). No WASM processing, no variants. The entry goes straight to `status: 'ready'`.

**`collect_blob_urls`**: currently only collects from `type === 'image'` nodes. Must also collect from `type === 'video'` nodes.

**`replace_blob_urls`**: currently only replaces on `type === 'image'` nodes. Must also replace on `type === 'video'` nodes.

**`upload_asset`**: currently assumes image content types. Must map the asset extension to the correct MIME type: `.mp4` → `video/mp4`, `.webm` → `video/webm`.

**`ensure_processing`**: when re-fetching a blob URL for a video, must detect the MIME type and skip WASM processing (same passthrough as initial paste).

### No asset table

Assets are **not** tracked as separate entities in the database. There is no `assets` table. Media nodes reference asset files directly via their `src` property.

### The `src` field

The `src` field has exactly two modes — no other values are valid:

- **During editing (unsaved):** a blob URL (e.g. `blob:http://localhost:5173/a1b2c3d4`). The media displays immediately using the browser's in-memory blob. This is a temporary reference that only lives for the duration of the editing session.
- **After save (persisted):** a bare asset id (e.g. `c4b519da...fabdb.webp`). The blob URLs are replaced with asset ids during the save flow, after all assets have been successfully uploaded.

Absolute URLs, external URLs, and relative paths are never valid `src` values. All media must be uploaded through the asset pipeline — this ensures the site is fully self-contained and portable. The UI does not allow setting `src` manually.

Each media component (`Image.svelte`, `Video.svelte`, `Audio.svelte`) checks the `src` value: if it starts with `blob:`, use it directly. Otherwise, prefix it with `ASSET_BASE` (defaults to `/assets`) to construct the full URL. The `ASSET_BASE` route serves files from `ASSET_PATH` on disk.

The asset id includes the file extension (e.g. `.webp`, `.mp4`, `.mp3`), so the serving layer can resolve the file directly without a database lookup.

A media node that appears on one page is local to that page's document. If the same asset needs to appear on multiple pages, each page has its own media node pointing to the same asset file. The file on disk is shared, but the node metadata (alt text, focal point, scale, object fit) is per-usage.

### Asset ids and deduplication

The asset id is the **SHA-256 hex hash** of the user's source file **plus the file extension** of the stored format — e.g. `c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb.webp`. The hash is always computed on the **untouched source file** the user provides (e.g. the original PNG or JPEG), not on the processed WebP output. This ensures the same source file always produces the same id, regardless of encoder version, quality settings, or other processing parameters. The extension is determined by the stored format: static images are always converted to WebP (so the extension is `.webp`), while videos, animated GIFs, and SVGs keep their original extension (`.mp4`, `.webm`, `.gif`, `.svg`).

Because the id is content-derived, inserting the same file twice produces the same id — the upload is skipped and the existing asset is reused. No duplicate files on disk, no wasted storage.

The client computes the hash from the source file before any processing begins. If the server already has a file with that id, it returns the existing asset metadata immediately without accepting the upload body.

### No original filenames

Original filenames are never stored. All asset metadata (alt text, dimensions, scale, focal point) lives on the media node inside the document, not on the asset itself. This means metadata is page-local and redundant by design — changing alt text on one page doesn't affect another page that uses the same asset. It also avoids privacy concerns: user-generated filenames are never exposed via public URLs or headers.

For downloads, the server sets a `Content-Disposition` header using the first 8 hex characters of the hash as the filename — e.g. `Content-Disposition: inline; filename="c4b519da.webp"`. Short enough for a downloads folder, unique enough to avoid collisions in practice, and free of any user-generated content.

### Asset path convention

The original is stored with its extension, and width variants (images only) live in a subdirectory:

```
data/assets/
├── c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb.webp
├── c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb/
│   ├── w320.webp                            # variant
│   ├── w640.webp
│   ├── w1024.webp
│   └── w1536.webp
├── e7a3f1bc90d245678901234567890abcdef1234567890abcdef1234567890abcd.mp4
├── f9c2d4ae51b367890123456789abcdef0123456789abcdef0123456789abcdef.gif
└── ...
```

The image node's `src` stores the asset id (e.g. `c4b519da...fabdb.webp`). The `width` and `height` of the original are stored on the image node. Full URLs are constructed at render time by prepending `/assets` (which maps to `ASSET_PATH` on disk). Variant URLs are derived by stripping the extension from the asset id to get the stem, then appending `/w{width}.webp` — no database lookup needed for `srcset`:

```
asset id     = c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb.webp
stem         = c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb

original URL = /assets/{asset id}
variant URL  = /assets/{stem}/w320.webp
```

```html
<img
    src="/assets/c4b519da...fabdb.webp"
    srcset="
        /assets/c4b519da...fabdb/w320.webp 320w,
        /assets/c4b519da...fabdb/w640.webp 640w,
        /assets/c4b519da...fabdb/w1024.webp 1024w,
        /assets/c4b519da...fabdb.webp 1600w
    "
/>
```

Variants wider than the original are not generated (no upscaling). The original always serves as the largest variant.

### Media type handling

Different media types are handled differently:

The asset id always includes the file extension. The stem (id without extension) is used to derive the variant directory.

| Type | Node type | Client processing | Asset id example | Variants |
|---|---|---|---|---|
| Static images (JPEG, PNG, WebP, HEIC) | `image` | Resize to `MAX_IMAGE_WIDTH`, convert to WebP via WASM | `c4b519da...fabdb.webp` | Yes (`c4b519da...fabdb/w320.webp`, etc.) |
| Animated GIFs | `image` | Passthrough | `c4b519da...fabdb.gif` | No |
| SVGs | `image` | Passthrough | `c4b519da...fabdb.svg` | No |
| Videos (MP4) | `video` | Passthrough | `c4b519da...fabdb.mp4` | No |

### Image size constraints

Variant widths are fixed:

```
VARIANT_WIDTHS = [320, 640, 1024, 1536, 2048, 3072, 4096]
```

`MAX_IMAGE_WIDTH` is the largest value in this list (4096). These values never change.

**Rules:**

1. If the source image is wider than `MAX_IMAGE_WIDTH`, resize it down to `MAX_IMAGE_WIDTH` before storing.
2. Store the original at its actual width (e.g. a 2500px image is stored at 2500px, not rounded to a standard width).
3. Generate variants for every width in `VARIANT_WIDTHS` that is **strictly smaller** than the stored original's width. Never upscale.

**Example:** user uploads a 2500px wide image → original stored at 2500px, variants generated at 320, 640, 1024, 1536, 2048. Widths 3072 and 4096 are skipped.

Width only is constrained, not height. `srcset` widths map to viewport widths, so height is irrelevant for responsive image selection. Tall images (e.g. 2000×8000 infographics) are a legitimate use case — file size is bounded by the width constraint combined with WebP compression.

### Client-side image processing

All image resizing and format conversion happens **client-side** using WebAssembly, keeping the server simple (no Sharp, no image processing dependencies, no CPU spikes).

The processing pipeline uses `@jsquash/webp` (libwebp compiled to WASM) for WebP encoding and `@jsquash/resize` (Lanczos3 resampling) for resizing, running in a Web Worker to avoid blocking the main thread.

For each image the user pastes or drops:

1. **Decode** — `createImageBitmap` + `OffscreenCanvas` → `ImageData` (browser-native, handles all common formats)
2. **Resize original** — if width > `MAX_IMAGE_WIDTH`, resize down preserving aspect ratio
3. **Encode original** — encode as WebP (quality 80)
4. **Generate variants** — for each configured width smaller than the original: resize → encode as WebP

Images are processed one at a time. After generating all variants for one image, raw pixel data is released. Only the encoded WebP blobs are kept in memory until the next save.

### Variant widths

See [Image size constraints](#image-size-constraints). The variant widths are fixed and must not be changed. The original always serves as the largest size in `srcset`.

### Paste flow

When the user pastes or drops files into a Svedit document:

1. `handle_media_paste` creates image or video nodes immediately (based on MIME type), with `src` set to a blob URL of the source file. Media displays instantly — no waiting for processing.
2. For video files, width and height are extracted via a temporary `<video>` element (`loadedmetadata` → `videoWidth`/`videoHeight`) and set on the node.
3. The client computes the SHA-256 hash of the source file. This hash (plus extension) will become the asset id on save.
4. Background processing starts. For images: decode → resize → encode original as WebP → generate all width variants. For videos: passthrough (hash only, no processing). Processing is keyed by the blob URL that sits in the node's `src`.
5. The user can continue editing, paste more files, or rearrange content. Background processing does not block the editor.
6. Videos, animated GIFs, and SVGs skip client-side processing — they're stored as-is.

### Save flow

When the user saves, an all-or-nothing upload+save operation runs:

1. **Wait for processing.** If any pasted images are still being processed in the background, the save waits for them to finish before proceeding. The user sees a progress indication — the save just takes a bit longer.

2. **Upload assets.** For each image node whose `src` is a blob URL (i.e. not yet uploaded):

   a. **Check for duplicates.** Send the asset id (content hash + extension) to the server. If the asset already exists (original + all variants on disk), skip uploading — go to step 2d.

   b. **Upload original.** Stream the original WebP blob to the server. Server stores it at `data/assets/{asset_id}`.

   c. **Upload variants.** Upload each variant sequentially: `POST /api/assets/{asset_id}/variants` with WebP blob + `X-Variant-Width` header. Server stores at `data/assets/{stem}/w{width}.webp`. **If any variant upload fails, the server deletes the original and all variants for that asset id, and the save is aborted.** A partially uploaded asset (missing variants) is not acceptable — it would produce a broken `srcset`.

   d. **Record the mapping.** Map the blob URL → asset id so `src` values can be replaced in step 3.

   If any asset fails to upload entirely (i.e. the original upload fails, or variant upload fails and the server cleans up), the save is **aborted with an error message**. Assets that were successfully uploaded in earlier iterations are left on the server — they are valid, complete assets. On the next save attempt, deduplication will skip them.

3. **Replace blob URLs.** Walk all image nodes in the document. For every `src` that is a blob URL, replace it with the corresponding asset id. Also update `width` and `height` to the processed dimensions (which may differ from the source if the image was resized down to `MAX_IMAGE_WIDTH`).

4. **Save the document.** Upload the document JSON to the server. The server splits shared documents (nav, footer), updates `asset_refs`, and writes to SQLite.

**Atomicity boundary:** the unit of atomicity is the individual asset (original + all its variants). Either a complete asset is on the server, or nothing is. The document is only saved after all assets are successfully uploaded. If the save fails partway through asset uploads, the user sees an error and can retry. Orphaned assets (uploaded but not yet referenced by a saved document) are harmless and will be cleaned up by the normal asset cleanup process.

### Asset reference tracking

The `asset_refs` table is updated on every document save as part of the same save operation:

1. Walk the document's nodes, collect all `src` values from media nodes (image, video) → the current set of asset ids
2. Delete all existing `asset_refs` rows for that `document_id`
3. Insert the new set of `(asset_id, document_id)` pairs

This is a full replace per document — simple, idempotent, and always consistent with the actual document content. No diffing needed.

Since the server already walks the document on save to split out shared documents (nav, footer), collecting asset references happens in that same walk.

Note: shared documents get their own refs. If the nav has a logo image, that ref lives under `nav_1`, not under every page that includes the nav. The asset belongs to the nav document.

### Asset cleanup

On document deletion:

1. Collect the asset ids referenced by the document (from `asset_refs`)
2. Delete all `asset_refs` rows for that `document_id`
3. For each affected asset, check if any references remain: `SELECT 1 FROM asset_refs WHERE asset_id = ?`
4. If zero references remain → delete the asset files from disk (original + variant directory)

This can also run on save if a document previously referenced assets it no longer does — the full-replace logic in "asset reference tracking" naturally drops those rows, and the save handler can check for newly unreferenced assets.

## API endpoints

### Documents

- `GET /api/documents/:slug` — load a page document by slug (with shared documents stitched in)
- `PUT /api/documents/:slug` — save a document addressed by its current slug; server resolves slug → document, splits shared nodes back out, updates `asset_refs`, updates slug mappings if needed, and rewrites internal links if the active slug changes
- First save from `/new` still uses the same save path with `create: true`. The page id is already client-generated via nanoid, so the server persists that exact id and assigns the first active slug during save.

### Internal page href rules

Internal page links use the dynamic `/:slug` route shape.

All persisted internal page URLs are stored as href strings, so link rewriting should inspect every schema property named `href` and update any internal page URL found there.

**Valid internal page hrefs:**

- `/${slug}` — a direct link to another page document
- `/` — the configured home page
- `/${slug}#section` — counts as a link to the page resolved by `${slug}` for reachability and `document_refs`; the fragment is ignored for graph purposes
- `/#section` — counts as a link to the home page only if it is used from a different page; when used on the home page itself, it is just an intra-page anchor and does not create a document reference

**Not internal page links:**

- pure same-page anchors (for example `#section`, or `/#section` on the home page, or `/${current_page_slug}#section` on that same page)
- external URLs
- any other href that does not resolve to `/` or `/:slug`

When extracting `document_refs`, fragments are stripped before evaluating the target page. The graph tracks document-to-document references only, never section-level anchors.

For graph purposes, internal links should be normalized to the target page's `document_id` after slug resolution. This ensures that slug changes do not change the underlying reference graph identity.

### Assets

- `HEAD /api/assets/:asset_id` — check if an asset exists (original + all expected variants). Returns `200` if complete, `404` if not. Used by the client to skip uploading duplicates.
- `POST /api/assets` — upload an original. Headers: `X-Content-Hash` (SHA-256 hex), `Content-Type`. Returns `{ id, width, height }`. Content-Type must match the file type: `image/webp`, `image/gif`, `image/svg+xml`, `video/mp4`, etc.
- `POST /api/assets/:asset_id/variants` — upload a pre-generated width variant. Headers: `X-Variant-Width`. Body: WebP blob. (Images only — videos have no variants.)
- `DELETE /api/assets/:asset_id` — delete an asset and all its variants from disk. Used by the client to clean up after a failed variant upload.
- `GET /assets/:asset_id` — serve the original (from `ASSET_PATH` on disk)
- `GET /assets/:stem/w:width.webp` — serve a width variant

Asset serving endpoints return `Cache-Control: public, max-age=31536000, immutable` — asset ids are content-addressed, so they can be cached forever.

Video originals support HTTP Range requests for seeking.

## No asset manager

There is no asset manager UI and no "pick from existing assets" panel. Adding media always means selecting files from your computer and pasting them into the document — similar to how Google Docs works.

To reuse media that's already on the site, navigate to the page that has it, copy the node (e.g. a gallery item or figure), and paste it into the target page. The pasted media node points to the same shared asset on disk — no re-upload needed. This keeps the interface simple and avoids building a separate media library.

## Admin interface

The only admin interface is a **site map** — a listing of all pages plus drafts (pages that are not linked anywhere yet). There is no need for a media library, asset browser, or content management dashboard beyond this.

### Page reachability

A page is **reachable** (and appears in `sitemap.xml`) if it can be reached by following links starting from the home page, nav, or footer. This is a transitive check — a page linked only from a draft is still a draft, because the draft itself isn't reachable.

This reachability logic only applies in the full database-backed multi-page runtime. In static/Vercel compatibility mode there is no live multi-page graph, no sitemap drawer, and no draft/public distinction — the app simply serves the demo document at `/`.

The traversal starts from three roots:

1. The home page (`home_page_id` from `site_settings`)
2. `nav_1` — its links are live on every page
3. `footer_1` — same

From these roots, follow all outgoing `document_refs` recursively to collect the full set of reachable pages. Any page document not in this set is a **draft**. Drafts are visible in the admin site map but not included in `sitemap.xml`. This is a live query — not a precomputed cache — so it always reflects the current state of `document_refs` and `site_settings`.

A single query returns all pages with a computed `status` column:

```sql
WITH RECURSIVE reachable(document_id) AS (
    SELECT value FROM site_settings WHERE key = 'home_page_id'
    UNION SELECT 'nav_1'
    UNION SELECT 'footer_1'
    UNION
    SELECT target_document_id FROM document_refs
    JOIN reachable ON reachable.document_id = source_document_id
)
SELECT d.document_id, d.data,
    CASE WHEN r.document_id IS NOT NULL THEN 'public' ELSE 'draft' END AS status
FROM documents d
LEFT JOIN reachable r ON d.document_id = r.document_id
WHERE d.type = 'page';
```

This serves both the admin site map (all rows) and `sitemap.xml` (filter `WHERE status = 'public'`).

This query is cheap — most sites have tens to low hundreds of pages. It runs on demand: when serving `/sitemap.xml`, when rendering the admin site map, or when checking whether a specific page is public. There is no background sync or precomputed reachability table — the query is the source of truth.

`document_refs` is updated on save for all documents, including drafts. A draft's outgoing links are already tracked, so when it becomes linked from a live page, its targets are immediately reachable without re-saving.

When the home page is changed via `site_settings`, pages that were only reachable through the old home page's link tree may become drafts. This is expected — they're still visible in the admin site map and can be re-linked or deleted.

### Sitemap tree construction

The admin page browser needs not just a reachable/unreachable split, but also a deterministic **tree projection** of the reachable page graph.

The tree is built with these rules:

- **No duplicates in the tree** — each reachable page appears at most once
- **First occurrence wins** — if a page is referenced multiple times, its canonical position is the first position where it is encountered during traversal
- **Top-level ordering:** traverse references from the home page in this order:
  1. shared nav links
  2. home page body links
  3. shared footer links
- **Recursive ordering:** once a child page has been placed in the tree, recurse into that page using **body links only**
- **Within each source document, preserve author order:** outgoing refs are consumed in the same order they appear in the source document, with duplicates removed by first occurrence

This means the sitemap is not a full graph visualization. It is a stable, editor-friendly tree derived from the reachable graph, where shared navigation and footer establish the top-level site structure, and deeper nesting comes from contextual links inside page content.

If a page is linked from multiple places, later occurrences are ignored for tree placement. This keeps the page browser compact and avoids crowded duplicates. If needed in the future, secondary references can be surfaced separately (for example as “also linked from…” metadata), but they are not duplicated in the primary tree.



### Page summaries for the drawer

The page drawer needs lightweight summaries for each page:

- a display title
- an optional preview image
- the current active slug
- whether that slug is auto-generated or custom

For the initial implementation, title and preview summaries are extracted **on the fly** in a server-side helper used by the page-browser query. They are **not** cached in the database yet. This keeps the system simple and avoids introducing additional summary columns or synchronization logic before there is evidence that summary extraction is a performance problem.

Summary extraction should only inspect the **page-local body content**. Shared `nav` and `footer` content must not influence a page's summary, because that would cause many pages to inherit the same logo, links, or other shared content as their title/preview.

**Title extraction order:**

1. explicit `page.title` if that field exists and is non-empty
2. otherwise, the first heading-like `text` node found in body order
3. otherwise, the first meaningful body text content
4. fallback to `"Untitled page"`

The exact heading-like layouts are defined by the page schema / text node semantics in the current implementation. The important part is that heading-like content is preferred over arbitrary text properties.

This same extracted title is also the source for the initial auto-generated slug assigned on first save.

**Preview image extraction order:**

1. explicit page-level preview image field if one is added in the future
2. otherwise, the first image or video found while traversing the page body in document order
3. fallback to `null`

Because the drawer already has a strong illustrated page fallback, `null` is perfectly acceptable and does not require a placeholder asset.

If this on-the-fly extraction later proves too costly, the same extraction helper can become the canonical summary generator for a cached summary written on save. But caching is an optimization step for later, not part of the initial multi-page implementation.

### Page slug management from the drawer

The page drawer ellipsis menu must support slug management in addition to page actions.

For this architecture step, the menu needs to support:

- `Open in new tab`
- `Set custom slug`
- `Delete`

The slug editing flow must cover these cases:

#### User-facing slug editing model

The page browser should present Page URL editing in a simple way:
- show the current Page URL
- allow the user to change it
- describe it in user-facing copy as "the Page URL your page will be reachable at"
- present it as `example.com/[your-slug-here]`, with only the part after the slash editable
- do not expose "auto mode" or "custom mode" terminology in the UI

This gives users a simple mental model:
- "the Page URL is whatever is currently shown"
- "the system picks an initial Page URL for me"
- "if I change it manually, the system respects that"

#### 1. Setting a slug that is unused

If the requested slug is not currently used as either an active slug or a historical alias:
- assign it to the page as the new active slug
- preserve the previous active slug as a historical alias

#### 2. Setting a slug equal to the page's own current active slug

This is forbidden as a no-op edit:
- the UI should reject it
- no database changes are made

#### 3. Setting a slug equal to the page's own historical alias

If the requested slug is already a historical alias of the same page:
- promote that alias back to the page's active slug
- remove the historical alias entry for that slug
- move the previously active slug into historical aliases
- rewrite internal links targeting that page if the active slug changed

#### 4. Setting a slug that is a historical alias of another page

Historical aliases are still reserved. The UI must offer:
- `Cancel`
- `Enforce`

If the user chooses `Enforce`:
1. remove that historical alias from the page that currently owns it
2. assign the slug as the new active slug of the target page
3. rewrite internal links referencing the target page

This avoids ambiguous resolution and keeps slug ownership explicit.

#### 5. Setting a slug that is the active slug of another page

This is rejected.

The UI must explain that:
- the address is already in use by another page
- the user must first rename that other page if they want to use this address here
- no force-takeover flow exists for active page URLs

This keeps the behavior predictable and avoids automatically changing another page's live address in the background.

### Page deletion from the drawer

Deleting a page removes its active slug and all historical aliases.

When a page is deleted:
1. remove its active slug and all historical aliases from the slug mapping table
2. delete the page document
3. update `document_refs` accordingly

Broken links are acceptable after deletion. The intended workflow is:
- if a page is still linked, the user should first remove those references so the page becomes a draft again
- then the user can delete it

Deletion still requires confirmation, with copy depending on whether the page is a draft or a reachable page:

1. Draft: `Are you sure you want to delete this draft?`
2. Reachable page: `Are you sure you want to delete this page? It is still linked from other pages. Remove those links first if you want to avoid broken links.`

The configured home page cannot be deleted. In the drawer UI this is the first page in the page listing and its delete action is unavailable.

If the currently open page is deleted from the drawer, the client should navigate to the home page after the delete succeeds.

The ellipsis menu is implemented as a dialog using anchor positioning. It can be dismissed with `Escape` or by clicking the backdrop, matching the interaction model used by other anchored dialogs in the editor.

## Authentication

Editable Website is a **single-user application**. There is one admin account. No user registration, no roles, no multi-tenancy.

### Admin password

The admin password is set via the `ADMIN_PASSWORD` environment variable. There is no default — the app refuses to start if `ADMIN_PASSWORD` is not set.

### Login flow

1. User navigates to `/login` and enters the password.
2. Client sends `POST /api/login` with `{ password }`.
3. Server compares the password against `ADMIN_PASSWORD`. If it matches:
   - Generate a session id via `crypto.randomUUID()`
   - Insert a row into the `sessions` table with an expiry (e.g. 30 days from now)
   - Set a `session_id` cookie (`HttpOnly`, `SameSite=Strict`, `Secure` in production, `Path=/`)
   - Return `200`
4. If the password does not match, return `401`.

### Session validation

In `hooks.server.js`, on every request:

1. Read the `session_id` cookie.
2. Look up the session in the `sessions` table.
3. If found and not expired: set `event.locals.user = 'Admin'`.
4. If not found or expired: delete the cookie, `event.locals.user = null`. Delete the expired row if it exists.

### Logout

`POST /api/logout` deletes the session row from the database and clears the cookie.

### Authorization

- **Read operations are public.** Anyone can view pages and assets.
- **Write operations require authentication.** Saving documents, uploading assets, and deleting assets check `event.locals.user`. If not authenticated, return `401`.

### API endpoints

- `POST /api/login` — authenticate with `{ password }`, sets session cookie
- `POST /api/logout` — clears session cookie, deletes session row

## SizableViewbox (user-controlled media sizing)

Some media placements need **user-controlled sizing** — the user should be able to set both the width and aspect ratio of the container, with the constraint that it never overflows its parent. This applies to inline decorations in prose content, footer logos, and potentially other contexts where the layout doesn't define the container dimensions.

### Design

These contexts use `MediaProperty` wrapped in a **`SizableViewbox`** component. The viewbox is a plain `<div>` whose `max-width` and `aspect-ratio` are controlled by the user via drag gestures. `MediaProperty` then fills whatever box the viewbox provides.

`SizableViewbox` is strictly a sizing primitive — it controls dimensions and provides drag handles, nothing else. Layout concerns like centering or margins are the caller's responsibility. The caller wraps the viewbox in whatever layout container they need:

```
┌─── parent container (prose column) ──────────────────────────┐
│                                                              │
│  ┌─── caller's wrapper div (e.g. margin: 0 auto) ─────────┐ │
│  │                                                         │ │
│  │  ┌─── SizableViewbox ───────────┐                       │ │
│  │  │  max-width + aspect-ratio    │                       │ │
│  │  │                              │                       │ │
│  │  │  ┌─ MediaProperty ─────────┐ │                       │ │
│  │  │  │  object-fit: cover/     │ │                       │ │
│  │  │  │  contain + focal point  │ │                       │ │
│  │  │  └─────────────────────────┘ │                       │ │
│  │  └──────────────────────────────┘                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

For example, `Decoration.svelte` handles centering itself based on the parent prose layout:

```svelte
<div style:margin={is_centered ? '0 auto' : undefined}>
    <SizableViewbox {path}>
        <MediaProperty path={[...path, 'media']} />
    </SizableViewbox>
</div>
```

And `Footer.svelte` uses it for the logo with a different media property name:

```svelte
<SizableViewbox {path} media_property="logo" placeholder_aspect_ratio={1}>
    <MediaProperty path={[...path, 'logo']} />
</SizableViewbox>
```

### Data model

The sizing properties follow a naming convention based on the media property they control: `{media_property}_max_width` and `{media_property}_aspect_ratio`. This allows multiple sizable viewboxes on the same node type with different media properties.

For `decoration` (media property is `media`):

```
decoration: {
    kind: 'block',
    properties: {
        media_max_width: { type: 'integer', default: 0 },
        media_aspect_ratio: { type: 'number', default: 0 },
        media: { type: 'node', ... }
    }
}
```

For `footer` (media property is `logo`):

```
footer: {
    kind: 'block',
    properties: {
        logo_max_width: { type: 'integer', default: 0 },
        logo_aspect_ratio: { type: 'number', default: 0 },
        logo: { type: 'node', ... },
        ...
    }
}
```

- **`{prop}_max_width`** — the maximum width of the viewbox in CSS pixels. `0` means "fill the available width" (no constraint). The viewbox renders with `max-width: Npx` so it never exceeds this value but also never overflows its parent (the parent's width is the natural upper bound via CSS — no JS measurement needed). Dragging the width handle beyond the container snaps back to `0` (full-width mode).
- **`{prop}_aspect_ratio`** — stored as a `width / height` float (e.g. `1.333` for 4:3). `0` means "use the media's natural aspect ratio" (read from `node.width` / `node.height` on the media child). The viewbox renders with `aspect-ratio: N` in CSS. Dragging the aspect ratio handle close to the media's natural ratio snaps back to `0`.

### SizableViewbox component

`SizableViewbox.svelte` wraps its children (a `MediaProperty`) in a `<div>` styled with `max-width` and `aspect-ratio` from the node's properties. It accepts:

- **`path`** — the node path (e.g. the decoration or footer node)
- **`media_property`** — the name of the media property on that node (default: `'media'`). The component derives field names as `{media_property}_max_width` and `{media_property}_aspect_ratio`, and reads the media node from `[...path, media_property]` to get intrinsic dimensions for the natural aspect ratio fallback.
- **`placeholder_aspect_ratio`** — used when `{prop}_aspect_ratio` is `0` and the media has no intrinsic dimensions (default: `16/9`)

It uses a children snippet for the inner content, provides drag handles for resizing that appear when the media inside is selected, and has no opinion about layout, alignment, or margins.

**CSS sizing (no JS measurement for overflow prevention):**

```css
.sizable-viewbox {
    max-width: var(--viewbox-max-width);  /* e.g. 400px, or 100% when 0 */
    aspect-ratio: var(--viewbox-aspect-ratio);  /* e.g. 1.333, or auto when 0 */
    width: 100%;  /* fill up to max-width, naturally capped by parent */
}
```

Because `max-width` combined with `width: 100%` means the element takes the minimum of its max-width and the parent's content width, overflow is prevented purely by CSS — no ResizeObserver or JS clamping needed. If the window shrinks below `max-width`, the viewbox shrinks with it.

### Drag interactions (edit mode only)

Two resize gestures, both operating on the viewbox's border/corner:

1. **Width handle (left and right edges):** horizontal drag sets `{prop}_max_width`. The value is clamped to a minimum (e.g. 40px) and needs no explicit maximum — CSS `max-width` + `width: 100%` handles overflow naturally. Dragging beyond the container width snaps to `0` (full-width mode). On pointer-up, the final pixel value is written to the document.

2. **Aspect ratio handle (bottom edge):** vertical drag changes the viewbox height, which is stored as `{prop}_aspect_ratio = current_rendered_width / new_height`. This means the aspect ratio is always relative to whatever width the viewbox currently renders at. Minimum height is clamped (e.g. 20px). When the dragged ratio is within 5% of the media's natural aspect ratio, it snaps to `0` (natural ratio mode).

Both gestures write to the svedit session via transactions (`svedit.session.tr` + `apply`), using `{ batch: true }` during drag for coalesced undo, with a final non-batched apply on pointer-up.

### Interaction with MediaControls

`MediaControls` (zoom, pan, focal point, double-click to reset scale) still works inside the viewbox. The viewbox only controls the *container* dimensions; `MediaProperty` and `MediaControls` handle everything inside it as usual.

## Future: optional S3 storage

Assets are stored on the local filesystem (`ASSET_PATH`) by default. This keeps the app fully self-contained — a single deployment with no external dependencies beyond the server itself. For most sites this is sufficient.

If large storage requirements arise (e.g. video-heavy sites with many gigabytes of media), an optional S3-compatible storage backend could be added later. This would involve:

- **An `ASSET_STORAGE` environment variable** — e.g. `s3` (defaults to `local`). When set to `s3`, uploads go to a bucket instead of the local filesystem.
- **S3 configuration** — `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and optionally `S3_ENDPOINT` for S3-compatible providers (Cloudflare R2, MinIO, etc.).
- **An `ASSET_BASE` environment variable** — the public URL prefix for assets, e.g. `https://cdn.example.com/assets`. Required when using S3, since assets are no longer served by the app itself. Media components would use this instead of `/assets` to construct URLs.
- **A CDN in front of the bucket** — S3 alone doesn't provide edge caching. For production use, a CDN (Cloudflare, CloudFront, etc.) should sit between the bucket and the user. `ASSET_BASE` would point to the CDN domain.

`ASSET_PATH` remains unchanged — it's always a local filesystem path derived from `DATA_DIR` and is only used when `ASSET_STORAGE` is `local`. `ASSET_BASE` is the public-facing URL prefix, only needed when assets are served externally.

The document data model wouldn't need to change — `src` fields still store content-addressed asset ids, and URL construction just swaps the `/assets` prefix for `ASSET_BASE`. This is a deployment concern, not a data migration.

Implementation steps are tracked in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
