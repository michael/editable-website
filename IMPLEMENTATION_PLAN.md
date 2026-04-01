# Implementation plan

This document tracks what to implement next. One step at a time. All implementation must conform to the design decisions in [ARCHITECTURE.md](ARCHITECTURE.md) — if a conflict arises, update the architecture first, then implement.

## Existing implementation steps (compacted history)

These older steps are kept in compact form as historical context. The durable source of truth is still [ARCHITECTURE.md](ARCHITECTURE.md); this section only captures how the current system got here and which high-level implementation moves were already made.

### Step 1 — database, seed data, and page rendering
- Introduced SQLite-backed document persistence using `node:sqlite`
- Added migrations + startup migration hook
- Seeded:
  - `page_1`
  - `nav_1`
  - `footer_1`
  - `home_page_id`
- Wired `get_document` / `save_document`
- `/` renders `page_1` by loading the page document and stitching in shared nav/footer

### Step 2 — asset processing and upload
- Added client-side image processing with WASM (`@jsquash/webp`, `@jsquash/resize`)
- Added asset hashing, upload, variant generation, and asset serving
- Established the `blob:` (unsaved) → asset id (saved) transition model
- Added `asset_refs` tracking
- Kept the save flow “upload assets first, then persist document”
- Preserved the rule that all persisted media sources are local asset ids

### Step 3 — deployment / operationalization
- Deployment planning existed for Fly.io / Node adapter / persistent storage
- This is now mostly archival context; architecture is the canonical reference for storage/runtime assumptions

### Step 4 — media evolution
- Added video node support and unified media handling direction
- Introduced / documented `MediaControls`
- Moved toward the `media` abstraction instead of hard-coded image-only thinking
- The architecture now captures the final intended media model more reliably than the old step-by-step notes
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
- static/Vercel compatibility for the `/` route using the demo document fallback

In addition, the multi-page work must preserve the current static preview / local single-page mode:

- when running in static/Vercel-style mode (for example `VERCEL=1`), only `/` needs to work
- `/` should continue to render from the demo document in that mode
- multi-page features are disabled in that mode from the `/` route's point of view:
  - no pages drawer
  - no linking into `/new`
  - no linking into dynamic `/:page_id`
- the multi-page routes themselves may still exist and assume the full Node + database runtime; they just must not be used from the `VERCEL=1` branch
- authentication is also disabled in that mode
- implementation must avoid hardwiring server-only runtime assumptions into the `/` route that would break static deployments
- be especially careful with top-level async imports and route setup, as already noted in the current `+page.svelte` flow

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
- accepts the already-generated client page id
- save the new page under that same id
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

- `/` continues to resolve `home_page_id` from site settings in the full runtime
- it loads that page using the same dynamic page loader used by `/:page_id`
- however, `/` must also retain a static/Vercel fallback mode that renders the demo document without requiring the database or multi-page runtime

This avoids duplicating page rendering logic while preserving a clean homepage URL and keeping preview/static deployments viable.

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

## Decision 3: `/new` uses a client-generated page id from the start

For `/new`, create a fresh transient page document on the client via a `create_empty_doc()` helper (or equivalent) that generates a new `page_id` / `document_id` using the existing nanoid setup.

This means:
- the root page node id and the document id are the same from the beginning
- the id is unique immediately, even before the document is persisted
- there is no need for a server roundtrip just to allocate a page id
- the page is still ephemeral in the sense that it is only stored once the user saves

On first save:
- the client sends the already-generated document id
- the server persists the document under that id
- no root-id rewrite is needed during save
- the client can navigate to `/${page_id}` after save (or continue there if already routed consistently)

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
- if `create === true`
  - assert that the provided document id does not already exist
  - persist as new page using that already-generated client id
  - return `{ ok: true, document_id, created: true }`
- else:
  - normal update

### Option B — add `create_document` and keep `save_document`
- `create_document(combined_doc)`
- `save_document(combined_doc)`

**Preferred:** Option A  
Reason: the save flow in the app is already unified. “First save creates, later saves update” maps naturally to a single save entry point, and with a client-generated nanoid there is no need for a separate id-allocation roundtrip.

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
- title
- preview image

This keeps the drawer payload small and purpose-built.

## Decision 7: page summaries should be extracted on the fly first, not cached

