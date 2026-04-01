# Implementation plan

This document tracks what to implement next. One step at a time. All implementation must conform to the design decisions in [ARCHITECTURE.md](ARCHITECTURE.md) — if a conflict arises, update the architecture first, then implement.

## Existing implementation steps

## Step 1: database, seed data, and page rendering

**Goal:** the home page (`page_1`) renders at `/` and saving changes persists them to the database. No assets, no authentication — those come in later steps.

- **`src/lib/server/db.js`** — database connection using `node:sqlite`, exports the db instance. Uses `DATA_DIR` for the database path.
- **`src/lib/server/migrations.js`** — exports an array of migration steps. For now, a single `initial_schema` step that creates the `documents`, `site_settings`, and `document_refs` tables, and seeds:
  - `page_1` (type `page`) — the home page, resembling the current demo document
  - `nav_1` (type `nav`) — the navigation document
  - `footer_1` (type `footer`) — the footer document
  - `home_page_id` setting → `page_1`
- **`src/lib/server/migrate.js`** — runs pending migrations from `migrations.js` against the database
- **`src/hooks.server.js`** — uncomment the `migrate()` call in `init()` so migrations run on server startup
- **`svelte.config.js`** — uncomment experimental async and remote functions
- **`src/lib/api.remote.js`** — uncomment/wire up `get_document` (query) and `save_document` (action) to read from and write to the database
- **Page rendering** — `/` loads `page_1` via `get_document`, stitches in `nav_1` and `footer_1`, and renders with Svedit. Saving calls `save_document` which persists changes back to SQLite.

For now, everything stays in the `initial_schema` migration step. While iterating on the schema, it's fine to wipe the database and re-run — real incremental migrations will be added later.

No authentication for now — it slows down development. Auth will be added as a later step. No asset handling yet — media uploads and serving come in a later step.

## Step 2: asset processing and upload (images only)

**Goal:** users can paste or drop images into the editor, images are processed client-side (resized, converted to WebP, variants generated), uploaded to the server, and served from disk. The save flow uploads all pending assets before saving the document. No videos, audio, or authentication yet — those come in later steps.

This step covers static raster images (JPEG, PNG, WebP, HEIC/HEIF) which get client-side WASM processing, plus animated GIFs and SVGs which pass through unprocessed. The image-resize project serves as the reference implementation for the WASM processing pipeline and upload protocol.

**Modularization principle:** asset processing and upload logic should be extracted into dedicated modules rather than inlined into existing files like `+page.svelte`. The save flow, paste/drop handling, and upload protocol each get their own module. Existing files should only import and call into the new modules — minimal changes to existing code, maximum isolation of new functionality.

### Dependencies

Install `@jsquash/webp` and `@jsquash/resize` for client-side WASM-based image processing:

```text
npm install @jsquash/webp @jsquash/resize
```

### Vite configuration

Add `optimizeDeps.exclude` for the WASM packages and set worker format to ES modules:

```js
// vite.config.js
optimizeDeps: {
  exclude: ['@jsquash/webp', '@jsquash/resize']
},
worker: {
  format: 'es'
}
```

### Shared configuration

**`src/lib/config.js`** — add asset-related constants alongside the existing `DATA_DIR`, `DB_PATH`, `ASSET_PATH`:

The asset constants must be importable from both the server and the client (including Web Workers), so they go in a separate file with no Node.js imports:

**`src/lib/asset-config.js`** — universal asset constants (no Node.js imports):

```js
export const VARIANT_WIDTHS = [320, 640, 1024, 1536, 2048, 3072, 4096];
export const VARIANT_WIDTHS_SET = new Set(VARIANT_WIDTHS);
export const MAX_IMAGE_WIDTH = VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
export const ASSET_BASE = '/assets';
```

`src/lib/config.js` (which imports from `node:path`) remains server-only and unchanged. The Web Worker and client code import from `asset-config.js`.

`ASSET_BASE` is the URL prefix used to construct asset URLs on the client. All `src` values in saved documents are bare asset ids (e.g. `c4b519da...fabdb.webp`). Components prefix them with `ASSET_BASE` at render time to build the full URL. This is the only valid source for saved images — no absolute URLs, no external URLs, no relative paths. A `src` value is either:
- `blob:...` — unsaved, only valid during the current editing session
- A bare asset id — saved, rendered as `{ASSET_BASE}/{asset_id}`

