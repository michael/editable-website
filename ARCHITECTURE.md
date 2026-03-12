# Architecture

> **Work in progress** — this document is actively being developed and may change significantly. It was written with AI assistance and iterated on to serve as a specification for implementation.

This document describes the backend architecture for Editable Website v2.

## Overview

Editable Website is a SvelteKit application that lets site owners edit content directly in the browser. The editor (Svedit) works with a graph-based document model — a flat map of nodes with references between them. The backend stores these documents in SQLite and serves them to the frontend, stitching together shared content (nav, footer) with page-specific content into a single document that Svedit can edit locally.

## Data storage

All persistent data lives in the `data/` directory:

```
data/
├── site.sqlite3                              # all documents
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

The database (`data/site.sqlite3`) contains three tables:

```sql
CREATE TABLE documents (
    document_id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    data TEXT
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

**`asset_refs`**

Tracks which assets are referenced by which documents. The compound primary key `(asset_id, document_id)` naturally deduplicates — a document referencing the same image five times still produces one row.

This table is the single source of truth for asset ownership. It enables cleanup of orphaned assets and makes cross-page copy-paste work without complications (pasted image nodes point to shared assets that already exist on disk).

**`sessions`**

- `session_id` — a cryptographically secure UUID (generated via `crypto.randomUUID()`)
- `expires` — Unix timestamp (seconds) when the session expires

Expired sessions are deleted on lookup. No background cleanup job needed.

### Assets

Assets (images, videos) are stored as files in `data/assets/`. Assets are referenced from image nodes via their `src` property. The `asset_refs` table tracks which documents reference which assets.

## Documents

### Document types

- **Page documents** — each page on the site (e.g. home, about, blog posts). Contains all the page-specific nodes: prose, features, galleries, figures, etc. Also contains references to shared documents (nav, footer) via node properties.
- **Nav document** — a single shared document containing the navigation structure (`nav` node + `nav_item` nodes). Referenced by page documents via the `nav` property on the `page` node.
- **Footer document** — a single shared document containing the footer structure (`footer` node + `footer_link_column` + `footer_link` nodes). Referenced by page documents via the `footer` property on the `page` node.

### Document composition

Svedit operates on a single flat document — it has no concept of "shared" vs. "local" nodes. The server is responsible for stitching documents together on read and splitting them apart on write.

**On read (loading a page):**

1. Fetch the page document from the database
2. Read the `nav` and `footer` references from the page's root node
3. Fetch those shared documents from the database
4. Merge all nodes into a single flat `nodes` map
5. Return the combined document to the client

```
page document          nav document          footer document
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ page_1       │      │ nav_1        │      │ footer_1     │
│   nav: nav_1 │─────▶│ nav_item_1   │      │ footer_col_1 │
│   footer: …  │──┐   │ nav_item_2   │      │ footer_lnk_1 │
│ prose_1      │  │   │ ...          │      │ ...          │
│ feature_1    │  │   └──────────────┘      └──────────────┘
│ ...          │  └────────────────────────────────▲
└──────────────┘

                        combined document sent to client
                    ┌────────────────────────────────────┐
                    │ page_1, nav_1, nav_item_1, ...     │
                    │ prose_1, feature_1, ...             │
                    │ footer_1, footer_col_1, ...         │
                    └────────────────────────────────────┘
```

**On write (saving a page):**

1. Receive the combined document from the client
2. Determine which nodes belong to the nav document, the footer document, and the page document (by walking the graph from each root node)
3. Write each document back to its own row in the database

This means changes to the nav or footer made on any page are persisted to the shared document and will be reflected on all pages.

## Assets

### No asset nodes

Assets are **not** tracked as separate entities in the database. There is no `assets` table and no dedicated `asset` node type in the schema.

Instead, image nodes reference assets directly via their `src` property:

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

The `src` field has two modes:

- **During editing (unsaved):** a blob URL (e.g. `blob:http://localhost:5173/a1b2c3d4`). The image displays immediately using the browser's in-memory blob. This is a temporary reference that only lives for the duration of the editing session.
- **After save (persisted):** an asset id (e.g. `c4b519da...fabdb.webp`). The blob URLs are replaced with asset ids during the save flow, after all assets have been successfully uploaded.

`Image.svelte` checks the `src` value: if it starts with `blob:`, use it directly as the image source. Otherwise, prefix it with `PUBLIC_ASSET_ORIGIN` (defaults to `/assets`) to construct the full URL. This keeps the document data location-agnostic — switching to a CDN or S3 bucket is a config change, not a data migration.

The asset id includes the file extension (e.g. `.webp`, `.mp4`, `.gif`, `.svg`), so the serving layer can resolve the file directly without a database lookup.

This keeps things simple. An image node that appears on one page is local to that page's document. If the same visual asset needs to appear on multiple pages, each page has its own image node pointing to the same asset path. The file on disk is shared, but the node metadata (alt text, focal point, scale, object fit) is per-usage.

### Asset ids and deduplication

The asset id is the **SHA-256 hex hash** of the user's source file **plus the file extension** of the stored format — e.g. `c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb.webp`. The hash is always computed on the **untouched source file** the user provides (e.g. the original PNG or JPEG), not on the processed WebP output. This ensures the same source file always produces the same id, regardless of encoder version, quality settings, or other processing parameters. The extension is determined by the stored format: static images are always converted to WebP (so the extension is `.webp`), while videos, animated GIFs, and SVGs keep their original extension (`.mp4`, `.webm`, `.gif`, `.svg`).

Because the id is content-derived, inserting the same file twice produces the same id — the upload is skipped and the existing asset is reused. No duplicate files on disk, no wasted storage.

The client computes the hash from the source file before any processing begins. If the server already has a file with that id, it returns the existing asset metadata immediately without accepting the upload body.

### No original filenames

Original filenames are never stored. All asset metadata (alt text, dimensions, scale, focal point) lives on the image node inside the document, not on the asset itself. This means metadata is page-local and redundant by design — changing alt text on one page doesn't affect another page that uses the same asset. It also avoids privacy concerns: user-generated filenames are never exposed via public URLs or headers.

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

The image node's `src` stores the asset id (e.g. `c4b519da...fabdb.webp`). The `width` and `height` of the original are stored on the image node. Full URLs are constructed at render time by prepending `PUBLIC_ASSET_ORIGIN`. Variant URLs are derived by stripping the extension from the asset id to get the stem, then appending `/w{width}.webp` — no database lookup needed for `srcset`:

```
ASSET_ORIGIN = /assets    (default, or e.g. https://cdn.example.com/assets)
asset id     = c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb.webp
stem         = c4b519da4c0a6512b5d9519aac0d9df7fab9152a6df109515456ada4702fabdb

original URL = {ASSET_ORIGIN}/{asset id}
variant URL  = {ASSET_ORIGIN}/{stem}/w320.webp
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

| Type | Client processing | Asset id example | Variants |
|---|---|---|---|
| Static images (JPEG, PNG, WebP, HEIC) | Resize to `MAX_IMAGE_WIDTH`, convert to WebP via WASM | `c4b519da...fabdb.webp` | Yes (`c4b519da...fabdb/w320.webp`, etc.) |
| Animated GIFs | Passthrough | `c4b519da...fabdb.gif` | No |
| SVGs | Passthrough | `c4b519da...fabdb.svg` | No |
| Videos (MP4, WebM) | Passthrough | `c4b519da...fabdb.mp4` / `.webm` | No |

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

1. `handle_image_paste` creates image nodes immediately, with `src` set to a blob URL of the unprocessed source file. Images display instantly — no waiting for processing.
2. The client computes the SHA-256 hash of the source file. This hash (plus extension) will become the asset id on save.
3. Background processing starts: decode → resize → encode original as WebP → generate all width variants. Processing is keyed by the blob URL that sits in `image.src`.
4. The user can continue editing, paste more images, or rearrange content. Background processing does not block the editor.
5. Videos, animated GIFs, and SVGs skip client-side processing — they'll be used and stored as-is'.

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

1. Walk the document's nodes, collect all `src` values from image nodes → the current set of asset ids
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

- `GET /api/documents/:id` — load a document (with shared documents stitched in)
- `PUT /api/documents/:id` — save a document (server splits shared nodes back out, updates `asset_refs`)

### Assets

- `HEAD /api/assets/:asset_id` — check if an asset exists (original + all expected variants). Returns `200` if complete, `404` if not. Used by the client to skip uploading duplicates.
- `POST /api/assets` — upload an original. Headers: `X-Content-Hash` (SHA-256 hex), `Content-Type`. Returns `{ id, width, height }`.
- `POST /api/assets/:asset_id/variants` — upload a pre-generated width variant. Headers: `X-Variant-Width`. Body: WebP blob.
- `DELETE /api/assets/:asset_id` — delete an asset and all its variants from disk. Used by the client to clean up after a failed variant upload.
- `GET {ASSET_ORIGIN}/:asset_id` — serve the original
- `GET {ASSET_ORIGIN}/:stem/w:width.webp` — serve a width variant

`ASSET_ORIGIN` defaults to `/assets` (served from `data/assets/` on disk). Can be configured to point to a CDN or S3 bucket.

Asset serving endpoints return `Cache-Control: public, max-age=31536000, immutable` — asset ids are content-addressed, so they can be cached forever.

Video and audio originals support HTTP Range requests for seeking.

## No asset manager

There is no asset manager UI and no "pick from existing assets" panel. Adding images always means selecting files from your computer and pasting them into the document — similar to how Google Docs works.

To reuse an image that's already on the site, navigate to the page that has it, copy the node (e.g. a gallery item or figure), and paste it into the target page. The pasted image node points to the same shared asset on disk — no re-upload needed. This keeps the interface simple and avoids building a separate media library.

## Admin interface

The only admin interface is a **site map** — a listing of all pages plus drafts (pages that are not linked anywhere yet). There is no need for a media library, asset browser, or content management dashboard beyond this.

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
