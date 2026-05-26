# Implementation plan

This document tracks what to implement next. One step at a time. All implementation must conform to the design decisions in [ARCHITECTURE.md](ARCHITECTURE.md) — if a conflict arises, update the architecture first, then implement.

## Next implementation draft — four columns with intro

### Goal

Add a reusable `four_columns_with_intro` body block for sections with optional intro content and four descriptive media cards.

### Scope

- Add `four_columns_with_intro` to the page body schema and component registry.
- Add `descriptive_media_card` as the child node type for the block's `columns` array.
- Give each card a fixed 4:3 `media` property, a `body` text-node array, and a fixed bottom `buttons` area represented as a one-item node array.
- Add inserters that create one intro text node and four default descriptive media cards.

## Current implementation draft — presentation page setup

This step adapts the page body into a presentation-style sequence.

### Goal

Make direct `page.body` blocks behave like full-window slides while limiting page body block types to `hero` and `feature`.

### Scope

- Restrict the `page.body` schema to `hero` and `feature`, with `hero` as the default inserted node.
- Remove obsolete page body block inserters and layouts from the session config.
- Keep supporting node types required by `hero`, `feature`, media, and annotations, including `decoration` inside `feature.body`.
- Make `Hero.svelte` and `Feature.svelte` render each node as an exact viewport-height slide with overflow clipped.
- Add a shared non-editable `SlideHeader` rendered at the top of every slide, with slide content filling the remaining viewport height.
- Add a non-editable `HelpDialog` opened from the slide header help button.
- Disable manual page scrolling in viewer mode while keeping hash-link slide jumps, same-page hash history back/forward, and edit-mode scrolling available.
- Trim the demo page body to its existing hero and feature blocks.
- Update new-page scaffolding so new pages start with a hero instead of a prose block.

## Next implementation draft — body-node deep links

This step adds a same-page body-node target picker to the create/edit link flow.

### Goal

Let editors create links to direct `page.body` slides on the current page by selecting the target visually from the page body.

The saved link href must be a pure fragment using the selected node id:

- `#node_id`

This first version only targets direct children of the current page root's `body` property. It does not support nested body descendants or choosing nodes from another page.

### Scope

- Add a body-node selector button next to the existing page-browser button in both `CreateLink.svelte` and `EditLink.svelte`.
- Show the button wherever the create/edit link prompt is available; do not gate it on backend availability or admin status.
- When the button is clicked, hide the current link prompt and enter `select_body_node` mode.
- Render click-target overlays for each direct child of `page.body` while `select_body_node` mode is active.
- Show hover feedback that looks like the existing selection rectangle and includes the text `Click to link to this Slide`.
- On click, update the link href to `#${node.id}` and exit `select_body_node` mode.
- Support canceling the mode with `Escape` without changing the link.

### State ownership

Create app-level selector state rather than storing this mode in Svedit core or in the page browser. A small context module should coordinate the flow across link prompt components and overlays.

Suggested file:

- `src/routes/components/body_node_selector_context.svelte.js`

Suggested state/API:

- `state.active`
- `state.on_select_node`
- `state.hovered_node_id`
- `open_select(on_select_node)`
- `close()`
- `handle_node_selected(node)`
- `set_hovered_node(node_id)`

Initialize and provide this context from `App.svelte`, similar to `page_browser_context.svelte.js`.

### Component changes

#### `CreateLink.svelte`

- Import the body-node selector context.
- Add the selector button next to the page-browser button.
- On click:
  - preserve the current text selection if needed so `annotate_text('link', ...)` still applies to the original selection after the overlay click
  - set `toggle_link_command.show_prompt = false`
  - call `body_node_selector.open_select(...)`
- In the selection callback:
  - apply `svedit.session.tr.annotate_text('link', { href: '#' + node.id, target: '_self' })`
  - close selector mode
  - focus the canvas

#### `EditLink.svelte`

- Import the body-node selector context.
- Add the selector button next to the page-browser button.
- On click:
  - capture the current target link node
  - set `edit_link_command.show_prompt = false`
  - call `body_node_selector.open_select(...)`
- In the selection callback:
  - set the captured link node's `href` to `#${node.id}`
  - set its `target` to `_self`
  - apply the transaction
  - close selector mode
  - focus the canvas