### Client-side image processing

Adapted from the image-resize project's WASM pipeline. Two new files:

**`src/lib/client/asset-processor.js`** — a Web Worker that handles image processing off the main thread. Receives a `File`, decodes it to `ImageData` via `createImageBitmap` + `OffscreenCanvas`, resizes if wider than `MAX_IMAGE_WIDTH` using `@jsquash/resize` (Lanczos3), encodes as WebP (quality 80) using `@jsquash/webp`, generates all applicable width variants, and transfers the resulting `ArrayBuffer`s back to the main thread. Posts `status` messages during processing for UI feedback.

**`src/lib/client/process-asset.js`** — main-thread wrapper that spawns the worker, sends the file + config, and returns a `Promise<ProcessedAsset>`:

```js
/** @typedef {{
 *   original: { blob: Blob, width: number, height: number },
 *   variants: Array<{ width: number, blob: Blob }>
 * }} ProcessedAsset */
```

Takes an `onStatus` callback for progress reporting. Terminates the worker after completion.

### SHA-256 content hashing

The client computes the SHA-256 hex hash of the **source file** (before any processing) using `crypto.subtle.digest`. This hash plus the stored format's file extension becomes the asset id. For static images the extension is `.webp` (since they're converted). For animated GIFs it's `.gif`. For SVGs it's `.svg`.

