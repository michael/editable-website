# Editable

Editable brings live on-page editing to Svelte. Site owners edit directly in the layout; developers keep full control with ordinary Svelte components.

## Who is Editable for?

For anyone who enjoys creating websites using Svelte and wants to allow their clients to make edits directly in the layout as they browse their site.

For your next website project, you might not need a Content Management System (CMS) anymore. Start from a fully functional, user-editable website that supports common content types: prose, heroes, features, galleries, and listings.

Adapt colors and fonts to deploy a beautiful site within minutes — or customize the entire layout and model your own content types using the [Svedit APIs](https://github.com/michael/svedit).

## Getting started

### Prerequisites

- **Node.js 24+** — Editable uses Node's built-in SQLite (`node:sqlite`), which needs a recent Node. This is also the version the production Docker image runs, so you develop against what you deploy. With [nvm](https://github.com/nvm-sh/nvm), `nvm use` picks it up from `.nvmrc`.
- **git**
- The [Fly.io CLI](https://fly.io/docs/flyctl/install/) (`flyctl`) — only needed later, for deployment and the sync/backup scripts.

Clone the repository:

```sh
git clone https://github.com/michael/editable-website.git
cd editable-website
```

Install dependencies:

```sh
npm install
```

Copy `.env.example` to `.env` and set an admin password for local development:

```sh
cp .env.example .env
```

Then set `ADMIN_PASSWORD` in `.env`:

```sh
ADMIN_PASSWORD='change-me'
```

`ADMIN_PASSWORD` is required for admin login and save-capable editing.

And run the development server:

```sh
npm run dev
```

On startup you'll see an `ExperimentalWarning` about `node:sqlite` — that's expected and harmless.

To re-seed the database with the initial demo content, use:

```sh
npm run dev:seed
```

Next, you probably want to adjust the colors and fonts in [app.css](./src/app.css) to match your style.

```css
:root {
	--background: oklch(0.98 0 0);
	--foreground: oklch(0 0 0);
	--muted: oklch(1 0 0);
	--border: oklch(0.88 0 0);
	--muted-foreground: oklch(0.55 0 0);
	--accent: oklch(0.21 0.034 264);
	--accent-foreground: oklch(0.98 0 0);
}

@theme {
	--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
	--font-serif: 'Libertinos Serif Display', ui-serif, Georgia, serif;
	--font-mono:
		ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
		monospace;
	--shadow-sm: 0 2px 4px -1px oklch(0 0 0 / 0.12), 0 1px 2px -1px oklch(0 0 0 / 0.12);
	--shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.12), 0 8px 10px -6px oklch(0 0 0 / 0.12);
}
```

However, likely you'll want to customize more than that. E.g. edit [Button.svelte](./src/routes/components/Button.svelte) to create your very own distinct button style. Anything in [src/routes](./src/routes/) is meant to be customized by you for your project.

<!--**Note:** After `git pull`, delete `data/site.sqlite3` to pick up schema changes.-->

## Manual

For detailed documentation on building with Editable see [MANUAL.md](./MANUAL.md).

## Deploy

Editable deploys to [Fly.io](https://fly.io). Install [`flyctl`](https://fly.io/docs/flyctl/install/), then sign in (opens your browser; creates a free account if you don't have one):

```sh
fly auth login
```

Pick a globally-unique app name and set it once for the rest of this terminal session — every command below reuses it:

```sh
APP=your-unique-app-name
```

Create the app:

```sh
fly apps create "$APP"
```

Set the secrets. `ORIGIN` must be your app's public URL, so canonical links and social preview images resolve correctly:

```sh
fly secrets set -a "$APP" \
  ORIGIN="https://$APP.fly.dev" \
  BODY_SIZE_LIMIT='30000000' \
  ADMIN_PASSWORD='change-me'
```

Optionally set `ASSET_GRACE_PERIOD_DAYS` (default 7): unreferenced asset files are kept on disk this many days after losing their last reference. This is also the safe window for rolling back a database backup against the live assets folder without ending up with dead image references.

Deploy. The first deploy also creates the 1 GB `data` volume declared under `[mounts]` in `fly.toml`:

```sh
fly deploy -a "$APP" --primary-region fra --vm-size shared-cpu-1x --vm-memory 256 --volume-initial-size 1
```

Watch it boot, and confirm the volume was created:

```sh
fly logs -a "$APP"
fly volumes list -a "$APP"
```

Then open your site and log in with the `ADMIN_PASSWORD` you set:

```sh
fly open -a "$APP"
```

That same name is what you pass as `FLY_APP` to the sync and backup scripts below. Because those scripts read it from the environment (not the command line), export it: `export FLY_APP="$APP"`.

## Backup, sync & recovery

`scripts/data.sh` moves the `data/` folder between your machine and a Fly.io deployment. Set `FLY_APP` to your app name.

```
FLY_APP=my-editable-website npm run data:pull   # remote → local (for local development)
FLY_APP=my-editable-website npm run data:push    # local → remote
```

Pull the live site down to work on it locally, or push a local state up to production. Both directions sync the database and any missing assets.

### Why not just copy the folder?

The database runs in SQLite [WAL mode](https://www.sqlite.org/wal.html): recent writes live in a `db.sqlite3-wal` sidecar, not the main file. Copying the files of a running database loses or corrupts data. `data.sh` instead takes a consistent `VACUUM INTO` snapshot, which is safe even while the site is being edited. **Do not** back up by copying `data/` of a running instance.

Assets are content-addressed and immutable, so they only ever need to be added, never overwritten — syncs transfer just the files the other side is missing.

### Safety and undo

`push` is guarded so a bad push can't quietly break production:

- The local database is validated (integrity check + every referenced asset present) before anything is sent.
- The current remote database is backed up first — on the volume **and** mirrored to `data-backups/` locally — before the new one is applied.
- The new database is swapped in at boot, when no connection is open, so the live database can never be corrupted mid-write.
- After the swap, the remote database is re-validated; if it fails, you're told the exact restore command.

Every push prints an undo command. To roll back:

```
FLY_APP=my-editable-website ./scripts/data.sh backups              # list restore points
FLY_APP=my-editable-website ./scripts/data.sh restore <name>       # roll back to one
```

A rollback restores only the database; it re-points at the same immutable asset pool, which is why `ASSET_GRACE_PERIOD_DAYS` (see above) defines how far back you can safely go. Take an on-demand backup any time with `./scripts/data.sh backup`.

> Don't edit the site while a push is in progress — the safeguard assumes the remote state is stable for the moment it takes to snapshot and swap.

## FAQs

### How is this different to using a CMS?

The editing infrastructure (Svedit) becomes an integral part of your website (at runtime). As a developer, all you do is define content types (e.g. Figure) and implement components (e.g. Figure.svelte) — they are editable by default.

### Is mobile editing supported?

There is experimental support for mobile editing — it works in principle. The current focus is on desktop UX, but mobile editing will improve over time.

### Where is the data stored?

All content lives in a single `data/` directory — an SQLite database (`db.sqlite3`) and uploaded assets (`assets/`). Locally this defaults to `./data`. On Fly.io it's a persistent volume at `/data`. See [Backup, sync & recovery](#backup-sync--recovery) for how to snapshot and move it safely (don't just copy the folder of a running instance — the database is in WAL mode).

### How about AI?

Editable is a foundational, AI-agnostic tool. That said, it makes perfect sense to utilize AI workflows to help building your custom site. Think prompts like "Create a hero block type with title + description and optional CTA buttons" and "Implement Hero.svelte with 5 distinct layout variations".

### Plugins?

Editable is modular and you can and should reuse code across projects. However, I purposely don't want to establish a community maintained plugin repository. I want to encourage you to own all your code, for the benefit of simplicity, safety, and control. Share code snippets, not plugins.

### Hosting?

Editable runs on any VPS. All you need is Node.js and SQLite. The repository includes a `Dockerfile` and `fly.toml` for one-command deployment to [Fly.io](https://fly.io) — see [Deploy](#deploy) above. The same Dockerfile works with any platform that supports Docker.

### Static builds?

There's no point for static builds with Editable. The whole idea is that users edit content live, without having to wait for a rebuild to finish. SQLite is fast. Very fast. Web-optimized images are generated client-side before upload: resizing happens in the browser via canvas and `toBlob()`, and WebP encoding is done with `@jsquash/webp`. It still makes sense to enable a proxy for images, so they can be delivered from a CDN.

### License?

Editable will at least be source-available. There will likely be an affordable one-time registration fee (per domain) for personal use, and a fair fee for commercial projects. I'm still working on the details. If you’re open to discussion, join the [technical preview](https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform).

## Looking for v1?

Find it [here](https://github.com/michael/editable-website/tree/v1).