#### `BodyNodeSelector.svelte`

Create `src/routes/components/BodyNodeSelector.svelte`.

Responsibilities:

- Read the current page root via `svedit.session.doc.document_id`.
- Read direct body node ids from the page root's `body` array.
- For each direct body node, render an absolute overlay positioned with the existing node anchor:
  - path: `[page_id, 'body', index]`
  - anchor name: `--${serialize_path(path)}`
- Use pointer events so overlays are the active click targets.
- On hover, set hovered node state and show the label `Click to link to this Slide`.
- On click, prevent default editor interaction, stop propagation, and call `body_node_selector.handle_node_selected(node)`.
- Add document-level `Escape` handling to cancel selection mode.

#### `Overlays.svelte`

- Import and render `BodyNodeSelector.svelte` when selector mode is active.
- While selector mode is active, suppress conflicting overlays and prompts:
  - link preview
  - create-link prompt
  - edit-link prompt
  - media controls
  - property selection overlay
- Keep unrelated app overlays like auth unchanged.

### Styling

- Use Tailwind classes for the overlay label and general layout.
- Use minimal custom CSS only where anchor positioning requires it.
- Keep overlays rectangular; do not add rounded corners.
- Reuse the editor selection colors where possible:
  - `--svedit-editing-fill`
  - `--svedit-editing-stroke`

### Validation

Manual validation only for this step:

1. Create a text link, use the body-node selector, click a body slide, and confirm the annotation href is `#selected_node_id`.
2. Edit an existing text link and retarget it to a different body slide.
3. Edit a link-ish node with an `href` property and retarget it to a body slide.
4. Confirm hovering a slide shows the selection-style overlay and `Click to link to this Slide` label.
5. Press `Escape` during selection mode and confirm no link changes.
6. Confirm the existing page-browser link button still works.
7. Save, leave edit mode, click the deep link, and confirm the browser scrolls to the selected slide.

## Next implementation draft — admin authentication

This step adds simple owner authentication for editing and private page-management features.

### Goal

Implement admin authentication with these rules:

- the admin password is configured via `ADMIN_PASSWORD`
- `ADMIN_PASSWORD` is required in full runtime mode; if it is missing, the app must not start
- whoever knows that password can authenticate as admin
- authenticated admins can edit and save content and use admin-only presentation management actions
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
- server-side protection for admin-only presentation management mutations
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
- any persistent asset mutation flow used during save
- `get_page_browser_data(...)`

For these authenticated operations, successful session validation should also extend the session expiry to `now + 2 weeks`.

Public page/document reads remain public:

- presentation loading by document id
- presentation index loading
- internal link preview for already-public presentations

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
- there is no admin presentation management access
- there is no create-presentation flow
- there is no delete-presentation flow
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
- admin-only presentation management actions are hidden unless authenticated as admin
- toolbar actions that require admin auth must be hidden or disabled when unauthenticated
- authenticated admins get an explicit logout button

### Presentation management behavior

Presentation management actions are admin-only.

Required behavior:

- unauthenticated users can view the public presentation index and open presentations
- unauthenticated users do not see create/delete actions
- authenticated admins see the `New` action and delete/manage actions on `/`
- all server-side management mutations remain protected even if the client UI is bypassed

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

## Next implementation draft — presentation index and document-id routes

This step specializes the app around presentations addressed by stable document ids. It removes the slug layer and changes the backend-mode `/` route from a document route into a public presentation index.

### Goal

In backend mode:

- `/` lists all page documents as presentations
- each presentation is addressable at `/:document_id`
- authenticated admins see a `New` action on `/` that links to `/new`
- `/new` continues to create an unsaved presentation and persists it on first save
- after first save, the client navigates to `/${document_id}`
- no slug generation, slug resolution, historical aliases, or slug rewrite logic remains

In static / `VERCEL=1` mode:

- `/` continues to render the bundled demo document (`page_1`)
- the backend presentation index is disabled
- home-route server code must continue to avoid top-level imports of backend-only modules

### Scope