```js
async function hash_blob(blob) {
  const buffer = await blob.arrayBuffer();
  const hash_buffer = await crypto.subtle.digest('SHA-256', buffer);
  const hash_array = Array.from(new Uint8Array(hash_buffer));
  return hash_array.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

The hash is always computed from the **original source file** the user provides, not from the processed WebP output. This ensures the same source file always produces the same asset id regardless of encoder version or settings.

### Asset upload endpoints

Three new SvelteKit API routes, adapted from image-resize but using the ARCHITECTURE's asset path conventions (content-addressed filenames in a flat `ASSET_PATH` directory, not `{id}/original.{ext}`):

**`src/routes/api/assets/+server.js`** — `POST` upload an original asset.

- Request headers: `X-Content-Hash` (SHA-256 hex), `Content-Type`, `X-Asset-Width`, `X-Asset-Height`
- Request body: the processed blob (WebP for static images, original bytes for GIFs/SVGs)
- Constructs the asset id: `{hash}.{ext}` where ext is determined by content type (`webp` for static images, `gif` for GIFs, `svg` for SVGs)
- **Deduplication:** if a file already exists at `ASSET_PATH/{asset_id}`, skip the upload — drain the request body and return the existing metadata with `deduplicated: true`
- Streams the body to `ASSET_PATH/{asset_id}` — no buffering the whole file in memory
- On write failure, cleans up the partial file
- Returns `{ asset_id, width, height, deduplicated }` on success

(Existing implementation details for Step 2 remain unchanged.)

---

# Multi-page implementation analysis

## Goal

Turn the current single-page editable site into a true multi-page setup with:

- `/new` — an ephemeral unsaved page editor that becomes a real page on first save
- `/:page_id` — dynamic page loading and editing
- `/` — still renders the configured home page
- a real pages drawer populated asynchronously when opened
- drafts and linked pages derived from persistent site data
- no authentication checks yet beyond assuming the current user is effectively an admin

This step must preserve the current strengths of the app:

- shared `nav` and `footer` composition
- existing save flow including asset processing/upload/replacement
- current document splitting and asset reference tracking
- editable-in-place page editing with the same session and toolbar behavior

## Key observations from current codebase

### 1. The database model is already close to supporting multi-page

Current `documents` table:

```sql
CREATE TABLE documents (
    document_id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    data TEXT
);
```

This already allows storing many documents of type `page`. No schema change is required just to store multiple pages.

Current `site_settings` table:

- already stores `home_page_id`
- can remain the source of truth for `/`

### 2. `get_document(document_id)` and `save_document(combined_doc)` are already page-id driven

In `src/lib/api.remote.js`, `get_document` already accepts a `document_id`.  
This is a strong foundation for `/:page_id`.

Current limitations:
- no route yet passes arbitrary page ids
- no helper exists to list page documents
- no helper exists to create a brand-new page document id on first save
- `save_document` always upserts the provided page id, but assumes the page already conceptually exists

### 3. Shared-document splitting is already the right design

`save_document` currently:

- treats the root document as the page
- splits out `nav` subtree and `footer` subtree
- writes each document separately

This aligns with the architecture and should remain unchanged.

The multi-page work should **not** move away from:
- page document + shared nav + shared footer composition

### 4. `/new` should be ephemeral and not create junk rows

Per product direction, `/new` should not immediately insert a page row.  
Instead:

- the client creates a transient in-memory document
- first save persists it as a real page document
- then navigation should transition from `/new` to `/:page_id`

This is preferable to eagerly inserting a draft page into the database.

### 5. The current save API needs a create-vs-update distinction

Today `save_document` just upserts the given document id.

For `/new`, we need a server-side path that:
- can generate a new page id
- save the new page under that id
- preserve shared nav/footer references
- return the final page id to the client

So save needs to support:
- **update existing page**
- **create new page from transient draft**

### 6. The drawer needs two derived datasets, not one

The page browser is not just “all pages”.

It needs:

1. **Drafts**  
   Flat list of page documents that are not reachable from the live site structure

2. **Site structure / sitemap**  
   Tree rooted at the current home page

That means we need:
- page listing
- document reference analysis
- reachability traversal

This matches the architecture section on page reachability.

### 7. Existing `document_refs` table is currently unused for page browser logic

The architecture describes `document_refs`, but the current `save_document` implementation shown in the code excerpt does not yet update it.

This is a major gap.

For a real sitemap/drafts implementation, we need:
- internal page links extracted on save
- `document_refs` updated on save for pages/nav/footer
- a reachability algorithm that starts from:
  - `home_page_id`
  - plus links coming from shared documents like nav/footer because those are part of every page render

### 8. The drawer should load async-on-open, not up front

That means:
- do not fetch page browser data during normal page load
- fetch only once the drawer is opened
- probably cache while open / until page changes

This is a good use for Svelte async patterns and keeps the main editor lightweight.

## Design decisions for this step

## Decision 1: keep `/` as a dedicated home-page route

- `/` continues to resolve `home_page_id` from site settings
- it loads that page using the same dynamic page loader used by `/:page_id`

This avoids duplicating page rendering logic while preserving a clean homepage URL.

## Decision 2: introduce a dynamic `[page_id]` route

- `src/routes/[page_id]/+page.svelte` becomes the canonical page renderer/editor
- `/` should reuse the same page shell/component internally rather than duplicating editor logic

Best structure:

- create a shared `PageEditor.svelte` or similar component that accepts:
  - loaded document
  - route mode (`new` vs existing)
  - maybe initial page id state
- use it from:
  - `/+page.svelte`
  - `/[page_id]/+page.svelte`
  - `/new/+page.svelte`

This keeps the editor implementation single-sourced.

## Decision 3: `/new` uses a transient page id sentinel locally

For `/new`, use a temporary client-side page document with a sentinel/root id, e.g.:
- `new_page`
or
- a generated temporary id that is clearly not persisted

On first save:
- server generates the real page id
- server saves page under that new id
- client navigates to `/${new_page_id}`

The transient document should still reference:
- existing shared `nav`
- existing shared `footer`

so the editing experience matches real pages immediately.

## Decision 4: add a dedicated “save page” remote command that can create pages

Instead of overloading current `save_document` too implicitly, define the API around page saving clearly.

Two possible shapes:

### Option A — extend `save_document`
Input:
```js
{
  document_id,
  nodes,
  create: boolean
}
```

Behavior:
- if `create` true:
  - generate page id
  - rewrite root page id / references as needed
  - persist as new page
  - return `{ ok: true, document_id: new_id, created: true }`
- else:
  - normal update

### Option B — add `create_document` and keep `save_document`
- `create_document(combined_doc)`
- `save_document(combined_doc)`

**Preferred:** Option A  
Reason: the save flow in the app is already unified. “First save creates, later saves update” maps naturally to a single save entry point.

## Decision 5: page browser data should come from a dedicated query

Add a new remote query, something like:

- `get_page_browser_data()`

Return shape:

```js
{
  home_page_id: string,
  drafts: Array<PageSummary>,
  sitemap: PageTreeNode | null
}
```

Where a `PageSummary` could be:

```js
{
  document_id: string,
  title: string,
  preview_image_src: string | null
}
```

And `PageTreeNode`:

```js
{
  document_id: string,
  title: string,
  preview_image_src: string | null,
  children: PageTreeNode[]
}
```

This keeps the drawer UI simple and avoids doing graph analysis in the client.

## Decision 6: page titles and preview images should be server-derived summaries

The drawer should not receive raw full documents.

Instead, the server should summarize each page:
- title:
  - likely from first strong title-like content in body
  - fallback to document id / “Untitled page”
- preview image:
  - first image/media found in the page subtree
  - fallback to null

This keeps the drawer payload small and purpose-built.

## Decision 7: drafts are unreachable pages, not merely “unlinked by nav”

Drafts should be defined according to reachability from the live site graph:

- start at `home_page_id`
- include internal links from:
  - pages
  - nav
  - footer
- all reachable page documents form the sitemap/reachable set
- any page document not in that set becomes a draft

This matches the architecture and avoids conflating “not in nav” with “draft”.

## Proposed phased implementation

## Phase 1 — backend support for multi-page documents

### 1.1 Add helper functions in server/data layer
Introduce helpers in `src/lib/api.remote.js` or extracted server modules for:

- `get_home_page_id()`
- `list_page_documents()`
- `get_page_document(document_id)`
- `generate_page_id()`
- maybe `upsert_split_documents(...)` extracted from current save logic

### 1.2 Extend save API for create-on-first-save
Update `save_document` to accept a creation mode, likely:

```js
{
  document_id,
  nodes,
  create
}
```

Behavior:
- if `create === true`
  - generate new page id
  - rewrite the root page id from transient id to new id
  - rewrite any internal root self-references if needed
  - save page under new id
  - return new id
- else
  - current update behavior

### 1.3 Add page creation helpers
Create a page factory for `/new`, likely in:
- `src/lib/new_page.js`
or nearby route helper

It should create:
- a fresh page document with:
  - root page node
  - references to shared `nav_1` and `footer_1` (or current configured shared docs)
  - an initial editable body, likely one empty `prose` block

This should be minimal but pleasant to edit immediately.

## Phase 2 — routing and shared page editor shell

### 2.1 Extract current page editor into a shared component
Current `src/routes/+page.svelte` mixes:
- document loading
- app command setup
- save flow
- toolbar
- editor rendering

Extract the reusable editor page shell into something like:
- `src/routes/components/PageEditor.svelte`

Inputs:
- `initial_doc`
- `is_new`
- maybe `page_id`

Responsibilities:
- instantiate session
- save command
- toolbar
- key mapping
- edit mode

### 2.2 Add `/[page_id]`
Create:
- `src/routes/[page_id]/+page.svelte`

Load:
- requested document via remote query
- pass into `PageEditor`

Behavior:
- if document not found, show 404-ish handling

### 2.3 Update `/`
Keep:
- `src/routes/+page.svelte`

But make it:
- fetch `home_page_id`
- fetch that document
- render same `PageEditor`

### 2.4 Add `/new`
Create:
- `src/routes/new/+page.svelte`

It should:
- build transient new page document locally
- render `PageEditor` with `is_new={true}`

On first save:
- call `save_document(..., create: true)`
- navigate to `/${new_id}`

## Phase 3 — reference tracking and sitemap data

### 3.1 Actually maintain `document_refs`
Implement server-side internal link extraction on save.

For each saved subdocument (page/nav/footer):
- scan nodes for internal page references
- update `document_refs` by full replace or diff

Need a clear convention for what counts as internal page reference:
- likely hrefs beginning with `/page_id` or `/${page_id}`
- possibly page-local anchors should be excluded
- external URLs ignored

This part must be carefully defined before implementation.

### 3.2 Implement reachability
Add a server helper that:
- reads `home_page_id`
- traverses `document_refs`
- treats page/nav/footer appropriately
- builds reachable page set

Important nuance:
- nav/footer are shared documents and may contain links to pages
- so the graph traversal should include links originating from them as well

### 3.3 Build browser query
Add:
- `get_page_browser_data()`

It should:
- list all page documents
- compute drafts = all pages not reachable from home graph
- compute sitemap tree

For the first version of sitemap tree:
- it’s okay if the tree is driven primarily from nav structure plus page references
- but the exact shape should be documented before coding if it differs from generic reachability graph traversal

## Phase 4 — async drawer wiring

### 4.1 Turn `PagesDrawer.svelte` from mock to real async data
Replace prototype hardcoded data with real query data.

Because you want async-on-open:
- fetch page browser data only once drawer opens
- use Svelte async patterns inside the drawer or overlays
- cache result until invalidation is needed

### 4.2 Add loading and empty states
The drawer should support:
- loading state when first opened
- empty drafts state
- empty sitemap state fallback if only home exists

### 4.3 Add “New page” action
The plus tile in drafts should:
- navigate to `/new`

### 4.4 Add page navigation
Draft and sitemap items should:
- navigate to `/${document_id}`
- likely close drawer on click

## Phase 5 — save flow integration and navigation correctness

### 5.1 Update SaveCommand in editor shell
Current save flow assumes one persistent page.

It should now:
- detect `is_new`
- call save API with `create: true` on first save
- update client route to new page id after successful create
- then continue normal saves as update

### 5.2 Ensure asset pipeline works identically for new pages
No changes in overall asset flow:
- process pending assets
- upload before save
- replace blob URLs in document copy
- persist resulting document

Need to ensure first-save create path supports all of that.

### 5.3 Invalidate browser drawer data after saves
When a page is created or links change:
- drawer data becomes stale
- need a simple invalidation strategy

Initial simple solution:
- when save succeeds, clear cached browser-data promise/state
- next drawer open refetches

## Open questions to resolve before implementation

## 1. How exactly should page links be represented and parsed?
Need a precise rule for internal page references.

Possibilities:
- `href: '/about'` with route segment equal to document id
- `href: '/page_id'`
- `href: '/'` for home page
- anchor links `/#section` should not count as page refs