Use an on-the-fly extraction helper in `src/lib/server/`, used by `get_page_browser_data()`.

### Initial approach: no cache
For the first implementation, do **not** cache page summaries in the database. Extract them on demand when building the page browser data. This keeps the system simpler:

- no extra columns or companion summary table
- no extra migration work
- no summary invalidation logic
- no extra save-time bookkeeping

If this later proves too costly, summaries can be cached on save (similar in spirit to `document_refs`), but that is a later optimization.

### Extraction scope
Summary extraction should be **page-local only**:
- inspect the page document / page body subtree
- do **not** use shared nav or footer content for page summaries

This avoids cases where many pages inherit the same logo or shared text as their summary.

### Title extraction strategy
Use this fallback order:

1. explicit `page.title` if present and non-empty
2. first heading-like `text` node in page body
3. first meaningful text node in page body
4. fallback: `"Untitled page"`

For now, “heading-like” means the heading-style `text` node layouts already used in the app (for example the larger heading layouts). The exact helper can stay implementation-specific as long as it follows this order.

### Preview-image extraction strategy
Use this fallback order:

1. explicit page preview field if one exists in the future
2. otherwise the first image/video found in page body traversal order
3. fallback: `null`

The drawer already has a good illustrated-page fallback, so `null` is acceptable.

### Why this is the right start
The likely cost of summary extraction is low enough for now:
- page counts are expected to stay modest
- extraction can stop early once title + preview are found
- this avoids premature complexity while still giving good summaries

If later needed, the same extraction helper can become the canonical generator for cached summaries.

## Decision 8: drafts are unreachable pages, not merely “unlinked by nav”

Drafts should be defined according to reachability from the live site graph:

- start at `home_page_id`
- include internal links from:
  - pages
  - nav
  - footer
- all reachable page documents form the sitemap/reachable set
- any page document not in that set becomes a draft

This matches the architecture and avoids conflating “not in nav” with “draft”.

## Decision 9: internal page reference rules are route-based and deterministic

Internal page references should follow these rules:

- page routes are `/:page_id`
- `/` is the home page
- `/${page_id}` is an internal link to the page with that document id
- `/${page_id}#section` is also an internal link to that page; the `#section` fragment is ignored for reachability / sitemap purposes
- `/#section` is **not** a page reference when it points to the current home page; it is just an in-page anchor and must not create a `document_refs` edge
- more generally, anchor links that resolve to the **same page** are ignored for `document_refs`
- external URLs are ignored

This means `document_refs` should track page-to-page relationships by normalized target page id, not by full href string. Fragments are only relevant for browser navigation, not for sitemap reachability.

## Decision 10: sitemap hierarchy is a canonical tree projection, not a graph view

The sitemap drawer should render a **tree projection** of the reachable page graph, not the full graph.

### Final tree-building rule

- **No duplicates in the tree**
- **First occurrence wins**
- **Top-level ordering:** shared nav links → home page body links → shared footer links
- **Recursive ordering for child pages:** body links only

This means:

- Start traversal at the configured home page.
- At the root level, collect outgoing internal page references in this order:
  1. shared nav
  2. home page body
  3. shared footer
- When a referenced page is encountered for the first time, insert it into the tree at that position.
- Then recurse into that page, but only inspect its **body-derived** page references.
- If the same page is encountered again later from another path, ignore that later occurrence for tree placement.

This produces a deterministic, editor-friendly sitemap:
- global nav/footer define the top-level site structure
- deeper nesting comes from contextual links inside page content
- repeated references do not crowd the drawer with duplicates

Reachability is still graph-based, but the drawer presents a clean canonical tree rather than a literal graph visualization.

## Proposed phased implementation

## Phase 1 — backend support for multi-page documents

### 1.1 Add helper functions in server/data layer
Introduce helpers in `src/lib/api.remote.js` or extracted server modules for:

- `get_home_page_id()`
- `list_page_documents()`
- `get_page_document(document_id)`
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
  - assert that the provided document id does not already exist
  - save the new page under that same client-generated id
  - no root-id rewrite is needed
  - return that document id
- else
  - current update behavior

### 1.3 Add page creation helpers
Create a page factory for `/new`, likely in:
- `src/lib/new_page.js`
or nearby route helper

