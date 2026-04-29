# Implementation plan

This document tracks what to implement next. One step at a time. All implementation must conform to the design decisions in [ARCHITECTURE.md](ARCHITECTURE.md) — if a conflict arises, update the architecture first, then implement.

## Next implementation draft — codeblock node

Add a `codeblock` page body node for editable code samples.

Implementation steps:

1. Add `codeblock` to the page `body` node array in `src/lib/document_schema.js`.
2. Add a `line` schema entry of kind `text` with an annotated text `content` property that does not allow newlines.
3. Add a `codeblock` schema entry with a `lines` node array that accepts `line` nodes and defaults to `line`.
4. Add a `Codeblock.svelte` node component that renders `lines` with `NodeArrayProperty`, monospace styling, preserved whitespace, no wrapping, and horizontal overflow scrolling.
5. Register `Codeblock` in `src/routes/create_session.js`.
6. Add a `codeblock` inserter that creates one `codeblock` containing one or more `line` nodes.
7. Add the requested sample code as a seeded `codeblock` in `src/lib/demo_doc.js` using `line` nodes.
8. Add a migration that inserts the requested sample `codeblock` into existing seeded page documents using `line` nodes.
9. Add a migration that converts existing `codeblock.lines` children from `text` nodes to `line` nodes.
10. Add a `language` string property to `codeblock`, supporting `javascript` and `bash`, with `javascript` as the default for inserted and seeded samples.
11. Add Shiki as the TextMate grammar-backed tokenizer dependency for client-side syntax highlighting.
12. Add a client-only syntax highlighter helper that lazily loads Shiki with only the JavaScript and bash grammars and returns token ranges for a full codeblock string.
13. Add a CSS Custom Highlight API helper that maps token offsets back onto rendered editable `line` text nodes using `Range` objects and registers stable `CSS.highlights` entries per codeblock.
14. Wire the highlighting helper into `Codeblock.svelte` so highlighting updates after line text or language changes without mutating Svedit document data or replacing the editable DOM.
15. Add global `::highlight(...)` styles for syntax token categories and keep codeblocks readable/editable if the CSS Highlight API or grammar loading is unavailable.

## Next implementation draft — admin authentication

This step adds simple owner authentication for editing and private page-management features.

### Goal

Implement admin authentication with these rules:

- the admin password is configured via `ADMIN_PASSWORD`
- `ADMIN_PASSWORD` is required in full runtime mode; if it is missing, the app must not start
- whoever knows that password can authenticate as admin
- authenticated admins can edit and save content, browse drafts, and use the full page browser
- unauthenticated visitors can still choose `Edit for fun`
- edit-for-fun mode only affects the currently open page and never persists changes
- the primary login entry point is the edit shortcut flow on the current page
- static / `VERCEL=1` mode keeps authentication disabled

### Scope

This step includes:

- server-side admin session creation and validation using the existing `sessions` table
- session cookie creation and logout
- `event.locals.is_admin` wiring in `hooks.server.js`
- a login command that validates `ADMIN_PASSWORD`
- a lightweight auth-status read API for the client
- server-side protection for save and page-management mutations
- server-side protection for private page browser data
- an auth dialog shown when unauthenticated users try to edit
- edit-for-fun mode in the editor UI
- hiding private page-management UI from unauthenticated users

This step does not include:

- multi-user accounts
- usernames or email addresses
- password reset flows
- role-based permissions
- rate limiting / brute-force protection
- changing the public browsing experience
- changing the static / `VERCEL=1` compatibility model

### Environment and session rules

Required behavior:

- `ADMIN_PASSWORD` is the single source of truth for admin login
- in static / `VERCEL=1` mode, authentication is disabled
- in full runtime mode, the app must not start if `ADMIN_PASSWORD` is missing
- in full runtime mode, protected mutations must fail if the request is not authenticated as admin
- the session cookie stores only an opaque session id
- the password itself is never stored client-side
- expired sessions are deleted on lookup

Session lifetime rules:

- admin sessions last for two weeks
- when a session is created, `expires` is set to `now + 2 weeks`
- when an authenticated admin makes a meaningful authenticated request, the server extends `expires` to `now + 2 weeks`
- this is a sliding session window, not a fixed expiry from first login

Cookie requirements:

- `httpOnly`
- `sameSite='lax'`
- `secure` in production
- path `/`

### Server hook changes

Update `src/hooks.server.js` so that on every request it:

1. reads the admin session cookie
2. looks up the session in `sessions`
3. deletes expired sessions
4. sets `event.locals.is_admin` to `true` or `false`

There is no `user` object in this model.

### Remote function changes

Add admin auth remote functions:

- `login_admin(password)`
- `logout_admin()`
- `get_auth_status()`

Required behavior:

#### `login_admin(password)`

- validate the submitted password against `ADMIN_PASSWORD`
- if invalid, return a user-facing auth error result
- if valid:
  - create a new session row
  - set the session cookie
  - return `{ ok: true }`

#### `logout_admin()`

- delete the current session row if present
- clear the session cookie
- return `{ ok: true }`

#### `get_auth_status()`

- return whether the current request is authenticated as admin
- if authenticated, extend the session expiry to `now + 2 weeks`
- this is only for UI branching; the server remains the source of truth for authorization

### Protected server operations

Require `event.locals.is_admin === true` for:

- `save_document(...)`
- `delete_page(...)`
- `update_page_slug(...)`
- any persistent asset mutation flow used during save
- `get_page_browser_data(...)`

For these authenticated operations, successful session validation should also extend the session expiry to `now + 2 weeks`.

Public page/document reads remain public:

- page loading by slug
- home page loading
- internal link preview for already-public pages

### Edit shortcut and auth dialog flow

When the user triggers editing on a page:

- desktop users can use the edit shortcut
- mobile users can pull past the end of the page and hold that overscroll for about one second to open the same auth dialog
- the mobile overscroll trigger is only enabled on touch-capable / coarse-pointer devices

#### If already authenticated as admin

- enter normal editable mode immediately

#### If not authenticated

Open a first dialog with two large visual choice cards:

1. `Edit for fun`
2. `Login`

Behavior of the first dialog:

- the `Edit for fun` card uses a large primary label with supporting copy such as `Changes can't be saved`
- the `Login` card uses a large primary label with supporting copy such as `For admins`
- each choice is presented as a large square or near-square button-like card rather than a small inline action row
- the first-step dialog may include simple illustrative treatment inside each card to make the two paths feel visually distinct
- `Edit for fun` enters temporary local editing mode without authentication
- `Login` advances to a second dialog that prompts for the admin password
- there is no dedicated cancel button on the first-step dialog; dismissing it is done by clicking outside the dialog or pressing escape

Behavior of the second dialog:

- submitting the password calls `login_admin(...)`
- on success, authenticate as admin, refresh admin-only UI state, and close the dialog without entering page editing mode automatically
- on failure, keep the password dialog open and show an error
- cancel closes the password dialog and returns to normal browsing mode

Behavior of the mobile overscroll trigger:

- it only opens the auth dialog and does not enter editing directly
- it only applies while not already editing
- it is mobile-only and should only be armed on touch-capable / coarse-pointer devices
- it should only trigger after the user has reached the end of the page and held the overscroll state for about one second
- it should only trigger while the user is actively holding a touch through that hold period
- it must not trigger from inertial or momentum scrolling after the finger has lifted
- it should not retrigger repeatedly during the same continuous gesture
- it should reset once the user returns to the normal scroll range or ends the touch

There is no primary `/login` route in this step.

### Edit-for-fun mode

Add a distinct unauthenticated editing mode with these rules:
Constraints of edit-for-fun mode:

- edits are local and disposable only
- there is no save action
- there is no page browser access
- there is no drafts access
- there is no create-page flow
- there is no delete-page flow
- there is no page URL editing flow
- normal in-memory editing interactions can still run while editing for fun
- uploads are never persisted because persistence only happens through save
- cancel resets the page back to its initial loaded state
- pressing the edit shortcut again while already in edit-for-fun mode does nothing

