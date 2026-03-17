# Implementation plan

This document tracks what to implement next. One step at a time. All implementation must conform to the design decisions in [ARCHITECTURE.md](ARCHITECTURE.md) — if a conflict arises, update the architecture first, then implement.

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

```
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
- No database writes — assets are files on disk, not database rows. The `asset_refs` table is updated during document save, not during upload.

**`src/routes/api/assets/[asset_id]/variants/+server.js`** — `POST` upload a width variant.

- Request headers: `X-Variant-Width`, `Content-Type: image/webp`
- Request body: WebP blob
- Validates the asset id exists on disk (the original must have been uploaded first)
- Validates the width is in `VARIANT_WIDTHS_SET`
- The server trusts the client to only upload variants that are smaller than the original — the client already has the original dimensions and only generates applicable variants
- Extracts the stem from the asset id (strip the extension), writes to `ASSET_PATH/{stem}/w{width}.webp`
- Creates the variant directory if needed
- On failure: the caller (client save flow) sends `DELETE /api/assets/{asset_id}` to clean up
- Returns `{ ok: true, variant: "w{width}.webp" }` on success

**`src/routes/api/assets/[asset_id]/+server.js`** — `DELETE` remove an asset and its variants.

- `DELETE`: remove the original file and the variant directory (`ASSET_PATH/{stem}/`). Used by the client to clean up after a failed variant upload. Returns `{ ok: true }`.

### Asset serving

**`src/routes/assets/[...path]/+server.js`** — serves asset files from `ASSET_PATH`.

- Matches two patterns:
  - `GET /assets/{asset_id}` — serve the original (e.g. `/assets/c4b519da...fabdb.webp`)
  - `GET /assets/{stem}/w{width}.webp` — serve a width variant (e.g. `/assets/c4b519da...fabdb/w320.webp`)
- Reads the file from `ASSET_PATH` and streams it as the response
- Sets `Cache-Control: public, max-age=31536000, immutable` (content-addressed = cacheable forever)
- Sets `Content-Type` based on file extension (`.webp` → `image/webp`, `.gif` → `image/gif`, `.svg` → `image/svg+xml`)
- Sets `Content-Disposition: inline; filename="{first_8_hex}.{ext}"` using the first 8 hex characters of the hash
- Returns `404` if the file doesn't exist
- No database lookups — purely filesystem-based serving

### Server-side storage helpers

**`src/lib/server/asset-storage.js`** — filesystem operations for assets, adapted from image-resize's `storage.js` but using the ARCHITECTURE's flat file layout:

```
ASSET_PATH/
├── {hash}.webp              # original (static image)
├── {hash}/                   # variant directory (same name as original without extension)
│   ├── w320.webp
│   ├── w640.webp
│   └── ...
├── {hash}.gif                # animated GIF (no variants)
├── {hash}.svg                # SVG (no variants)
```

Functions:
- `asset_path(asset_id)` — full path for an original: `join(ASSET_PATH, asset_id)`
- `variant_dir(asset_id)` — directory for variants: strip extension from asset_id, `join(ASSET_PATH, stem)`
- `variant_path(asset_id, width)` — full path for a variant: `join(variant_dir(asset_id), 'w' + width + '.webp')`
- `write_asset(asset_id, data)` — stream data to `asset_path(asset_id)`, returns bytes written
- `write_variant(asset_id, width, data)` — create variant dir, stream data to `variant_path(asset_id, width)`
- `asset_exists(asset_id)` — check if original exists on disk
- `delete_asset(asset_id)` — remove original file + variant directory
- `create_asset_read_stream(asset_id)` — returns a Node.js ReadStream for the original
- `create_variant_read_stream(asset_id, width)` — returns a ReadStream for a variant
- `asset_size(asset_id)` — returns file size in bytes

Ensure `ASSET_PATH` directory exists (create on module load, same pattern as `db.js` creating `DATA_DIR`).

### Paste/drop handling

Svedit already has a `handle_image_paste` callback in `create_session.js` that fires when the user pastes or drops image files. Currently it creates image nodes with `src` set to a `data_url`. We extend this to:

1. Create image nodes with `src` set to a `blob:` URL (via `URL.createObjectURL`) of the **source file** instead of the data URL. The image displays instantly.
2. Start background processing for the pasted file (runs concurrently, does not block the editor):
   a. Compute the SHA-256 hash of the source file.
   b. Determine the asset type:
      - **SVG** (`image/svg+xml`): passthrough — no WASM processing. Extract dimensions via `<img>` element. The blob is the original file. Extension: `.svg`.
      - **Animated GIF** (`image/gif` with multiple frames): passthrough — no WASM processing. Extract dimensions via `<img>` element. The blob is the original file. Extension: `.gif`.
      - **Static raster image** (JPEG, PNG, WebP, HEIC, HEIF, still GIF): process via WASM worker — decode, resize if > `MAX_IMAGE_WIDTH`, encode as WebP, generate all applicable width variants. Extension: `.webp`.
   c. Store the processing result (hash, original blob, variants, dimensions) keyed by the blob URL in a `Map`. This map is consulted during the save flow.
3. The user can continue editing. Processing happens in the background.

The processing/upload map and its logic should live in a dedicated module (e.g. `src/lib/client/asset-upload.js`), not inline in `create_session.js` or `+page.svelte`.

For animated GIF detection, scan the binary for multiple Graphic Control Extension blocks (`0x21 0xF9`), same approach as image-resize.

### Save flow changes

Extend the existing `SaveCommand` in `+page.svelte` to handle asset uploads before saving the document:

1. **Collect pending assets.** Walk the document nodes, find all image nodes whose `src` starts with `blob:`. These are unsaved assets.

2. **Wait for processing.** If any of these assets are still being processed in the background, wait for them to finish. Show a status indication (e.g. in the save button or via a simple message).

3. **Upload assets sequentially.** For each pending asset:
   a. Construct the asset id: `{sha256_hash}.{ext}`
   b. Upload the original: `POST /api/assets` with the processed blob, `X-Content-Hash`, `Content-Type`, `X-Asset-Width`, `X-Asset-Height`. If the server returns `deduplicated: true`, skip variant uploads.
   c. Upload variants sequentially: `POST /api/assets/{asset_id}/variants` with each variant blob + `X-Variant-Width`. If any variant upload fails, `DELETE /api/assets/{asset_id}` to clean up, then abort the save with an error.
   d. Record the mapping: `blob_url → { asset_id, width, height }`

4. **Replace blob URLs.** Walk all image nodes. For every `src` that is a blob URL, replace it with the asset id. Update `width` and `height` to the processed dimensions (which may differ from the source if the image was resized down to `MAX_IMAGE_WIDTH`).

5. **Save the document.** Call `save_document()` as before. The document now contains only asset ids, no blob URLs.

6. **Error handling.** If any asset upload fails entirely (and cleanup succeeds), abort the save with an alert. The user stays in edit mode with their changes intact — blob URLs are not replaced until all assets are uploaded. Successfully uploaded assets from earlier in the sequence are left on the server (they're complete and valid; deduplication will skip them on retry).

Use XHR (not `fetch`) for uploads so we get `upload.onprogress` events for progress tracking.

### `asset_refs` tracking

Update `save_document` in `api.remote.js` to track asset references as part of the save transaction:

1. Add the `asset_refs` table in a new migration step (`add_asset_refs`):
   ```sql
   CREATE TABLE asset_refs (
       asset_id TEXT NOT NULL,
       document_id TEXT NOT NULL,
       PRIMARY KEY (asset_id, document_id)
   );
   ```

2. During `save_document`, after splitting the combined document into page/nav/footer, for each sub-document:
   a. Walk its nodes, collect all `src` values from image nodes → the current set of asset ids
   b. Delete all existing `asset_refs` rows for that `document_id`
   c. Insert the new `(asset_id, document_id)` pairs

3. This happens inside the existing transaction, so it's atomic with the document save.

### `Image.svelte` rendering

The Svedit image component needs to handle two `src` modes:

- If `src` starts with `blob:` — use it directly as the `<img>` src (editing session, not yet saved)
- Otherwise — prefix with `ASSET_BASE` to construct the URL, and build a `srcset` from the variant widths:

```html
<img
  src="{ASSET_BASE}/{src}"
  srcset="{applicable_variants.map(w => `${ASSET_BASE}/${stem}/w${w}.webp ${w}w`).join(', ')}, {ASSET_BASE}/{src} {width}w"
  sizes="50vw"