- Replace backend `/` rendering with a presentation index component.
- Keep static / `VERCEL=1` `/` rendering as the current demo document editor/viewer.
- Keep `/:page_id` route shape but treat the route param as `document_id`, not slug.
- Update server document loading to fetch by `document_id` directly.
- Remove slug generation and resolver helpers from `$lib/api.remote.js`.
- Remove `document_slugs` reads/writes and add a migration or cleanup step for existing databases.
- Remove Page URL editing from the old page drawer/index management UI because URLs are fixed document-id routes.
- Update internal link parsing and link previews to resolve `/${document_id}` directly.
- Update document reference extraction to normalize internal links by direct document-id lookup.
- Update save flow so first save returns `document_id` only and the client navigates to `/${document_id}`.
- Update delete behavior so there is no protected home page document. Page documents, including `page_1`, can be deleted by admins in backend mode.
- Move the useful page drawer interface into `/` and remove the contextual page drawer flow.

### Route behavior

#### `/` in static / `VERCEL=1` mode

Keep current behavior:

- server load returns `has_backend: false`
- client renders `<App>` with the demo document fallback
- no backend-only module is imported at top level from the home route

#### `/` in backend mode

Change behavior:

- server load lazily imports a backend helper only inside the `has_backend` branch
- server load returns presentation index data instead of a document
- page component renders a new index component rather than `<App>`
- index links each presentation to `/${document_id}`
- index includes search and the useful management affordances currently living in the page drawer
- if `is_admin` is true, show a `New` link to `/new` and admin-only presentation actions like delete

Suggested new component:

- `src/routes/components/PresentationIndex.svelte`

Index item data should include:

- `document_id`
- `title`
- `description`
- `preview_media_node`
- `page_href` as `/${document_id}`
- `created_at`
- `updated_at`

Ordering should be deterministic. Prefer most recently updated first, falling back to title and then `document_id`.

#### `/:document_id`

Use the existing `src/routes/[page_id]` route initially, but update names and semantics in code:

- route param value is a document id
- load calls `get_document(document_id)` or a renamed helper like `get_presentation(document_id)`
- no redirect handling for historical slug aliases
- unknown ids return 404
- returned data no longer needs `slug`

A later cleanup may rename the folder from `[page_id]` to `[document_id]`, but that is optional because the URL shape is unchanged.

#### `/new`

Keep the route admin-only.

Required changes:

- new presentation documents are self-contained and are not composed from shared nav/footer documents
- remove `get_shared_documents()` usage from `/new`
- update the new-page helper/template so it creates a complete standalone presentation document
- first save returns `{ ok, document_id, created }`
- client navigates to `/${document_id}` with `replaceState: true`

### Server API changes

#### Remove slug concepts

Remove or stop using:

- `slugify` dependency/import from `$lib/api.remote.js`
- `update_page_slug_input_schema`
- `get_active_slug_for_document_id(...)`
- `resolve_slug(...)`
- `create_slug_candidate(...)`
- `create_unique_slug(...)`
- `rewrite_internal_page_href(...)`
- `rewrite_internal_page_hrefs(...)`
- `insert_active_slug(...)`
- `move_active_slug_to_history(...)`
- `assign_active_slug(...)`
- `update_page_slug(...)`
- `redirect_to_slug` return values
- `slug` fields in page summary/tree/index data

Remove database dependency on:

- `document_slugs`
- `document_slugs_active_document_id_idx`

For existing databases, add a migration that drops `document_slugs` if it exists. If the project chooses to keep old migrations immutable, add a new cleanup migration and stop creating or querying the table in current logic.

#### Document loading

Change `get_document` to accept a document id:

1. validate the input as a string document id
2. fetch `documents.document_id = input AND type = 'page'`
3. return the stored self-contained document directly
4. throw if missing

`get_home_document` should be removed or unused in backend mode, because there is no backend home document.

#### Presentation listing

Add a public helper/query for the index route, for example:

- `get_presentation_index()`

It should list all `documents.type = 'page'`, parse their stored docs, extract metadata with `extract_page_metadata(...)`, and return `page_href: '/' + document_id`.

This helper is public because `/` publicly lists all presentations in backend mode.

#### Self-contained documents for `/new`

Remove the shared-document dependency from `/new`.

Required behavior:

- `/new` does not load `nav_1`, `footer_1`, or any shared document data
- `create_empty_doc(...)` no longer accepts shared documents
- the new-page helper creates a complete standalone presentation document with its root `page`, metadata fields, initial slide, and any required child nodes
- save persists that one document as `type = 'page'`