### Client UI changes

Update the editor UI so that it distinguishes between:

- public browsing mode
- edit-for-fun mode
- authenticated admin editing mode

Required UI behavior:

- unauthenticated users pressing edit see the auth dialog
- authenticated admins see the existing save-capable editing UI
- edit-for-fun mode shows only disposable editing controls
- drafts and private sitemap UI are hidden unless authenticated as admin
- link pickers must not expose drafts to unauthenticated users
- toolbar actions that require admin auth must be hidden or disabled when unauthenticated
- authenticated admins get an explicit logout button

### Page browser behavior

The page browser becomes admin-only.

Required behavior:

- unauthenticated users do not see drafts
- unauthenticated users do not see the private sitemap drawer at all
- authenticated admins continue to see drafts and the full page browser
- all server-side page browser data remains protected even if the client UI is bypassed

### Save behavior

Saving is admin-only.

Required behavior:

- in edit-for-fun mode, there is no save action
- if an unauthenticated save somehow reaches the server, the server rejects it
- authenticated admin saves continue to work as before

### Logout behavior

Add a logout action for authenticated admins.

Required behavior:

- clears the session cookie
- invalidates admin-only UI state
- if the user is currently editing, exit admin editing mode
- after logout, pressing the edit shortcut again should reopen the auth dialog

## Next implementation draft — slug-based page URLs

This step replaces id-based public page routes with slug-based page URLs while keeping `document_id` as the stable internal identity.

### Goal

Implement human-readable page URLs with these rules:

- each page keeps a stable internal `document_id`
- non-home pages have one active slug used for their public route
- the home page is a special case whose canonical public route is always `/`
- old non-home slugs remain as historical aliases and `301` redirect to the current active slug
- the first non-home slug is generated on first save from the extracted page title using `slugify`
- after first save, the slug stays stable until the user explicitly changes it
- active slugs cannot be taken from another page
- historical aliases of other pages can be claimed automatically without a confirmation step
- whenever an active non-home slug changes, all internal persisted `href` links referencing that page are rewritten

### Scope

This step includes:

- database schema for slug storage and lookup for non-home pages
- slug generation and uniqueness rules
- slug resolution in page loading routes and APIs
- save flow updates so first save assigns the initial slug for non-home pages
- page browser UI for viewing and editing the Page URL of non-home pages
- internal href rewrite logic for slug changes
- canonical redirects from historical aliases to active slugs
- explicit home-page special-casing at `/`
- page-level `title` and `description` metadata fields on the `page` root node
- edit-mode-only UI for editing those metadata fields with `<AnnotatedTextProperty>`
- page `<title>`, description meta tags, and Open Graph title/description tags driven by explicit page metadata when present, otherwise by the same fallback extraction used for page browser summaries

This step does not include:

- changing the home page identity
- exposing slug internals like “auto mode” or “custom mode” in the UI
- automatic slug updates when titles change after first save
- repairing broken links on page deletion
- adding a separate metadata settings screen
- adding cached summary columns to the database

### Data model changes

Add a dedicated slug mapping table for non-home pages.

Required fields:

- `slug` — unique text key across all active and historical non-home slugs
- `document_id` — owning page document id
- `is_active` — whether this is the page’s current active slug
- `created_at` — timestamp for ordering/debugging

Constraints and invariants:

- every slug row belongs to exactly one non-home page document
- a non-home page has exactly one active slug
- a non-home page may have zero or more inactive historical slugs
- `slug` is globally unique across the table
- the home page does not need a slug row because its canonical route is always `/`
- `documents.document_id` remains the primary internal identity

Recommended schema shape:

- include `document_slugs` directly in the initial schema setup rather than as a later migration step
- unique index on `slug`
- unique partial index on active slug per `document_id`

### Slug generation rules

Use the `slugify` package with:

- `slugify(title, { lower: true, strict: true, trim: true })`

Generation algorithm:

1. extract the page summary title using the same title extraction rules already defined in the architecture
2. slugify that title
3. if the result is empty, use `document_id`
4. if the candidate slug is already used by any active or historical slug row, generate a unique suffix form:
   - `survey`
   - `survey-2`
   - `survey-3`
   - etc.
5. persist the chosen slug as the page’s first active slug

Important rule:

- slug generation happens on first save only
- later title changes do not auto-update the slug

### Page metadata rules

Add three page-root properties:

- `page.title`
- `page.description`
- `page.image`

`page.title` and `page.description` should use the `annotated_text` property type so they can be edited with `<AnnotatedTextProperty>`.

`page.image` should use a `node` property pointing to an `image` node. That image node should always exist on the page root, even when no image has been chosen yet. This means explicit-image checks must look at `page.image.src`, not merely at whether the `page.image` node reference exists.

Metadata extraction rules:

1. extracted page title:
   - use explicit `page.title` if it exists and is non-empty
   - otherwise fall back to the existing title extraction from page-local body content
   - otherwise fall back to `"Untitled page"`
2. extracted page description:
   - use explicit `page.description` if it exists and is non-empty
   - otherwise fall back to the first meaningful text-ish page-local body content
   - otherwise fall back to `null`
3. extracted page image:
   - use explicit `page.image` if its node exists and `page.image.src` is non-empty
   - otherwise fall back to the first image found in page-local body content
   - otherwise fall back to `null`

These extracted values should be the shared source for:

- first-save slug generation
- page browser title/summary metadata
- page browser preview image metadata
- `<title>`
- `<meta name="description">`
- `<meta property="og:title">`
- `<meta property="og:description">`
- `<meta property="og:image">`
- `<meta name="twitter:image">`

Description meta tags should only be rendered when a description value exists.

Image meta tags should use the extracted page image when available. For now, they should use the original asset URL rather than a smaller derived variant. If no image can be extracted, image meta tags should be omitted.

### Route and API changes

Public routing changes from `/:page_id` to `/:slug` for non-home pages.

Required behavior:

- `/` remains the canonical home page route and resolves directly from `home_page_id`
- `/:slug` resolves through `document_slugs.slug`
- if the slug row is active, load that page
- if the slug row is historical, resolve the page and issue a `301` redirect to the current active slug
- if no slug row exists, return `404`

API/document loading changes:

- all non-home page-loading entry points that currently accept a page id in the URL must resolve by slug first
- internal server logic should normalize back to `document_id` immediately after slug resolution
- all graph/reference logic continues to use `document_id`, not slug strings

### Save flow changes

#### First save of `/new`

On first save of a new page:

1. persist the page document under the already client-generated `document_id`, including any explicit `page.title` / `page.description` values and the always-present `page.image` node on the root node
2. extract the page title
3. generate the initial unique slug
4. insert the active slug row
5. return both:
   - `document_id`
   - active slug
6. navigate the client from `/new` to `/:slug`

#### Later saves of existing pages

On later saves:

- persist any edits to `page.title` / `page.description` and `page.image` on the page root node
- keep the current active slug unchanged
- do not regenerate from title
- continue updating `document_refs`, `asset_refs`, and split shared documents as before

### Client UI changes for page metadata

1. extend the page schema so the `page` root node includes `title` and `description` annotated-text properties plus an `image` node property
2. ensure the `page.image` image node always exists on the page root, including in seeded data, migrations, and new-page creation
3. render a small metadata editor section at the very end of the page component
4. only render that section when `svedit.editable` is true
5. use `<AnnotatedTextProperty>` for `title` and `description`
6. render `page.image` as a square image field in the same metadata section
7. do not render this metadata editor section in non-edit mode
8. keep the metadata editor outside the normal public page content so it does not appear on the live page

Suggested rendering shape:

- metadata section after the footer
- one square image field for page image
- one field for page title
- one field for page description
- simple labels are acceptable, but the editable values themselves should be the page-root metadata fields

### Head metadata changes