It should expose a `create_empty_doc()` helper (or equivalent) that:
- generates a fresh `page_id` using the existing nanoid utility
- creates a fresh page document with:
  - `document_id = page_id`
  - root page node id = `page_id`
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
- page drawer cache invalidation after save

### 2.2 Add `/[page_id]`
Implemented:
- `src/routes/[page_id]/+page.svelte`
- `src/routes/[page_id]/+page.js`

Current behavior:
- loads the requested document via remote query
- renders the shared `PageEditor`
- returns a proper SvelteKit 404 when the page is not found

### 2.3 Update `/`
Implemented:
- `src/routes/+page.svelte` now reuses `PageEditor`
- `src/routes/+page.js` loads the configured home page in full runtime mode

Current behavior:
- in full runtime mode, `/` loads the configured home page and renders it through the shared editor shell
- in static/Vercel mode, `/` still falls back to `demo_doc`

### 2.4 Add `/new`
Implemented:
- `src/routes/new/+page.svelte`
- `src/lib/new_page.js`

Current behavior:
- `/new` creates a transient page document locally via `create_empty_doc()`
- the page id is generated on the client up front
- the transient page is composed from the current shared nav/footer documents loaded from the database
- `/new` starts in edit mode immediately
- first save calls `save_document(..., create: true)` with that same id
- after first save, the app navigates to `/${document_id}`
- cancelling edit mode on `/new` discards the transient page and returns to `/`

## Phase 3 — reference tracking and sitemap data

### 3.1 Actually maintain `document_refs`
Implement server-side internal link extraction on save.
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
- compute drafts = all pages not reachable from the canonical home traversal
- compute sitemap tree

The sitemap tree must follow the documented rules exactly:

- no duplicates
- first occurrence wins
- top-level ordering: nav → home body → footer
- recursive ordering: body only

So this query/helper layer should not just return a raw graph; it should return the already-projected canonical tree used by the drawer UI.

## Phase 4 — async drawer wiring

### 4.1 Turn `PagesDrawer.svelte` from mock to real async data
Implemented:
- `PagesDrawer.svelte` now loads real browser data from a dedicated query
- loading is async-on-open
- data is cached until invalidated by a save

### 4.2 Add loading and empty states
Implemented:
- loading state when first opened
- empty drafts state
- basic sitemap empty/misconfigured state

### 4.3 Add “New page” action
Implemented:
- the plus tile in drafts navigates to `/new`

### 4.4 Add page navigation
Implemented:
- draft and sitemap items navigate to `/${document_id}`

Note:
- drawer-close-on-click can be refined later if needed

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

## Static/Vercel compatibility constraints for implementation

These constraints must be respected during implementation:

- only the `/` route must support static/Vercel compatibility mode
- `/new` and `/:page_id` may hardwire full runtime assumptions
- the multi-page routes can remain present in static/Vercel deployments; they just must not be linked to or relied on from the `VERCEL=1` branch
- the drawer/page-browser UI should not appear in static/Vercel mode
- authentication should remain effectively off in static/Vercel mode
- route/component structure should avoid forcing server-only imports for `/`
- if needed, keep the current pattern where `/` conditionally loads the demo document in static mode and only uses the runtime database path in full mode

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

1. Define the runtime split clearly: full runtime vs static/Vercel `/` fallback
2. Extract page editor shell in a way that does not break the static `/` route
3. Add `/[page_id]`
4. Add `/new` with transient document
5. Extend save API for create-on-first-save
6. Make create flow redirect after first save
7. Implement `document_refs` maintenance
8. Implement `get_page_browser_data()`
9. Wire real async drawer data
10. Disable drawer/multi-page UI in static/Vercel mode
11. Add invalidation after save

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

### Current status

Completed:
- shared editor extraction
- `/`, `/new`, and `/:page_id` route wiring
- client-generated-id create-on-first-save flow
- `/new` composition from current database-backed shared nav/footer docs
- `/new` starts in edit mode immediately
- proper SvelteKit 404 for unknown pages
- async real pages drawer with loading and empty states
- “New page” navigation from the drawer
- page navigation from draft and sitemap items
- drawer closes before page navigation
- save-time drawer invalidation
- cancel button behavior, including returning from `/new` to `/`

Still to verify / finish:
- confirm `document_refs` and reachability behavior matches the canonical tree rules exactly across real edited content
- keep `ARCHITECTURE.md` aligned with any behavior adjustments discovered during integration