# Architecture

This document describes the backend architecture for Editable Website v2.

## Overview

Editable Website is a SvelteKit application that lets site owners edit content directly in the browser. The editor (Svedit) works with a graph-based document model — a flat map of nodes with references between them. The backend stores these documents in SQLite and serves them to the frontend, stitching together shared content (nav, footer) with page-specific content into a single document that Svedit can edit locally.

## Data storage

All persistent data lives in the `data/` directory:

```
data/
├── site.sqlite3                              # all documents
└── assets/
    ├── AgvsfNbEMzUNEcragSpuH.webp            # stored original (≤ MAX_IMAGE_WIDTH)
    ├── AgvsfNbEMzUNEcragSpuH/
    │   ├── w320.webp                         # variant
    │   ├── w640.webp
    │   ├── w1024.webp
    │   └── w1536.webp
    ├── BxKmRtPqWnYFHdJcLuVoZ.mp4            # video passthrough
    ├── CyLnStQuXoZAGeBfKwMrJ.gif            # animated gif passthrough
    └── ...
```

### SQLite database

The database (`data/site.sqlite3`) contains a `documents` table:

```sql
CREATE TABLE documents (
    document_id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    data TEXT
);
```

- `document_id` — a persistent identifier (nanoid), e.g. `page_1`, `nav_1`
- `type` — categorizes the document, e.g. `page`
- `data` — the full Svedit document serialized as JSON (`{ document_id, nodes }`)

Each document's `data` column contains a self-contained Svedit document: a `document_id` and a flat `nodes` map where every node is keyed by its `id`.

### Assets

Assets (images, videos) are stored as files in `data/assets/`. There is no `assets` table in the database — assets are referenced directly by path from image nodes.

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
    "src": "/assets/AgvsfNbEMzUNEcragSpuH.webp",
    "width": 1600,
    "height": 900,
    "alt": "Feature image",
    "scale": 1.0,
    "focal_point_x": 0.5,
    "focal_point_y": 0.5,
    "object_fit": "cover"
}
```

The `src` includes the file extension (e.g. `.webp`, `.mp4`, `.gif`, `.svg`), so the serving layer can resolve the file directly without a database lookup.

This keeps things simple. An image node that appears on one page is local to that page's document. If the same visual asset needs to appear on multiple pages, each page has its own image node pointing to the same asset path. The file on disk is shared, but the node metadata (alt text, focal point, scale, object fit) is per-usage.

### Asset path convention

Each asset gets a nanoid at upload time. The original is stored with its extension, and width variants (images only) live in a subdirectory:

```
data/assets/
├── AgvsfNbEMzUNEcragSpuH.webp              # stored original
├── AgvsfNbEMzUNEcragSpuH/
│   ├── w320.webp                            # variant
│   ├── w640.webp
│   ├── w1024.webp
│   └── w1536.webp
├── BxKmRtPqWnYFHdJcLuVoZ.mp4              # video passthrough
├── CyLnStQuXoZAGeBfKwMrJ.gif              # animated gif passthrough
└── ...
```

The image node's `src` stores the full asset path including extension (e.g. `/assets/AgvsfNbEMzUNEcragSpuH.webp`). The `width` and `height` of the original are stored on the image node. Variant URLs are derived by stripping the extension and appending `/w{width}.webp` — no database lookup needed for `srcset`:

```html
<img
    src="/assets/AgvsfNbEMzUNEcragSpuH.webp"
    srcset="
        /assets/AgvsfNbEMzUNEcragSpuH/w320.webp 320w,
        /assets/AgvsfNbEMzUNEcragSpuH/w640.webp 640w,
        /assets/AgvsfNbEMzUNEcragSpuH/w1024.webp 1024w,
        /assets/AgvsfNbEMzUNEcragSpuH.webp 1600w
    "