1. replace hard-coded page `<title>` values with extracted page metadata
2. render description tags only when an extracted description exists
3. render `og:title` and `og:description` from the same extracted metadata values
4. render `og:image` and `twitter:image` from the extracted page image value
5. for now, use the original asset URL for social image tags rather than a smaller derived variant
6. when explicit `page.title` / `page.description` / `page.image` are absent, use the same fallback extraction logic already used for page browser data
7. keep one shared extraction helper so page browser summaries, slug generation, and head metadata stay consistent

### Slug editing flow in the page browser

The page browser ellipsis menu should expose URL editing for non-home pages.

User-facing presentation:

- label it as `Edit URL`
- present it visually as `example.com/[your-slug-here]`
- only the part after the slash is editable

The UI should not expose:

- auto mode
- custom mode
- historical alias internals

#### Validation rules

When the user submits a new slug:

- normalize it with the same slug rules used by generation
- reject empty results
- reject a slug equal to the page’s current active slug as a no-op
- allow a slug equal to one of the page’s own historical aliases
- allow an unused slug
- allow a slug that is only a historical alias of another page
- reject an active slug owned by another page

### Slug change cases

#### Case 1 — unused slug

If the requested slug is unused:

1. insert the old active slug as historical if not already present
2. make the requested slug the new active slug
3. rewrite all internal persisted `href` links referencing that page
4. keep all other slug rows unchanged

#### Case 2 — page’s own historical alias

If the requested slug is already a historical alias of the same page:

1. demote the current active slug to historical
2. promote the requested historical slug to active
3. rewrite all internal persisted `href` links referencing that page

#### Case 3 — historical alias owned by another page

If the requested slug is a historical alias of another page:

1. remove that historical alias row from the other page
2. demote the current active slug of the target page to historical
3. assign the requested slug as the target page’s new active slug
4. rewrite all internal persisted `href` links referencing the target page

The other page keeps its own active slug unchanged.

This happens automatically with no extra confirmation step, because historical alias ownership is treated as an internal implementation detail rather than a user-facing concept.

#### Case 4 — active slug owned by another page

If the requested slug is the active slug of another page:

- reject the change
- explain that the Page URL is already in use
- instruct the user to rename the other page first if they want to free it up
- do not offer force takeover
- do not mutate the other page in the background

### Internal href rewrite rules

Whenever a page’s active slug changes, rewrite all persisted internal `href` properties referencing that page.

Rewrite scope:

- inspect the schema for every property named `href`
- inspect all persisted documents that can contain such properties:
  - page documents
  - nav document
  - footer document

Rewrite targets:

- `/${old_slug}`
- `/${old_slug}#fragment`

Do not rewrite:

- external URLs
- same-page anchors like `#section`
- `/`
- unrelated slugs

Rewrite output:

- `/${new_active_slug}`
- preserve `#fragment` if present

Implementation rule:

- resolve hrefs to `document_id` before deciding whether they reference the changed page
- this avoids ambiguity when aliases are involved

### Save-time reference extraction

`document_refs` extraction must continue to normalize internal links to `document_id`.

That means:

- slug changes do not change graph identity
- only the stored href strings change
- reachability logic remains document-id based

### Page browser data requirements

Extend the page browser query to return, for each page:

- `document_id`
- extracted title
- optional `preview_media_node`
- current active slug for non-home pages
The home page row must additionally be marked so the UI can:

- display `/` as its URL
- hide URL editing
- hide delete

### Home page rules

Keep these rules explicit in implementation:

- `/` is always canonical for the home page
- the home page is not reassigned to another page
- the home page does not need a slug row in `document_slugs`
- URL editing is hidden for the home page
- requests to historical aliases of the home page are not needed because the home page does not participate in slug history

### Deletion behavior

When deleting a page:

1. delete all slug rows for that `document_id`
2. delete the page document
3. update `document_refs`
4. do not rewrite incoming links
5. allow broken links to remain

UI behavior:

- if the page is still reachable/linked, warn the user
- recommended workflow remains: unlink first, then delete

### Required server helpers

Add focused helpers for:

- resolve slug → `{ document_id, is_active, active_slug }` for non-home pages
- get active slug for `document_id`
- generate initial unique slug for a non-home page
- promote/demote slug rows during slug changes
- claim historical aliases automatically when they are not active
- rewrite internal hrefs referencing a page
- list pages with active slug + summary data, while special-casing the home page as `/`

### Required transaction boundaries

These operations must be atomic:

#### First page save
- create page row
- create first active slug row

#### Manual slug change
- update slug rows
- rewrite hrefs in all affected documents
- update `document_refs` for rewritten documents

#### Historical alias reclaim
- remove alias from old owner
- update target page active slug
- rewrite hrefs in all affected documents
- update `document_refs` for rewritten documents

If any part fails, the whole slug change must roll back.

### Suggested implementation order

1. fold `document_slugs` into the initial schema setup
2. add slug resolution helpers and uniqueness helpers for non-home pages
3. update page loading routes and APIs to resolve non-home pages by slug while keeping `/` special-cased
4. update first-save flow to assign initial slug and navigate to `/:slug`
5. add page browser query support for active slug
6. add URL editing UI in the page browser
7. implement manual slug change flow for unused slug and own historical alias
8. implement automatic claiming of historical aliases owned by other pages
9. implement href rewriting across all schema `href` properties
10. wire canonical `301` redirects for historical aliases
11. hide URL editing for the home page and display `/`
12. verify delete flow removes slug rows and keeps warning behavior

### Definition of done

This step is done when all of the following are true:

- new non-home pages get a human-readable slug on first save
- public non-home page routes use `/:slug`
- old aliases `301` redirect to the current active slug
- title changes no longer auto-change slugs
- users can edit URL from the page browser for non-home pages
- active slugs cannot be taken from another page
- historical aliases owned by other pages are claimed automatically when requested
- all internal persisted `href` links referencing a page are rewritten when that page’s active slug changes
- the home page is always `/` and URL editing is hidden for it
- deleting a page removes all of its slug rows

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
  home_page_id: string | null,
  page_forest: PageTreeNode[]
}
```

Where `PageTreeNode` is:

```js
{
  document_id: string,
  title: string,
  preview_image_src: string | null,
  page_href: string,
  children: PageTreeNode[]
}
```

The page browser should render a single forest of page subtrees, not separate `drafts` and `sitemap` sections.

Rules for the returned forest:

- every page appears exactly once in the forest
- the configured home page appears as one root node if it exists
- the home page root is always the **last** root in the forest
- all other roots come first and represent entry pages for page subtrees that are not linked from the home page, ordered deterministically by first-seen traversal across the remaining unassigned pages
- those non-home roots may themselves have descendants and therefore represent parallel site hierarchies
- the client should not need to reconstruct graph relationships or merge multiple datasets

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

## Decision 8: all pages are public by URL; home reachability only controls sitemap inclusion

Pages should no longer be modeled as private drafts.

Instead:

- every page is public by default
- every page gets a slug and is discoverable by direct URL
- pages not linked from the home page are **unlisted**, not private
- only pages reachable from the home page graph are included in `sitemap.xml`

This means the system supports both:

- the main site hierarchy rooted at the home page
- additional parallel page hierarchies that are routable but not advertised to search engines through `sitemap.xml`

This matches the actual routing behavior better than the old draft/public split.

## Decision 9: internal page reference rules are route-based and deterministic

Internal page references should follow these rules:

- page routes are slug-based
- `/` is the home page
- `/${slug}` is an internal link to the page with that active slug
- `/${slug}#section` is also an internal link to that page; the `#section` fragment is ignored for reachability / sitemap purposes
- `/#section` is **not** a page reference when it points to the current home page; it is just an in-page anchor and must not create a `document_refs` edge
- more generally, anchor links that resolve to the **same page** are ignored for `document_refs`
- external URLs are ignored

This means `document_refs` should track page-to-page relationships by normalized target page id, not by full href string. Fragments are only relevant for browser navigation, not for sitemap reachability.