/>
```

Only include variants for widths strictly smaller than the image's `width`. The original always serves as the largest entry in `srcset`. SVGs and animated GIFs get no `srcset` (original only). The default `sizes` is `50vw` — individual components can override this if they know their layout constraints.

### File summary

New files:
- `src/lib/client/asset-processor.js` — Web Worker for WASM image processing
- `src/lib/client/process-asset.js` — main-thread wrapper for the worker
- `src/lib/server/asset-storage.js` — filesystem operations for assets
- `src/routes/api/assets/+server.js` — POST upload original
- `src/lib/client/asset-upload.js` — pending asset map, upload orchestration
- `src/lib/asset-config.js` — universal asset constants (VARIANT_WIDTHS, ASSET_BASE, etc.)
- `src/routes/api/assets/[asset_id]/+server.js` — DELETE cleanup
- `src/routes/api/assets/[asset_id]/variants/+server.js` — POST upload variant
- `src/routes/assets/[...path]/+server.js` — GET serve assets from disk

Modified files:
- `vite.config.js` — add `optimizeDeps.exclude` and `worker.format`
- `package.json` — add `@jsquash/webp` and `@jsquash/resize` dependencies
- `src/lib/server/migrations.js` — add `add_asset_refs` migration step
- `src/lib/api.remote.js` — update `save_document` to track `asset_refs`
- `src/routes/create_session.js` — update `handle_image_paste` to use blob URLs and trigger background processing
- `src/routes/+page.svelte` — extend save flow with asset upload (delegates to `asset-upload.js`)
- `src/routes/components/Image.svelte` — handle `blob:` vs asset id `src`, build `srcset`

No video, audio, or authentication in this step.

## Step 3: Fly.io deployment

**Goal:** deploy the app to Fly.io as a Docker-based Node.js service with persistent storage for the SQLite database and uploaded assets. Adapted from the image-resize project's deployment infrastructure.

### SvelteKit adapter

Switch from `@sveltejs/adapter-auto` to `@sveltejs/adapter-node` so the build produces a standalone Node.js server:

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-node';
```

