# Editable

Editable brings live on-page editing to Svelte. Site owners edit directly in the layout as they browse their site; developers keep full control with ordinary Svelte components.

For your next website project, you might not need a Content Management System anymore. Start from a fully functional, user-editable website that supports common content types: prose, heroes, features, galleries, and listings. Adapt colors and fonts to deploy a beautiful site within minutes — or customize the entire layout and model your own content types using the [Svedit APIs](https://github.com/michael/svedit).

## Quickstart

You need **Node.js 24+** (Editable uses Node's built-in SQLite; with [nvm](https://github.com/nvm-sh/nvm), `nvm use` picks the version up from `.nvmrc`) and **git**.

```sh
git clone https://github.com/michael/editable-website.git my-site
cd my-site
npm install
cp .env.example .env
```

Set an admin password in `.env`:

```sh
ADMIN_PASSWORD='change-me'
```

And run the development server:

```sh
npm run dev
```

That's it — press `⌘E` (or `Ctrl+E`) on the site and log in with your `ADMIN_PASSWORD` to edit it live. On startup you'll see an `ExperimentalWarning` about `node:sqlite` — that's expected and harmless.

## Make it yours

### Your site is your repo

Each Editable site lives in its own checkout with its own git repository — one folder, one app, one deployment. You start from Editable as a template, own all the code from day one, and keep Editable connected as `upstream` so you can pull in improvements later (see [Upgrading](#upgrading)).

Make Editable the `upstream` remote:

```sh
git remote rename origin upstream
```

Then create a private repository of your own and make it `origin` — your content is backed up by the [data scripts](#backup-sync--recovery), this backs up your code:

```sh
gh repo create my-site --private --source=. --push
```

(Without the [GitHub CLI](https://cli.github.com): create an empty private repository on GitHub, then `git remote add origin <url>` and `git push -u origin main`.)

From here on, `git push` saves your work to your own repo, and `git pull upstream stable` fetches Editable updates. The `stable` branch always points at the latest release — development happens on `main`, which you can ignore.

### Styling

Adjust the colors and fonts to match your style. Put your overrides in `src/custom.css` — that file is yours, upstream Editable updates never touch it, which keeps future upgrades conflict-free. It loads after `src/app.css`, so anything defined there can be overridden. For example:

```css
/* src/custom.css */

:root {
	/* Colors (these are the defaults from app.css; a dark theme
	   example is commented out there too) */
	--background: oklch(1 0 0);
	--foreground: oklch(0 0 0);
	--muted: oklch(0.98 0 0);
	--border: oklch(0.92 0 0);
	--muted-foreground: oklch(0.55 0 0);
	--accent: oklch(0 0 0);
	--accent-foreground: oklch(1 0 0);

	/* Typefaces — add your own with @font-face rules right here */
	--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
	--font-serif: 'Libertinos Serif Display', ui-serif, Georgia, serif;
}

/* Type scale — copy any of app.css's classes (display-1 … display-5,
   body-sm … body-xl) and adjust. @apply works here via the @reference
   line that custom.css ships with. */
.display-1 {
	@apply font-serif text-6xl leading-tight tracking-tight text-balance lg:text-7xl;
}
```

However, likely you'll want to customize more than that. E.g. edit `src/routes/components/Button.svelte` to create your very own distinct button style. Anything in `src/routes` is meant to be customized by you for your project. And if you're redesigning heavily anyway, feel free to edit `app.css` itself — it just means upstream updates to it may need a manual merge, same as your changes in `src/routes`. `custom.css` is the conflict-free lane for light-touch styling, not a fence.

### Demo content

To reset your local database to the initial demo content (asks for confirmation and backs up your current database first; assets stay in place, and the fresh content appears on the next dev server start):

```sh
npm run data:reset
```

## Deploy

Editable runs on any VPS — all you need is Node.js, and the included `Dockerfile` works with any platform that supports Docker. The repository ships ready-made for [Fly.io](https://fly.io): install [flyctl](https://fly.io/docs/flyctl/install/), then sign in (opens your browser; creates a free account if you don't have one):

```sh
fly auth login
```

Create the app. Pick a globally-unique name:

```sh
fly apps create my-site
```

Now pin that name in `fly.toml` — uncomment the `app` line and set it:

```toml
app = "my-site"
```

This is your checkout's deployment identity: every `fly` command and data script from here on reads its target from it, so nothing needs an app name on the command line anymore. `fly.toml` also holds the region and VM sizing — adjust `primary_region` to a [region near you](https://fly.io/docs/reference/regions/) and commit:

```sh
git commit -am "Deploy target: my-site" && git push
```

Set the secrets. `ORIGIN` must be your app's public URL, so canonical links and social preview images resolve correctly. Pick a strong `ADMIN_PASSWORD` — it's the login to your live site:

```sh
fly secrets set \
  ORIGIN="https://my-site.fly.dev" \
  BODY_SIZE_LIMIT='30000000' \
  ADMIN_PASSWORD='pick-a-strong-password'
```

Optionally set `ASSET_GRACE_PERIOD_DAYS` (default 7): unreferenced asset files are kept on disk this many days after losing their last reference. This is also the safe window for rolling back a database backup against the live assets folder without ending up with dead image references.

Deploy. The first deploy also creates the 1 GB `data` volume declared under `[mounts]` in `fly.toml`:

```sh
fly deploy
```

Watch it boot, and confirm the volume was created:

```sh
fly logs
fly volumes list
```

Then open your site and log in with the `ADMIN_PASSWORD` you set:

```sh
fly open
```

Because each checkout manages exactly one app (see [Your site is your repo](#your-site-is-your-repo)), the target always comes from `fly.toml` — there's no app name to get wrong. If you ever do need to address a different app (say, a staging copy), every `fly` command and data script accepts `-a <app>` as an explicit override.

## Backup, sync & recovery

All content lives in a single `data/` directory — an SQLite database (`db.sqlite3`) and uploaded assets (`assets/`). Locally this defaults to `./data`; on Fly.io it's a persistent volume at `/data`. The data commands move that folder between your machine, your deployment, and — optionally — a backup bucket. The complete toolbox:

- **npm run data:pull** — Copy the live site's data to your machine
- **npm run data:push** — Replace the live site's data with your local state — guarded, undoable
- **npm run data:backup** — Snapshot the live database, kept on the server and mirrored locally
- **npm run data:backups** — List the live site's snapshots
- **npm run data:restore** — Roll the live database back to a snapshot — pass a name from data:backups
- **npm run data:cloud-snapshots** — List points in time you can restore to — requires automated backups
- **npm run data:restore-cloud** — Roll the live site back to a point in time — requires automated backups
- **npm run data:pull-cloud** — Rebuild your local data folder from the bucket — requires automated backups
- **npm run data:verify** — Health-check the deployed database and assets
- **npm run data:reset** — Reset your local database to fresh demo content, keeping assets
- **npm run litestream:install** — One-time local setup for data:pull-cloud — requires automated backups

The cloud commands require [Automated backups](#automated-backups-optional). Every command reads the target app from `fly.toml`; append `-- -a <app>` to override. Every restore prints a summary of the restored state (documents, last edited, assets) so you can confirm you got the moment you meant, and backs up the state it replaces first. `npm run data:help` prints this reference, with arguments, in the terminal.

Pull the live site down to work on it locally, or push a local state up to production. Both directions sync the database and any missing assets.

### Why not just copy the folder?

The database runs in SQLite [WAL mode](https://www.sqlite.org/wal.html): recent writes live in a `db.sqlite3-wal` sidecar, not the main file. Copying the files of a running database loses or corrupts data. `data.sh` instead takes a consistent `VACUUM INTO` snapshot, which is safe even while the site is being edited. **Do not** back up by copying `data/` of a running instance.

Assets are content-addressed and immutable, so they only ever need to be added, never overwritten — syncs transfer just the files the other side is missing.

### Safety and undo

`push` is guarded so a bad push can't quietly break production:

- The local database is validated (integrity check plus every referenced asset present) before anything is sent.
- The current remote database is backed up first — on the volume **and** mirrored to `data-backups/` locally — before the new one is applied.
- The new database is swapped in at boot, when no connection is open, so the live database can never be corrupted mid-write.
- After the swap, the remote database is re-validated; if it fails, you're told the exact restore command.

Every push prints an undo command. To roll back:

```
npm run data:backups          # list the live site's snapshots
npm run data:restore <name>   # roll the live site back to one (name from the listing; file extension optional)
```

Snapshots are taken automatically before every push and restore, and on demand with `npm run data:backup` — each lives on the server (last 10 kept) and is mirrored to `data-backups/` on your machine (kept forever, prune by hand). `restore` finds it in either place.

A rollback restores only the database; it re-points at the same immutable asset pool, which is why `ASSET_GRACE_PERIOD_DAYS` (see [Deploy](#deploy)) defines how far back you can safely go — restores from the backup bucket don't have this limit.

**Note:** don't edit the site while a push is in progress — the safeguard assumes the remote state is stable for the moment it takes to snapshot and swap.

## Automated backups (optional)

The manual snapshots above are deliberate actions you take. Optionally, Editable can also back itself up continuously to an S3-compatible bucket: the database is replicated on every write via [Litestream](https://litestream.io) (with point-in-time recovery), and uploaded assets are mirrored to the bucket as they arrive, with a reconciliation sweep at every boot catching anything missed. Everything is write-driven — there are no cron jobs, and suspend mode (`auto_stop_machines = "suspend"`) is fully supported: a suspended machine isn't writing anything, so there's nothing to miss. (One honest edge: replication ships changes on a ~1s interval, so a suspend arriving immediately after a write can hold the last segment in memory until the next wake — data is at risk only if the volume is destroyed before the machine ever wakes again, a seconds-wide window.)

### Enabling

Create a bucket and set the secrets. On Fly, [Tigris](https://fly.io/docs/tigris/) does both in one command:

```sh
fly storage create
```

Then `fly deploy`. That's it — the presence of the `BUCKET_NAME` secret enables automated backups; without it, nothing changes. Inspect the bucket's raw contents any time with `fly storage dashboard` (`db/` holds the Litestream replica, `assets/` the asset mirror, `snapshots/` the daily full-database snapshots). Any S3-compatible provider (Cloudflare R2, AWS S3, MinIO) works by setting the same secrets manually:

```sh
fly secrets set \
  BUCKET_NAME='my-site-backup' \
  AWS_ENDPOINT_URL_S3='https://...' \
  AWS_REGION='auto' \
  AWS_ACCESS_KEY_ID='...' \
  AWS_SECRET_ACCESS_KEY='...'
```

Use one bucket per site. The bucket is append-only: local asset cleanup is never mirrored to it, so unlike volume-local rollbacks, restores from the bucket are not bounded by `ASSET_GRACE_PERIOD_DAYS` — every asset ever uploaded is still there. Replication runs as a supervised sidecar: if it ever fails, your site stays up and the logs say so loudly.

As an extra safety net independent of Litestream, a plain full-database `.sqlite3` snapshot is also uploaded to the bucket's `snapshots/` folder at most once per day (triggered by edits and boots) — restorable with no tooling at all.

All automatic uploads run only in the deployed app: local development never writes to the bucket, even with credentials in your `.env` (those exist for the read-only [local restores](#local-restores)).

### What you get

**Disaster recovery, automatically.** On boot, a machine with an empty volume restores the database from the bucket, then downloads the assets it references. If your volume (or app, or region) is ever lost: `fly deploy` against a fresh volume brings your site back.

**Point-in-time restore to production.** Roll the live database back to any moment, shipped through the same guarded swap as a push (pre-restore backup, integrity validation, verification). List the available restore points, then pick one:

```sh
npm run data:cloud-snapshots                              # what moments can I restore to?
npm run data:restore-cloud                                # latest bucket state
npm run data:restore-cloud -- --at "2026-07-10T15:00:00Z" # a specific moment
```

`--at` takes the UTC timestamps exactly as `data:cloud-snapshots` shows them.

**Local restores.** Rebuild your local `data/` from the bucket, e.g. to investigate a past state without touching production. See [Local restores](#local-restores) below.

Restores always download only the assets the restored database references — the bucket holds full history, but a restore transfers just the site's working set as of that moment.

Continuous backups complement the manual snapshots rather than replacing them: `data:push`/`data:pull`/`data:backup`/`data:restore` remain the tools for deliberate, operational state moves.

### Local restores

Rebuild your local `data/` folder from nothing but the bucket — a new laptop, or forensic work: say the site was vandalized and you need to find the last good state. Try timestamps locally until you find it, then restore production to that exact moment. Iterating is cheap: each round downloads a small database plus only the missing assets, and your previous local database is backed up to `data-backups/` first. Nothing here ever writes to the bucket or touches production.

One-time setup — install Litestream into the project (pinned to the same version the server runs, so local restores always read the exact format the server writes) and put the bucket credentials into your `.env` (see `.env.example`; read them from the machine with `fly ssh console -C env`). Local restores only ever read, so consider using read-only credentials here — most providers let you create a second, read-only access key for the bucket; how (and whether) is up to you:

```sh
npm run litestream:install
```

Then:

```sh
npm run data:cloud-snapshots                           # list restore points
npm run data:pull-cloud                                # latest bucket state
npm run data:pull-cloud -- --at "2026-07-10T15:00:00Z" # a specific moment
npm run dev                                            # inspect the restored state
```

When you've found the state you want live, restore production to it with `npm run data:restore-cloud -- --at <timestamp>`.

## Upgrading

Editable improves over time, and because your site keeps it as the `upstream` remote (see [Your site is your repo](#your-site-is-your-repo)), upgrading is a git pull. The ritual, in order:

```sh
npm run data:backup       # snapshot the live database first
git pull upstream stable  # get the latest Editable release
npm install               # update dependencies (including svedit)
npm run data:pull         # bring your live content local
npm run dev               # test the new code against your real content
fly deploy                # ship it
git push                  # your repo now holds the upgraded state
```

The order is the safety net: back up before touching anything, and test the new code against your real content locally before deploying it. Database schema migrations run automatically when the new code boots, locally and on the server.

Releases are also tagged: to upgrade to a specific version instead of the latest, use `git fetch upstream` followed by `git merge v2.1.0`.

Merge conflicts can only occur in files you changed. If your customizations live in the files meant for you — `src/custom.css`, the `app` line in `fly.toml`, and your own code in `src/routes` — pulls are typically conflict-free, since upstream never touches `custom.css` and rarely touches the rest. The more you've rewritten, the more the pull becomes a starting point for a manual merge — at that point, review what changed upstream and adopt what applies.

## Markdown pages

A deployment can expose selected repository markdown files as read-only pages rendered through the regular page components. Markdown stays the source of truth — nothing is written to the database, and the pages cannot be edited through any UI path (not even as admin). This very README is served as `/manual` on the Editable website.

### Configuration

Any markdown file in the repository can be mapped to a URL in `src/lib/content_config.js` (server/build-only — never import it from client code). Reference the file with a `?raw` import, so Vite inlines exactly the mapped files and a missing file fails the build:

```js
import manual_md from '../../README.md?raw';

export const MARKDOWN_SOURCES = [
	{ markdown: manual_md, source: 'README.md', pathname: '/manual', toc: true }
];
```

- `markdown` — the imported file content
- `source` — the file's repo-relative path, so error messages point at the file to fix
- `pathname` — absolute single-segment URL the page is served at (nested paths are not supported yet)
- `toc` (optional) — generate a table of contents from the file's headings

With `MARKDOWN_SOURCES = []` the feature is inert. A configured pathname wins over a database page with the same slug. Configuration errors — unknown fields, duplicate pathnames, missing content — fail the dev server or production build immediately.

### Table of contents

With `toc: true`, the headings one level below the file's first heading become a linked list, inserted before the first of them. A typical manual has one `#` title followed by `##` chapters: the title and intro prose render first, then the table of contents, then the chapters. Files with fewer than two chapter headings get no table of contents.

Headings get stable ids using GitHub's anchor algorithm, so the same `#fragment` links work in the repo view and on the website (`## Getting started` → `#getting-started`, and duplicates get `-1`/`-2` suffixes). One divergence: anchors starting with a digit get an `h-` prefix on the website.

### Sections

Every `##` heading starts a new visual section: the heading and everything up to the next `##` (paragraphs, lists, code blocks) are grouped under one section mark on the page body, which renders them tightly together with more space between sections — the same section mechanism editable pages use. Content before the first `##` (typically the `#` title and intro) and the generated table of contents stay outside any section.

### Descriptive listings

An unordered list where every item follows the pattern below is rendered as a `descriptive_listing` (title, description, and optional meta rows) instead of a plain list — the command reference in [Backup, sync & recovery](#backup-sync--recovery) is one:

```
- **title** — description
- **title** — description — meta
```

Bold leading title, `—` separators (em dash), plain text otherwise. If any item deviates, the whole list renders as a plain list.

### Supported markdown

The converter accepts the subset of CommonMark that maps onto the built-in content model, and rejects everything else with an error naming the file, line, and column — authored text is never silently dropped or restructured:

- paragraphs, headings 1–5 (heading 6 is rejected)
- `**strong**`, `*emphasis*`, `` `inline code` ``, and `[links](/page)` — but not nested inside one another (marks are mutually exclusive in the content model, so e.g. bold text inside a link is rejected)
- unordered lists (rendered with dash markers) and ordered lists (rendered numbered); nested lists and multi-paragraph items are rejected
- fenced and indented code blocks (no syntax highlighting)
- HTML comments (skipped — they render as nothing, same as everywhere else)
- link targets: `http(s):`, `mailto:`, site-absolute paths, and `#fragments`; other protocols and links to `.md` files are rejected

Not supported (rejected with an error): images, tables, blockquotes, raw HTML, thematic breaks, footnotes, YAML frontmatter, and GFM extensions. Page metadata (title, description) is derived from the first heading and paragraph, as for regular pages. Soft line wraps render as spaces and hard breaks render as line breaks (trailing backslash or two trailing spaces), matching how CommonMark renderers like GitHub's display the same file.

## Components

### MediaProperty

Renders an editable image or video slot. The media fills whatever container you give it — you control the dimensions from the outside.

```ts
interface MediaPropertyProps {
	/** Path to the media node */
	path: any[];
	/** Class on the outer element */
	class?: string;
}
```

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

### SizableViewbox

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

## Content model

Editable ships with the Common Content Model (CCM) — a portable content schema that covers the common structures most websites need while staying small enough to understand and edit directly. It's defined in `src/lib/document_schema.js`; this section is the reference.

Documents are graphs of nodes stored by id. Each node has an `id`, a `type`, and type-specific properties. A few naming conventions hold throughout: `content` is the string payload of text properties, `body` holds authored nested content, `items` holds repeated structured children, and `label`/`title`/`description`/`meta` are text properties with semantic meaning.

A **text property** value looks like this in a document (marks reference separate mark nodes by id):

```js
{
	content: 'Editable text',
	marks: [],
	annotations: []
}
```

A **node array** value holds ordered child node ids; `marks` can wrap ranges of children (the page body uses this for `section` grouping):

```js
{
	nodes: ['node_id_1', 'node_id_2'],
	marks: [],
	annotations: []
}
```

### Node reference

Notation: `text` is an editable text value (allowed marks in the comment), `[a | b]` is a node array of those types, a bare type name is a single node reference, and `1–4` are the app-defined layout variants. `href` is a string where empty means unlinked; `target` defaults to `'_self'`.

**Page and site chrome** — the document root plus the shared navigation and footer:

```ts
page {
	title: text          // single line, no marks; used for page metadata
	description: text    // no marks
	image: image         // preview image for page metadata
	body: [prose | prose_grid | figure | captioned_figure | gallery | feature |
	       descriptive_gallery | descriptive_listing | accordion | preformatted]
	                     // supports section marks for visual grouping
	nav: nav
	footer: footer
}

nav {
	start_items: [nav_image | nav_link | nav_button]    // usually logo first
	center_items: [nav_link | nav_button | nav_image]   // usually page links
	end_items: [nav_link | nav_button | nav_image]      // usually calls to action
}

nav_link { href, target, label: text }
nav_button { layout: 1 | 2, href, target, label: text }   // type-switches with nav_link
nav_image { href, target, media: image | video }

footer {
	body: [rich content]   // see below
	footer_link_columns: [footer_link_column]
}
footer_link_column { items: [footer_link_category | footer_link] }
footer_link_category { title: text }
footer_link { href, target, label: text }
```

**Text blocks** — most bodies accept the same "rich content" family:

```ts
// rich content = paragraph_sm | paragraph | paragraph_lg | paragraph_xl |
//                heading_1 … heading_5 | list | supporting_media | button_group

prose { layout: 1–6, body: [rich content] }        // layouts: alignment and width
prose_grid { layout: 1 | 2, items: [prose_grid_item] }
prose_grid_item { body: [rich content] }

// the paragraph and heading family share one shape:
paragraph, paragraph_sm, paragraph_lg, paragraph_xl,
heading_1 … heading_5 {
	layout: 1 | 2      // 2 = muted secondary copy
	content: text      // marks: strong, emphasis, code, highlight, link
}

list { layout: 1–4, list_items: [list_item] }      // layouts: marker styles
list_item { content: text }                        // marks: strong, emphasis, code, highlight, link

preformatted { content: text }                     // monospaced, preserves whitespace, no marks
```

**Media** — `image` and `video` share one shape and are interchangeable wherever media is allowed:

```ts
image, video {
	src: string              // asset id (blob URL before save)
	mime_type: string
	width: integer           // intrinsic pixels
	height: integer
	alt: string
	focal_point_x: number    // 0.5 = centered
	focal_point_y: number
	scale: number            // display scale inside the frame, 1 = fit
	object_fit: string       // CSS object-fit, default 'contain'
}

figure { layout: 1–6, media: image | video }
captioned_figure { media: image | video, caption: text }   // caption marks: strong, emphasis, code, highlight, link
supporting_media {
	media_max_width: integer      // 0 = no maximum
	media_aspect_ratio: number    // 0 = natural ratio
	media: image | video
}
```

**Collections and buttons**:

```ts
gallery { layout: 1–5, gallery_items: [gallery_item] }
gallery_item { href, target, media: image | video }

descriptive_gallery { layout: 1 | 2, items: [descriptive_gallery_item] }
descriptive_gallery_item {
	href, target
	media: image | video
	title: text          // single line; marks: emphasis, highlight
	description: text    // marks: emphasis, highlight
}

descriptive_listing { layout: 1–5, items: [descriptive_listing_item] }
descriptive_listing_item {
	href, target
	title: text          // single line; marks: emphasis, highlight
	description: text    // marks: emphasis, highlight
	meta: text           // single line, optional; marks: emphasis, highlight
}

accordion { layout: 1–5, items: [accordion_item] }
accordion_item {
	title: text          // single line; marks: emphasis, highlight
	body: [rich content without headings]
}

feature { layout: 1 | 2, media: image | video, body: [rich content] }

button_group { buttons: [button] }
button { layout: 1 | 2, href, target, label: text }
```

**Marks** — applied to text ranges, stored as separate nodes referenced by `{ start_offset, end_offset, node_id }` ranges. Ranges must not overlap:

```ts
strong, emphasis, code, highlight   // no properties
link { href, target }               // internal links use root-relative page URLs
section                             // groups a range of page body blocks
```

<!--

## FAQs

### How is this different to using a CMS?

The editing infrastructure (Svedit) becomes an integral part of your website (at runtime). As a developer, all you do is define content types (e.g. Figure) and implement components (e.g. Figure.svelte) — they are editable by default.

### Is mobile editing supported?

There is experimental support for mobile editing — it works in principle. The current focus is on desktop UX, but mobile editing will improve over time.

### How about AI?

Editable is a foundational, AI-agnostic tool. That said, it makes perfect sense to utilize AI workflows to help building your custom site. Think prompts like "Create a hero block type with title + description and optional CTA buttons" and "Implement Hero.svelte with 5 distinct layout variations".

### Plugins?

Editable is modular and you can and should reuse code across projects. However, I purposely don't want to establish a community maintained plugin repository. I want to encourage you to own all your code, for the benefit of simplicity, safety, and control. Share code snippets, not plugins.

### Static builds?

There's no point for static builds with Editable. The whole idea is that users edit content live, without having to wait for a rebuild to finish. SQLite is fast. Very fast. Web-optimized images are generated client-side before upload: resizing happens in the browser via canvas and toBlob(), and WebP encoding is done with @jsquash/webp. It still makes sense to enable a proxy for images, so they can be delivered from a CDN.

### License?

Editable will at least be source-available. There will likely be an affordable one-time registration fee (per domain) for personal use, and a fair fee for commercial projects. I'm still working on the details. If you're open to discussion, join the technical preview: https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform

-->