## Decision 10: the page browser shows a canonical forest, with the home subtree last

The page browser should render a **forest projection** of all pages, not a split between drafts and sitemap and not a full graph visualization.

### Final forest-building rule

- **No duplicates in the forest**
- **First occurrence wins**
- **Home subtree last**
- **Non-home entry roots first**
- **Within each subtree, preserve deterministic traversal order**
- **Recursive ordering for child pages:** body links only after placement, except for the home root which seeds its top level from shared nav links, home page body links, then shared footer links

This means:

- Build the canonical home subtree first using the existing main-site ordering:
  1. shared nav links
  2. home page body links
  3. shared footer links
- Recurse into placed child pages using body-derived links only.
- Mark every page placed into that home subtree as already assigned.
- Then scan the remaining unassigned pages and create additional root nodes for them in a deterministic order based on the first page encountered in a stable traversal of the remaining page set.
- For each such non-home root, recurse through body-derived links only, again using first occurrence wins, so each parallel subtree is stable even when pages cross-link.
- Append the home root as the final root in the returned forest.

This produces a deterministic, editor-friendly page browser:

- the main site remains easy to read because the home subtree is intact
- pages outside the home-linked site are still visible in the same browser
- parallel site hierarchies are represented naturally as additional roots
- repeated references do not crowd the drawer with duplicates

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

### 4.5 Add per-page drawer actions
Implemented:
- each draft and page row gets an anchored ellipsis menu
- the menu supports `Open in new tab`
- the menu supports `Delete`
- the menu is dismissible with `Escape` or backdrop click

### 4.6 Add page deletion flow
Implemented:
- deleting a draft asks: `Are you sure you want to delete this draft?`
- deleting a reachable page asks: `Are you sure you want to delete this page? You'll leave some dead links on the page.`
- deleting a page removes the page document and its related `document_refs` / `asset_refs`
- deleting a page does not repair incoming links; those become dead links until edited
- the configured home page cannot be deleted
- if the currently open page is deleted, navigate to `/`

Note:
- drawer-close-on-click can be refined later if needed
- the drawer resize handle should render outside the drawer panel, centered on the top edge, so it visually floats above the sheet instead of taking space inside the drawer content area
- while dragging, the drawer should be able to move all the way down to the bottom of the viewport
- on drag release near zero height, the drawer should animate smoothly down to `0` height and then close instead of remaining open at a tiny height or closing abruptly
- otherwise, on drag release, the drawer should snap to the nearest preset height based on the release position: `1/3`, `2/3`, or `3/4` of the viewport height
- after release, the drawer height should animate smoothly toward the snapped value rather than jumping immediately, including when dragged above the highest snap point and settling back to `3/4`
- when the drawer is reopened after being closed near zero height, it should restore the previous non-zero snapped height
- add a contextual search box to the page browser drawer
- the search should run client-side against the already loaded drawer data; no dedicated server search endpoint is needed for the initial implementation
- focus the search box as soon as the drawer is opened
- drafts should be filtered independently by the same search query
- sitemap filtering should preserve structural context:
  - if a page directly matches the query, show that page
  - if a page directly matches the query, also show all of its descendants
  - if a descendant matches the query, also show its ancestor chain up to the root so the placement in the site structure remains visible
- direct matches should be visually highlighted so it is clear why a page is shown
- pages shown only because their parent matched or because they are ancestors of a match should remain visible but should not use the same direct-match highlight treatment
- while a search query is active, matching branches should be shown even if they would otherwise be collapsed
- keyboard navigation should work over the currently visible search results:
  - `ArrowDown` moves to the next visible result
  - `ArrowUp` moves to the previous visible result
  - `Enter` opens the currently selected result
- the keyboard result order should follow the visible drawer order so navigation feels predictable
- the existing canonical sitemap tree remains the source of truth; search does not need to surface secondary graph placements for pages that are linked from multiple places
- the expected scale is on the order of hundreds of pages (for example around 500), so a straightforward client-side tree traversal per query is acceptable

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