Install as a dependency (not devDependency — needed at build time in Docker):

```
npm install @sveltejs/adapter-node
```

Remove `@sveltejs/adapter-auto` from devDependencies.

### Dockerfile

Adapted from image-resize. Multi-stage build:

1. **Base stage** — `node:24-slim`, sets `NODE_ENV=production`, working directory `/app`.
2. **Build stage** — installs all dependencies (`npm ci --include=dev`), copies source, runs `npm run build`, then prunes dev dependencies (`npm prune --omit=dev`).
3. **Final stage** — installs runtime packages (`sqlite3`, `procps`, `curl`, `nano`, `less`, `ca-certificates`). No Litestream for now — backup strategy comes later. Copies the built app from the build stage. Creates `/data` volume mount point. Exposes port 3000.

Entry point: `node /app/scripts/start-app.js` (no shell wrapper needed — the image-resize shell script's only active responsibility is copying `.sqliterc` and launching the Node process; we simplify by running Node directly and copying `.sqliterc` in the Dockerfile).

```dockerfile
# syntax = docker/dockerfile:1

ARG NODE_VERSION=24.14.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV="production"

# Build stage
FROM base as build

COPY --link .npmrc package-lock.json package.json ./
RUN npm ci --include=dev

COPY --link . .

RUN mkdir /data && npm run build

RUN npm prune --omit=dev

# Final stage
FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y sqlite3 procps curl nano less ca-certificates && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /app /app

# Copy .sqliterc for convenient sqlite3 CLI usage
COPY --from=build /app/.sqliterc /root/.sqliterc

RUN mkdir -p /data
VOLUME /data

EXPOSE 3000

CMD ["node", "/app/scripts/start-app.js"]
```

### Graceful shutdown script

**`scripts/start-app.js`** — starts the SvelteKit Node server and handles graceful shutdown signals from the Fly platform. Identical to the image-resize version:

```js
import { server as app } from '/app/build/index.js';

function shutdownServer() {
  console.log('Server doing graceful shutdown');
  app.server.close();
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);
```

This ensures in-flight requests complete and SQLite connections close cleanly on deploy or restart.

### fly.toml

Adapted from image-resize. Key settings:

- `DATA_DIR=/data` environment variable — matches the app's `config.js` which reads `process.env.DATA_DIR || 'data'`
- Persistent volume mounted at `/data` — stores both the SQLite database and uploaded assets
- `deploy.strategy = "immediate"` — single-instance app, no rolling deploys needed
- Port 3000, force HTTPS
- Start with `auto_stop_machines = "suspend"` (scale-to-zero) since it's a low-traffic site

```toml
[build]
  dockerfile = "Dockerfile"

[env]
  DATA_DIR = "/data"

[deploy]
  strategy = "immediate"

[mounts]
  source = "data"
  destination = "/data"
  auto_extend_size_threshold = 80
  auto_extend_size_increment = "1GB"
  auto_extend_size_limit = "5GB"

[http_service]
  internal_port = 3000
  force_https = true
  auto_start_machines = true
  auto_stop_machines = "suspend"
  min_machines_running = 0
  processes = ["app"]
```

The volume auto-extends when it reaches 80% capacity, up to 5GB. This accommodates growing asset storage without manual intervention.

### .dockerignore

Prevents unnecessary files from being copied into the Docker build context:

```
/.git
/.svelte-kit
/build
/node_modules
/data
.dockerignore
.DS_Store
.env*
Dockerfile
fly.toml
vite.config.js.timestamp-*
```

### .sqliterc

Convenience config for the `sqlite3` CLI when SSH-ing into the Fly machine for debugging:

```
.headers ON
.mode box
.width 0
.nullvalue NULL
.timer ON
```

### .npmrc

Ensure the `.npmrc` file exists (it may already). The Dockerfile expects it in the `COPY` step. If it doesn't exist, create one with:

```
engine-strict=true
```

### Deployment commands

First-time setup:

```sh
fly launch --no-deploy          # creates the app on Fly
fly volumes create data --size 1  # creates a 1GB persistent volume
fly deploy                      # builds and deploys
```

Subsequent deploys:

```sh
fly deploy
```

Useful operations:

```sh
fly ssh console                 # SSH into the running machine
fly logs                        # tail logs
sqlite3 /data/db.sqlite3       # access the database (from SSH)
ls /data/assets/                # inspect uploaded assets (from SSH)
```

### File summary

New files:
- `Dockerfile` — multi-stage Docker build
- `fly.toml` — Fly.io configuration
- `.dockerignore` — Docker build context exclusions
- `.sqliterc` — SQLite CLI convenience config
- `scripts/start-app.js` — Node.js entry point with graceful shutdown

Modified files:
- `svelte.config.js` — switch to `@sveltejs/adapter-node`
- `package.json` — add `@sveltejs/adapter-node`, remove `@sveltejs/adapter-auto`

No application logic changes in this step — purely deployment infrastructure.

## Step 4a: video node type

**Goal:** users can paste or drop `.mp4` files into the editor. Videos display inline (autoplay, muted, looping) and go through the same asset pipeline as images — passthrough (no client-side processing), upload on save, serve from disk. The existing `image` property on container nodes is widened to accept `['image', 'video']` but **not renamed yet** — the property rename (`image` → `media`) is a separate step (4b) to keep this step focused.

**Reference implementation:** the `image-resize` project already has working video upload and display. Use it as a reference for:

- **`src/lib/components/Video.svelte`** — autoplay with retry strategies (handles late hydration, multiple readiness events), click-to-fullscreen with unmute, iOS Safari fullscreen exit handling (`webkitbeginfullscreen`/`webkitendfullscreen`), and automatic resume to muted inline playback after exiting fullscreen. The `cursor: zoom-in` on inline-playing videos is a nice touch to adopt.
- **`src/routes/+page.svelte`** — `getVideoDimensions(file)` using `<video>` element + `loadedmetadata` → `videoWidth`/`videoHeight`. Also `isVideo(file)` for MIME type detection (our `get_media_type`).
- **`src/lib/config.js`** — `ACCEPTED_TYPES` array including `video/mp4` and `video/webm`.
- **`src/lib/server/db.js`** and **`src/lib/server/storage.js`** — `MIME_TO_EXT` mapping for video content types.

### Schema changes

In `document_schema.js`, add a `video` node type with the same properties as `image`:

```js
video: {
    kind: 'block',
    properties: {
        src: { type: 'string' },
        width: { type: 'integer' },
        height: { type: 'integer' },
        alt: { type: 'string' },
        focal_point_x: { type: 'number', default: 0 },
        focal_point_y: { type: 'number', default: 0 },
        scale: { type: 'number', default: 1.0 },
        object_fit: { type: 'string', default: 'cover' }
    }
}
```

Widen `node_types` on existing `image` properties to also accept `'video'`:

- `gallery_item.image` → `node_types: ['image', 'video']`
- `figure.image` → `node_types: ['image', 'video']`
- `feature.image` → `node_types: ['image', 'video']`
- `link_collection_item.image` → `node_types: ['image', 'video']`
- `nav.logo` → `node_types: ['image', 'video']`
- `footer.logo` → `node_types: ['image', 'video']`

The property names stay as `image` / `logo` for now. `default_node_type` stays `'image'`.

### Component changes

**`Video.svelte`** — new component, mirrors `Image.svelte` structure:
- Receives `path` prop, reads node from session
- Resolves `src` the same way (blob URL → direct, asset id → `ASSET_BASE` prefix)
- Renders `<video autoplay muted loop playsinline contenteditable="false" disablepictureinpicture>` with:
  - `style` applying `object-fit`, `object-position`, `transform: scale(...)` identically to `Image.svelte`
  - `width` and `height` attributes from node properties
  - `aria-label` from `alt` property
- No `srcset`, no variants
- **Autoplay handling** (from `image-resize/src/lib/components/Video.svelte`): use `$effect` with multiple retry strategies — check `readyState >= 2`, listen for `canplay`/`loadeddata`, and a `setTimeout` fallback. This handles late hydration where readiness events may have already fired.
- **Click-to-fullscreen** (from `image-resize`): clicking the video enters fullscreen with controls enabled and audio unmuted. On fullscreen exit (including iOS Safari's `webkitendfullscreen`), restore muted inline autoplay. iOS sometimes re-pauses ~400ms after play succeeds, so retry with a `setTimeout(500)`. Use `cursor: zoom-in` on inline-playing videos.
- Note: in edit mode, click-to-fullscreen should be **disabled** — `MediaControls` overlay captures pointer events for zoom/pan instead. Click-to-fullscreen only applies when `editable` is false (published view).

**Container components** (`GalleryItem.svelte`, `Figure.svelte`, `Feature.svelte`, `LinkCollectionItem.svelte`) — update to:
1. Check the referenced node's `type` (still via the `image` property) to render either `<Image>` or `<Video>`

Register `Video` in `node_components` in `create_session.js`.

### Zoom/pan controls

Zooming (scroll wheel) and panning (drag to move focal point) must work with videos the same way as with images. Both media types share the same visual properties (`scale`, `focal_point_x`, `focal_point_y`, `object_fit`), so the controls are identical.

**Rename `ImageControls` → `MediaControls`:**
- `src/routes/components/ImageControls.svelte` → `src/routes/components/MediaControls.svelte`
- The internal variable `image` (used to read the node) becomes `media_node` or similar.
- The component is already generic — it reads `scale`, `focal_point_x`, `focal_point_y`, and `object_fit` from the node at `path`. No image-specific logic.

**Update `Overlays.svelte`:**
- Import `MediaControls` instead of `ImageControls`.
- Widen `is_image_selected` to `is_media_selected`: `selected_property?.type === 'image' || selected_property?.type === 'video'`.
- Rename the CSS class `image-controls-overlay` → `media-controls-overlay`.

### Svedit paste handler (upstream change)

Svedit's `onpaste` in `Svedit.svelte` currently only captures `image/*` MIME types:

```js
if (item.type.startsWith('image/')) {
```

This must be widened to also capture `video/*`:

```js
if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
```

The variable name `pasted_images` in svedit's paste logic should be renamed to `pasted_media` for clarity, along with the config callback `handle_image_paste` → `handle_media_paste`. This is a svedit-level change that must land before (or alongside) the editable-website changes.

### Paste handler

Rename `handle_image_paste` to `handle_media_paste` in `create_session.js`. The callback signature stays the same — after the svedit change above, it receives all pasted media files (images and videos).

Add MIME type detection:

```js
/** @returns {'image' | 'video'} */
function get_media_type(file) {
    if (file.type.startsWith('video/')) return 'video';
    return 'image';
}
```

This returns the Svedit node type that corresponds to the file. Currently only `'image'` and `'video'` — `'audio'` can be added later.

**When pasting over an existing media node** (property selection on an image/video node):
- If `get_media_type(file)` matches the existing node's `type`: replace `src` on the existing node (current behavior).
- If it differs (e.g. pasting a video over an image): create a new node of the correct type via transaction, delete the old node, and update the parent's `image` reference to point to the new node. (The property is still named `image` in this step.)

**When pasting into a container** (text selection / inserting new nodes):
- Use `get_media_type(file)` to decide the child node type.
- The wrapper node (`gallery_item` or `figure`) still uses `image` as the property name (renamed in step 4b).

**Video metadata extraction** — before creating the video node, extract `width` and `height` from the file:

```js
async function get_video_dimensions(blob) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        const object_url = URL.createObjectURL(blob);
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(object_url);
            resolve({ width: video.videoWidth, height: video.videoHeight });
        };
        video.onerror = () => {
            URL.revokeObjectURL(object_url);
            reject(new Error('Failed to load video metadata'));
        };
        video.src = object_url;
    });
}
```

Since metadata extraction is async, `handle_media_paste` must await it before creating the node. For images this isn't needed (dimensions come from processing later), but for videos the dimensions are final at paste time since there's no client-side processing.

### Asset pipeline changes

**`asset-upload.js`:**

1. **`start_processing`** — detect video MIME types. For videos: compute hash, set `asset_id` to `{hash}.mp4`, extract dimensions via `get_video_dimensions`, store the file blob as-is (no WASM processing, no variants), set `status: 'ready'` immediately.

2. **`collect_blob_urls`** — also collect from `type === 'video'` nodes.

3. **`replace_blob_urls`** — also replace on `type === 'video'` nodes.

4. **`upload_asset`** — map asset extension to MIME type: `.mp4` → `video/mp4`, `.webm` → `video/webm` (in addition to existing image types).

5. **`ensure_processing`** — when re-fetching a blob URL, detect video MIME type and use passthrough processing.

### Asset serving

The existing `GET /assets/:asset_id` endpoint already serves files from disk by filename — no changes needed for serving. The content type is derived from the file extension.

Video files should be served with `Accept-Ranges: bytes` support for seeking. Node's `createReadStream` with range headers handles this. Check that the existing asset serving route supports range requests; if not, add support.

### HTML exporters

Add a `video` entry to `html_exporters` if needed (for any export/copy functionality). A simple `<video>` tag with `src`, `width`, `height`, and playback attributes.

### File summary

New files:
- `src/routes/components/Video.svelte` — video rendering component

Renamed files:
- `src/routes/components/ImageControls.svelte` → `src/routes/components/MediaControls.svelte`

Modified files:
- `src/lib/document_schema.js` — add `video` node type, widen `node_types` to `['image', 'video']` on container properties
- `src/routes/create_session.js` — rename `handle_image_paste` → `handle_media_paste`, add `get_media_type`, video MIME detection, video metadata extraction, video node creation, register `Video` component
- `src/routes/components/Overlays.svelte` — import `MediaControls` instead of `ImageControls`, widen `is_image_selected` → `is_media_selected`
- `src/lib/client/asset-upload.js` — handle video files in `start_processing`, `collect_blob_urls`, `replace_blob_urls`, `upload_asset`, `ensure_processing`
- Container components (`GalleryItem.svelte`, `Figure.svelte`, `Feature.svelte`, `LinkCollectionItem.svelte`) — conditionally render `<Image>` or `<Video>` based on referenced node type

Upstream (svedit) modified files:
- `svedit/src/lib/Svedit.svelte` — widen MIME filter from `image/*` to `image/* || video/*`, rename `pasted_images` → `pasted_media`, rename config callback `handle_image_paste` → `handle_media_paste`
- `svedit/src/routes/create_demo_session.js` — rename `handle_image_paste` → `handle_media_paste` to match

## Step 4b: rename `image` property to `media` on container nodes

**Goal:** rename the `image` property to `media` on container node types to accurately reflect that it can hold either an image or a video. This is a pure rename — no new functionality, no behavior changes.

### Schema changes

In `document_schema.js`, rename the property on each container type:

- `gallery_item.image` → `gallery_item.media`
- `figure.image` → `figure.media`
- `feature.image` → `feature.media`
- `link_collection_item.image` → `link_collection_item.media`

`nav.logo` and `footer.logo` keep the name `logo` — it's already accurate.

### Seed data migration

Update the seed document data in `migrations.js` to use `media` instead of `image` for the affected node types. Existing on-disk databases need a migration step that renames the property on all affected nodes. This is a JSON-level migration: load each document, walk nodes of types `gallery_item`, `figure`, `feature`, `link_collection_item`, rename their `image` property to `media`, and save back.

### Inserter changes

Update all inserters that create child nodes to use the `media` property name:
- `feature` inserter: `image: 'feature_image_id'` → `media: 'feature_image_id'`
- `figure` inserter: `image: 'image_one'` → `media: 'image_one'`
- `gallery` inserter: `image: 'gallery_item_image_id'` → `media: 'gallery_item_image_id'`
- `gallery_item` inserter: same rename
- `link_collection` inserter: same rename
- `link_collection_item` inserter: same rename

The child nodes themselves stay as `type: 'image'` or `type: 'video'` — only the property name on the parent changes.

### Component changes

Container components (`GalleryItem.svelte`, `Figure.svelte`, `Feature.svelte`, `LinkCollectionItem.svelte`) — read from `media` property instead of `image`.

### Paste handler

Update `handle_media_paste` in `create_session.js` to use `media` as the property name when creating wrapper nodes (`gallery_item`, `figure`).

### File summary

Modified files:
- `src/lib/document_schema.js` — rename `image` → `media` on container node types
- `src/routes/create_session.js` — update inserters and paste handler to use `media` property name
- `src/lib/server/migrations.js` — add migration to rename `image` → `media` on existing documents, update seed data
- Container components (`GalleryItem.svelte`, `Figure.svelte`, `Feature.svelte`, `LinkCollectionItem.svelte`) — read `media` instead of `image`