#### Internal href parsing

Replace slug-based parsing with document-id-based parsing:

- ignore external URLs and protocol-relative URLs
- ignore same-page fragments like `#slide_id` for document references
- accept only one-segment absolute paths like `/${document_id}` and `/${document_id}#fragment`
- check that the segment resolves to an existing page document
- return that `document_id`

No link rewrite is needed because document ids are stable.

### Client changes

#### `App.svelte`

- Remove `slug` prop usage if any remains.
- Update first-save navigation from `/${result.slug}` to `/${result.document_id}`.
- Remove read-back-by-slug validation; if keeping read-back validation, call `get_document(result.document_id)`.
- Keep cancel from `/new` returning to `/`.

#### Home route components

- Update `src/routes/+page.server.js` to branch:
  - static mode: return data that renders `<App>` with demo fallback
  - backend mode: lazily load presentation index data and return it
- Update `src/routes/+page.svelte` to render:
  - `<App>` when `has_backend` is false
  - `<PresentationIndex>` when `has_backend` is true

#### Presentation index component

Create `PresentationIndex.svelte` by migrating the useful page drawer behavior into the `/` route.

Required UI:

- list of all presentations
- search/filter comparable to the existing page drawer search
- link card/row to `presentation.page_href`
- preview media when available
- title and optional description
- optional updated timestamp
- shared app toolbar with a round icon new-presentation tool visible on `/` even when signed out
- no explicit login tool; signed-out users authenticate implicitly when they click the new-presentation tool
- page-route toolbar tools hidden while signed out, with the edit shortcut still opening admin login
- edit tool only on authenticated page routes, not on the index route
- admin-only row/menu actions that still apply, including open in new tab and delete with confirmation

Do not include Page URL editing or slug UI. Use Tailwind classes and rectangular styling.

#### Remove contextual page drawer

After the `/` index has the migrated search and management UI:

- remove the contextual page drawer entry point from the toolbar/overlays
- remove `page_browser_context.svelte.js` if no longer needed by any remaining link-selection flow
- remove or simplify `PagesDrawer.svelte` after its useful behavior is migrated
- remove Page URL edit dialog and `update_page_slug` calls
- remove `is_home_page` checks and home URL locking
- remove special home-page delete protection from the client UI and server command
- keep delete confirmation for page documents, including `page_1`

#### Link creation and previews

- Existing same-page `#node_id` links remain unchanged.
- Cross-presentation links selected from any presentation list should use `/${document_id}`.
- `LinkPreview.svelte` should treat `/${document_id}` as an internal presentation link and call the preview query with that href.

### Database and seed changes

- Stop creating `document_slugs` in the current schema path if the project allows editing the initial migration.
- Otherwise add a new migration that drops `document_slugs` and its active index if present.
- Stop writing a `home_page_id` setting for routing. It may remain in old databases temporarily, but runtime code should not require it.
- Stop seeding `nav_1` and `footer_1` as shared documents for this app.
- Keep seeding `page_1` as a self-contained demo presentation in backend mode.
- In backend mode, seeded `page_1` appears as one presentation in the `/` index and is reachable at `/page_1`.
- Admins can delete `page_1` in backend mode like any other presentation.
- In static mode, `/` still renders demo `page_1` directly.

### Validation

Manual validation for this step:

1. In `VERCEL=1` mode, `/` renders the demo document as before.
2. In backend mode, `/` renders the presentation index, not the editor page.
3. Backend `/` lists seeded `page_1` with a link to `/page_1`.
4. A non-admin visitor does not see `New` on `/`.
5. An authenticated admin sees `New` on `/` and it links to `/new`.
6. `/page_1` loads the seeded presentation.
7. An unknown `/:document_id` returns 404.
8. Creating and saving a new presentation navigates to `/${document_id}`.
9. Internal links to `/${document_id}` produce `document_refs` rows.
10. Same-page `#node_id` links do not produce `document_refs` rows.
11. `/` search filters presentations similarly to the old page drawer.
12. Admin delete works from `/`, including deleting `page_1` in backend mode.
13. The contextual page drawer is no longer surfaced.
14. No runtime code queries `document_slugs` or imports `slugify`.

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