We should define this before implementing `document_refs`.

## 2. How should sitemap hierarchy be built?
There are two plausible sources:

### A. Nav-driven tree
- nav defines primary structure
- children inferred from nav nesting / page grouping
- simple and UX-friendly

### B. Reference graph-driven tree
- generic graph traversal from home
- but graph isn’t necessarily a tree
- more complex and may produce odd UI

For the drawer UX you described, a **nav-driven or explicitly structured tree** is probably preferable, with reachability used only to determine drafts.

## 3. Where should “page summary” extraction live?
We need a clear place for:
- title extraction
- preview-image extraction

Likely:
- helper in `src/lib/server/` used by `get_page_browser_data()`

## 4. How should `/new` root ids be handled?
Need a transient-id strategy.

Likely:
- root page id = `'new_page'`
- save-create rewrites root id to generated real id server-side

This is simple and explicit.

## Suggested file changes summary

### New or extracted files
- `src/routes/[page_id]/+page.svelte`
- `src/routes/new/+page.svelte`
- `src/routes/components/PageEditor.svelte`
- maybe `src/lib/new_page.js`
- maybe `src/lib/server/page_browser.js`
- maybe `src/lib/server/page_summary.js`

### Updated files
- `src/routes/+page.svelte`
- `src/lib/api.remote.js`
- `src/routes/components/PagesDrawer.svelte`
- `src/routes/components/Overlays.svelte`
- possibly `src/lib/server/migrations.js` if additional seed/settings support is needed

## Recommended implementation order

1. Extract page editor shell
2. Add `/[page_id]`
3. Add `/new` with transient document
4. Extend save API for create-on-first-save
5. Make create flow redirect after first save
6. Implement `document_refs` maintenance
7. Implement `get_page_browser_data()`
8. Wire real async drawer data
9. Add invalidation after save

## Notes from PR #86 reference

The referenced PR indicates there is prior art for:
- dynamic page rendering/editing
- sitemap
- multi-page setup

We should treat it as:
- a source of ideas for route/data responsibilities
- not something to mirror structurally

Priority remains:
- consistency with `ARCHITECTURE.md`
- maintainable code in the current codebase
- minimal disruption to the proven current save/split/asset flow

## Definition of done

This step is complete when:

- `/` renders the configured home page from DB
- `/new` opens an unsaved editable page
- first save on `/new` creates a new real page and navigates to `/:page_id`
- `/:page_id` loads and edits existing pages
- saving continues to work with shared nav/footer and assets
- drawer loads async data on open
- drawer shows:
  - drafts as flat list
  - sitemap as tree
- drafts are computed from reachability, not hardcoded
- no authentication gates are required yet beyond current assumed-admin development mode