/>
```

Variants wider than the original are not generated (no upscaling). The original always serves as the largest variant.

### Media type handling

Different media types are handled differently:

| Type | Client processing | Stored as | Variants |
|---|---|---|---|
| Static images (JPEG, PNG, WebP, HEIC) | Resize to `MAX_IMAGE_WIDTH`, convert to WebP via WASM | `{id}.webp` | Yes (`{id}/w320.webp`, etc.) |
| Animated GIFs | Passthrough | `{id}.gif` | No |
| SVGs | Passthrough | `{id}.svg` | No |
| Videos (MP4, WebM) | Passthrough | `{id}.mp4` / `{id}.webm` | No |

### Image size constraints

Images are constrained by `MAX_IMAGE_WIDTH` (e.g. 4000px). The client resizes any image wider than this limit before upload.

We constrain width only, not height, because width is what matters for responsive images — `srcset` widths map to viewport widths. An unusually tall image (e.g. 2000×8000 infographic) is a legitimate use case and the file size is naturally bounded by the width constraint combined with WebP compression. Extreme aspect ratios are the user's choice.

### Client-side image processing

All image resizing and format conversion happens **client-side** using WebAssembly, keeping the server simple (no Sharp, no image processing dependencies, no CPU spikes).

The processing pipeline uses `@jsquash/webp` (libwebp compiled to WASM) for WebP encoding and `@jsquash/resize` (Lanczos3 resampling) for resizing, running in a Web Worker to avoid blocking the main thread.

For each image the user pastes or drops:

1. **Decode** — `createImageBitmap` + `OffscreenCanvas` → `ImageData` (browser-native, handles all common formats)
2. **Resize original** — if width > `MAX_IMAGE_WIDTH`, resize down preserving aspect ratio
3. **Encode original** — encode as WebP (quality 80)
4. **Generate variants** — for each configured width smaller than the original: resize → encode as WebP
5. **Upload** — send original + all variants to the server sequentially (one at a time to keep memory low)

Images are processed one at a time. After generating all variants for one image, raw pixel data is released. Only the encoded WebP blobs are kept in memory until uploaded.

### Variant widths

The set of variant widths is defined by a global configuration:

```
IMAGE_SIZES = [320, 640, 1024, 1536, 2048]
```

Only widths smaller than the original are generated. The original serves as the largest size.

### Upload flow

1. User pastes or drops an image onto the page
2. Client decodes, resizes to `MAX_IMAGE_WIDTH` if needed, converts to WebP, generates all width variants — all via WASM in a Web Worker
3. Client uploads the original: `POST /api/assets` with WebP blob → server stores in `data/assets/{id}.webp`, returns `{ id, width, height }`
4. Client uploads each variant: `POST /api/assets/{id}/variants` with WebP blob + `X-Variant-Width` header → server writes to `data/assets/{id}/w{width}.webp`
5. Client updates the image node's `src`, `width`, and `height` properties
6. Videos, animated GIFs, and SVGs skip client-side processing — uploaded as-is

### Asset cleanup

When a document is saved and an image node's `src` has changed (or the node was deleted), the previously referenced asset file may become orphaned. Orphan cleanup can be handled by a periodic task that scans all documents for referenced asset paths and removes any asset directories in `data/assets/` that are no longer referenced.

## API endpoints

### Documents

- `GET /api/documents/:id` — load a document (with shared documents stitched in)
- `PUT /api/documents/:id` — save a document (server splits shared nodes back out)

### Assets

- `POST /api/assets` — upload an original image, returns `{ id, width, height }`
- `POST /api/assets/:id/variants` — upload a pre-generated width variant
- `GET /assets/:id.{ext}` — serve the original (static file serving from `data/assets/`)
- `GET /assets/:id/w:width.webp` — serve a width variant (static file serving from `data/assets/`)

Asset serving endpoints return `Cache-Control: public, max-age=31536000, immutable` — asset ids are content-addressed (or at minimum never reused), so they can be cached forever.

Video and audio originals support HTTP Range requests for seeking.

## Authentication

Authentication is handled in `hooks.server.js`. Currently stubbed with `event.locals.user = 'Admin'`. Write operations (saving documents, uploading assets) require authentication. Read operations are public.