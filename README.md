# The Editable Manual

Editable lets people edit a Svelte website directly on the page, while developers retain control over its structure and presentation. It starts with editable prose, media, features, galleries, and listings — much of what you would otherwise use a separate CMS for — while keeping the styling, layouts, and content model in your code. This manual explains how to build and run a site with it.

## Quickstart

From zero to a live-editable site in four commands.

Install [Node.js 24+](https://nodejs.org/) and [Git](https://git-scm.com/). Editable uses Node's built-in SQLite. If you use [nvm](https://github.com/nvm-sh/nvm), `nvm use` reads the included `.nvmrc`.

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

That's it — press `⌘` + `E` (or `Ctrl` + `E`) on the site and log in with your `ADMIN_PASSWORD` to edit it live. On startup you'll see an `ExperimentalWarning` about `node:sqlite` — that's expected and harmless.

## Make it yours

Your repository, your styles, your components.

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

Deploy your local site to a public URL in a few steps.

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

Your whole site lives in one folder — pull it, push it, snapshot it, roll it back.

That folder is `data/`: an SQLite database (`db.sqlite3`) and uploaded assets (`assets/`). Locally it defaults to `./data`; on Fly.io it's a persistent volume at `/data`. The data commands move that folder between your machine, your deployment, and — optionally — a backup bucket. The complete toolbox:

- **npm run data:pull** — Copy the live site's data to your machine
- **npm run data:push [-- --yes]** — Replace the live site's data with your local state — guarded, undoable
- **npm run data:backup** — Snapshot the live database, kept on the server and mirrored locally
- **npm run data:backups** — List the live site's snapshots
- **npm run data:restore &lt;name> [-- --yes]** — Roll the live database back to a snapshot — pass a name from data:backups
- **npm run data:cloud-snapshots** — List points in time you can restore to — requires automated backups
- **npm run data:restore-cloud [-- --at &lt;timestamp>] [-- --yes]** — Roll the live site back to a point in time — requires automated backups
- **npm run data:pull-cloud [-- --at &lt;timestamp>]** — Rebuild your local data folder from the bucket — requires automated backups
- **npm run data:verify** — Health-check the deployed database and assets
- **npm run data:reset [-- --yes]** — Reset your local database to fresh demo content, keeping assets
- **npm run litestream:install** — One-time local setup for data:pull-cloud — requires automated backups

Arguments in brackets are optional; npm flags need the `--` separator shown above. The cloud commands require [Automated backups](#automated-backups-optional). Every command reads the target app from `fly.toml`; only append `-- -a <app>` if no app name is set there, or to override it. Every restore prints a summary of the restored state (documents, last edited, assets) so you can confirm you got the moment you meant, and backs up the state it replaces first. `npm run data:help` prints this reference, with arguments, in the terminal.

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

Make the site back itself up on every write, restorable to any moment.

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

New Editable releases are one `git pull` away.

Because your site keeps Editable as the `upstream` remote (see [Your site is your repo](#your-site-is-your-repo)), improvements flow in with ordinary git. The ritual, in order:

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

Ship docs and long-form pages straight from markdown files in your repo.

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

With `toc: true`, the headings one level below the file's first heading become a linked two-column listing, inserted before the first of them. A typical manual has one `#` title followed by `##` chapters: the title and intro prose render first, then the table of contents, then the chapters. Each row links to its chapter and shows the first sentence of the chapter's first paragraph as a description. Files with fewer than two chapter headings get no table of contents.

Headings get stable ids using GitHub's anchor algorithm, so the same `#fragment` links work in the repo view and on the website (`## Getting started` → `#getting-started`, and duplicates get `-1`/`-2` suffixes). One divergence: anchors starting with a digit get an `h-` prefix on the website.

### Sections

Every `##` heading starts a new visual section: the heading and everything up to the next `##` (paragraphs, lists, code blocks) are grouped under one section mark on the page body, which renders them tightly together with more space between sections — the same section mechanism editable pages use. Content before the first `##` (typically the `#` title and intro) forms a leading section together with the generated table of contents.

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
- unordered lists (rendered with square markers) and ordered lists (rendered numbered); nested lists and multi-paragraph items are rejected
- fenced and indented code blocks (no syntax highlighting)
- HTML comments (skipped — they render as nothing, same as everywhere else)
- link targets: `http(s):`, `mailto:`, site-absolute paths, and `#fragments`; other protocols and links to `.md` files are rejected

Not supported (rejected with an error): images, tables, blockquotes, raw HTML, thematic breaks, footnotes, YAML frontmatter, and GFM extensions. Page metadata (title, description) is derived from the first heading and paragraph, as for regular pages. Soft line wraps render as spaces and hard breaks render as line breaks (trailing backslash or two trailing spaces), matching how CommonMark renderers like GitHub's display the same file.

## Create a custom content type

Define a node schema and wire it up with a custom component.

Editable's built-in types are just a starting set. This walkthrough adds a `hero` type — a title, a description, and an image, with two layouts — and it touches exactly three files: the schema, one new component, and the session registration.

### 1. Define the type in the schema

In `src/lib/document_schema.js`, add the node type definition. A hero is a `block` with a `layout` variant, two text properties, and a media reference:

```js
hero: {
	kind: 'block',
	properties: {
		layout: { type: 'integer', default: 1 },
		title: {
			type: 'text',
			mark_types: MINIMAL_MARKS,
			allow_newlines: false
		},
		description: {
			type: 'text',
			mark_types: MINIMAL_MARKS,
			allow_newlines: true
		},
		media: {
			type: 'node',
			node_types: ['image', 'video'],
			default_node_type: 'image'
		}
	}
},
```

`MINIMAL_MARKS` (emphasis and highlight) keeps the hero copy clean — swap in `ALL_MARKS` if you want links and inline code in there too. Then allow the hero on pages by adding `'hero'` to the `body` node types of the `page` definition in the same file:

```js
body: {
	type: 'node_array',
	node_types: [
		'hero',
		'prose',
		// …the existing types
	],
	mark_types: ['section'],
	default_node_type: 'prose'
},
```

That's the whole data model. Documents containing heroes now validate, and every property is editable and undoable by default — you haven't written any editing code.

### 2. Write the component

Create `src/routes/components/Hero.svelte`. It reads the node at `path`, renders each property through an editable primitive (`TextProperty` for text, `MediaProperty` for the image), and picks a snippet per layout:

```svelte
<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout === 2 ? 2 : 1);
</script>

{#snippet text()}
	<TextProperty tag="h1" class="display-1" path={[...path, 'title']} placeholder="Hero title" />
	<TextProperty
		class="pt-4 body-xl text-(--muted-foreground)"
		path={[...path, 'description']}
		placeholder="Say what this page is about"
	/>
{/snippet}

{#snippet media()}
	<div
		class="overflow-hidden"
		style:aspect-ratio="16 / 9"
		style:border-radius="var(--image-border-radius)"
	>
		<MediaProperty path={[...path, 'media']} />
	</div>
{/snippet}

<Node class="ew-hero bg-(--background) text-(--foreground)" {path}>
	<div class={TW_LIMITER}>
		{#if layout === 1}
			<!-- Layout 1: text and media side by side -->
			<div class="{TW_PAGE_PADDING_X} grid items-center gap-10 py-16 md:grid-cols-2">
				<div>{@render text()}</div>
				{@render media()}
			</div>
		{:else}
			<!-- Layout 2: centered text above the media -->
			<div class="{TW_PAGE_PADDING_X} flex flex-col gap-10 py-16 text-center">
				<div class="mx-auto max-w-2xl">{@render text()}</div>
				{@render media()}
			</div>
		{/if}
	</div>
</Node>
```

There is no read-only twin to keep in sync: this one component is the live page **and** the editor. For fancier variants, `src/routes/components/Feature.svelte` shows the same pattern with a rich `body` node array, reveal animations, and section-aware padding.

### 3. Register it in the session

In `src/routes/create_session.js`, three small registrations wire the type into the editor. Import the component and add it to `node_components`, so Svedit knows what to render:

```js
import Hero from './components/Hero.svelte';

// in session_config.node_components:
hero: Hero,
```

Declare how many layouts it has in `node_layouts`, which powers layout switching (toolbar and `Ctrl` + `Shift` + `←` / `→`):

```js
// in session_config.node_layouts:
hero: 2,
```

And add an inserter — the factory that builds a blank hero when one is inserted on a page:

```js
// in session_config.inserters:
hero: function (tr) {
	const new_hero_id = tr.build('new_hero', {
		hero_media: { id: 'hero_media', type: 'image', ...MEDIA_DEFAULTS },
		new_hero: {
			id: 'new_hero',
			type: 'hero',
			layout: 1,
			title: { content: '', marks: [], annotations: [] },
			description: { content: '', marks: [], annotations: [] },
			media: 'hero_media'
		}
	});
	tr.insert_nodes([new_hero_id]);
},
```

### 4. Try it

Run `npm run dev`, press `⌘` + `E` and log in. Select a top-level block on a page and cycle node types with `Ctrl` + `Shift` + `↑` / `↓` until it becomes a hero, or insert one fresh at a node gap. `Ctrl` + `Shift` + `←` / `→` flips between your two layouts, paste an image onto the media slot, and `⌘` + `S` saves — undo, selection, and copy/paste all work without any additional code, because they operate on the schema, not on your component.

From here it's just iteration: add calls to action, give editors control over the image size, add a third layout, or ask your AI assistant to do it — the three-file pattern above is all the context it needs. The next chapter makes those extensions while unpacking the primitives used inside the component.

## Primitives

Make Svelte components editable by composing a small set of primitives.

The schema defines what the content may contain; the primitives connect that content to the editor; your HTML and CSS decide how it looks.

The Hero above already uses three of them. We'll take it apart, then extend it with composable buttons and editor-controlled media sizing.

Editable uses [Svedit](https://github.com/michael/svedit) as its editing engine. This chapter covers the Svedit primitives used to render content, but Svedit's separate API documentation is the reference for schemas, sessions, transactions, transforms, commands, marks, and annotations. Study that API to move beyond adapting Editable's existing patterns and build new editing behavior of your own.

### Everything starts with a path

Every registered node component receives `path`. It identifies the node being rendered, wherever that node happens to live in the document. Append a property name to address something inside it:

```js
path                           // the hero node
[...path, 'title']             // its title text
[...path, 'description']       // its description text
[...path, 'media']             // its image or video node
```

Pass those paths to primitives and use the same paths to read values when layout depends on content:

```svelte
<script>
	const svedit = getContext('svedit');
	let { path } = $props();
	let hero = $derived(svedit.session.get(path));
	let media = $derived(svedit.session.get([...path, 'media']));
</script>
```

`session.get` follows node references for you, so the last expression returns the media node rather than its stored id. Components do not need to know whether they are on a page, inside another block, or nested several arrays deep.

### Node: establish the editing boundary

`Node` wraps the output of a node component. It gives the rendered element its document identity and connects selection, visibility tracking, node-array marks and annotations, and editor positioning:

```svelte
<Node tag="section" class="ew-hero bg-(--background) text-(--foreground)" {path}>
	<!-- The Hero's ordinary Svelte layout -->
</Node>
```

`path` is required. `tag` defaults to `div`; `class`, `style`, and other element attributes pass through to the rendered element. `Node` adds no visual layout of its own. If you need `position: relative` or `position: absolute`, put it on an element inside `Node`, because the node element itself stays statically positioned so editor overlays can anchor to it reliably.

Most block components have one outer `Node`. Mark components are the exception: they render inline content or wrap a range supplied by `TextProperty` or `NodeArrayProperty`.

### TextProperty: make text editable

The Hero's fixed text fields use `TextProperty`:

```svelte
<TextProperty
	tag="h1"
	class="display-1"
	path={[...path, 'title']}
	placeholder="Hero title"
/>

<TextProperty
	class="pt-4 body-xl text-(--muted-foreground)"
	path={[...path, 'description']}
	placeholder="Say what this page is about"
/>
```

`TextProperty` renders the current content and becomes directly editable when the editor is active. `path` is required. `tag` defaults to `div`; `class`, `style`, and other element attributes pass through, and `placeholder` appears while the field is empty.

The component controls presentation, but the schema controls the content rules. In the Hero schema, `allow_newlines` decides whether `Enter` is allowed and `mark_types` decides which inline formats are available; `annotation_types` can allow data-only ranges such as comments. The same `TextProperty` can therefore be a plain button label, a marked-up paragraph, or a heading without acquiring type-specific editing code.

### MediaProperty: render editable media

`MediaProperty` is Editable's project-level primitive for the `image` and `video` nodes in its schema. It makes the property selectable and renders the correct media component. Like `TextProperty`, it only needs a path:

```svelte
<MediaProperty path={[...path, 'media']} />
```

Media always fills the container, so the Hero layout owns its size and shape. For a fixed crop, give the wrapper an aspect ratio:

```svelte
<div
	class="overflow-hidden"
	style:aspect-ratio="16 / 9"
	style:border-radius="var(--image-border-radius)"
>
	<MediaProperty path={[...path, 'media']} />
</div>
```

For the uploaded media's natural shape, read its dimensions and use a placeholder ratio until something has been pasted:

```svelte
<script>
	let media = $derived(svedit.session.get([...path, 'media']));
</script>

<div
	class="overflow-hidden"
	style:aspect-ratio={media.width && media.height
		? `${media.width} / ${media.height}`
		: '16 / 9'}
>
	<MediaProperty path={[...path, 'media']} />
</div>
```

The only props are the required `path` and an optional `class` on the outer element. Sizing, border radius, and placement remain the caller's responsibility.

### NodeArrayProperty: compose nodes inside nodes

The Hero currently has a fixed title, description, and media slot. Suppose it should also accept any number of calls to action. Add an array of existing `button` nodes to its schema:

```js
actions: {
	type: 'node_array',
	node_types: ['button'],
	default_node_type: 'button'
}
```

Initialize the new property in the Hero inserter:

```js
new_hero: {
	id: 'new_hero',
	type: 'hero',
	layout: 1,
	title: { content: '', marks: [], annotations: [] },
	description: { content: '', marks: [], annotations: [] },
	media: 'hero_media',
	actions: { nodes: [], marks: [], annotations: [] }
}
```

Import `NodeArrayProperty` from `svedit` and place the array wherever the layout should show its buttons:

```svelte
<NodeArrayProperty
	class="flex flex-wrap gap-4"
	path={[...path, 'actions']}
/>
```

That one primitive renders each referenced node through `session_config.node_components`. The existing `Button.svelte` component still owns how a button looks; the Hero owns where the group sits. In edit mode the array also gets insertion points, selection, reordering, copy and paste, and an empty-state insertion point. The schema limits what may be inserted and identifies the default type.

`path` is required. `tag` defaults to `div`; `class`, `style`, and other element attributes pass through to the array container. Arrays may also carry marks and annotations, which `NodeArrayProperty` resolves and passes to their registered components.

Use a text property when the structure is fixed and only its words change. Use a node array when editors should be able to add, remove, reorder, or switch the types of the things inside.

### CustomProperty: build a new property UI

`CustomProperty` is the escape hatch for a property that is neither editable text nor an array of rendered nodes. It establishes a selectable property boundary and renders whatever visual representation you put inside:

```svelte
<CustomProperty path={[...path, 'media']}>
	<!-- Your representation of the property's current value -->
</CustomProperty>
```

`path` and a child snippet are required. `tag` defaults to `div`; `class`, `style`, and other attributes pass through. `CustomProperty` deliberately does not decide how the value changes—you pair it with your own controls, overlay, paste handler, or transaction logic.

`MediaProperty` is the concrete example in this project: it wraps `CustomProperty`, displays `Media.svelte`, and lets the shared editing overlays handle image and video replacement. Reach for `CustomProperty` when adding something similarly visual, such as a color swatch, map position, or product picker. Most content components only need the higher-level primitives above.

### SizableViewbox: let the editor shape media

`SizableViewbox` is an Editable helper rather than a Svedit core primitive. It wraps `MediaProperty` and gives the editor drag handles for maximum width and aspect ratio. To add it to the Hero, extend the schema with two presentation properties:

```js
media_max_width: { type: 'integer', default: 0 },
media_aspect_ratio: { type: 'number', default: 0 }
```

Import `SizableViewbox` from `./SizableViewbox.svelte`, then replace the fixed-ratio wrapper:

```svelte
<SizableViewbox {path} class="mx-auto">
	<MediaProperty path={[...path, 'media']} />
</SizableViewbox>
```

A value of `0` means unconstrained width or the media's natural aspect ratio. In edit mode, the left and right handles change width on a 4px grid and the bottom handle changes aspect ratio. Dragging back to the container width or close to the natural ratio resets the corresponding value to `0`. The viewbox uses `max-width` with `width: 100%`, so it does not overflow its parent.

The default property name is `media`. For another name, the helper derives the corresponding fields automatically:

```svelte
<SizableViewbox {path} media_property="logo" placeholder_aspect_ratio={1}>
	<MediaProperty path={[...path, 'logo']} />
</SizableViewbox>
```

That expects `logo_max_width` and `logo_aspect_ratio` on the containing node. `placeholder_aspect_ratio` defaults to `16 / 9`; `class` and `style` apply to the viewbox itself.

### The complete set

For ordinary content components, the vocabulary is small:

- `Node` identifies the node component's outer boundary.
- `TextProperty` renders and edits a schema `text` property.
- `NodeArrayProperty` renders and edits a schema `node_array` property.
- `CustomProperty` supplies a selectable boundary for a custom property UI.
- `MediaProperty` is Editable's ready-made `CustomProperty` for images and videos.
- `SizableViewbox` optionally adds editor-controlled sizing around media.

The first four come from `svedit`; the last two live in `src/routes/components`. Components such as `Display`, `ButtonGroup`, and `SupportingMedia` are useful compositions of these pieces, not additional editing primitives. System components such as node gaps, carets, and selection markers are wired into the editor shell and normally do not appear in your content components.

## Content model

A small, typed vocabulary for Editable's pages and shared site content.

Editable's content model defines the nodes and properties available to pages and shared site content. Its schema lives in `src/lib/document_schema.js`; this section is the reference.

Documents are graphs of nodes stored by id. Each node has an `id`, a `type`, and type-specific properties. A few naming conventions hold throughout: `content` is the string payload of text properties, `body` holds authored nested content, `items` holds repeated structured children, and `label`/`title`/`description`/`meta` are text properties with semantic meaning.

A **text property** value looks like this in a document. Marks and annotations reference separate nodes by id:

```js
{
	content: 'Editable text',
	marks: [],
	annotations: []
}
```

A **node array** value holds ordered child node ids. Marks and annotations can cover ranges of children; the page body uses a `section` mark for visual grouping:

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

**Marks and annotations** — both attach a separate node to a half-open range using the same shape. For text, offsets address character positions; for node arrays, they address child-node positions. `start_offset` is included and `end_offset` is excluded:

```js
{
	start_offset: 0,
	end_offset: 5,
	node_id: 'strong_1'
}
```

Marks are part of the rendered content: formatting such as emphasis and links for text, or grouping such as sections for node arrays. They are mutually exclusive within a property, so marked ranges cannot overlap. Editable defines these mark types:

```ts
strong, emphasis, code, highlight   // no properties
link { href, target }               // internal links use root-relative page URLs
section                             // groups a range of page body blocks
```

Annotations are metadata layered over content, such as comments, review markers, or application-specific labels. They may overlap marks and other annotations. Svedit preserves and transforms their ranges, but does not render them in place; your application interprets them through CSS classes, component props, or overlay UI.

Editable does not enable an annotation type by default. To add one, define an annotation node and allow it on the relevant text or node-array property:

```js
comment: {
	kind: 'annotation',
	properties: {
		author: { type: 'string' },
		body: { type: 'string' }
	}
}

// On a text or node_array property:
annotation_types: ['comment']
```

Annotation nodes must not have registered rendering components. For node arrays, child components receive every covering annotation through their `annotations` prop, and `Node` adds classes such as `anno-comment`, `anno-comment-start`, and `anno-comment-end`. Text annotations remain data-only, so comments or other interactive annotations usually need an overlay. The [Svedit API](https://github.com/michael/svedit) documents selection state, annotation commands, transactions, and rendering integration in full.

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
