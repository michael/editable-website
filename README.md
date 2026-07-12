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

### Your site is your repo

Each Editable site lives in its own checkout with its own git repository — one folder, one app, one deployment. You start from Editable as a template, own all the code from day one, and keep Editable connected as `upstream` so you can pull in improvements later (see [Upgrading](#upgrading)).

Clone Editable into a folder named after your site, and make Editable the `upstream` remote:

```sh
git clone https://github.com/michael/editable-website.git my-site
cd my-site
git remote rename origin upstream
```

Then create a private repository of your own and make it `origin` — your content is backed up by the [data scripts](#backup-sync--recovery), this backs up your code:

```sh
gh repo create my-site --private --source=. --push
```

(Without the [GitHub CLI](https://cli.github.com): create an empty private repository on GitHub, then `git remote add origin <url>` and `git push -u origin main`.)

From here on, `git push` saves your work to your own repo, and `git pull upstream main` fetches Editable updates.

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

Next, you probably want to adjust the colors and fonts to match your style. Put your overrides in [custom.css](./src/custom.css) — that file is yours, upstream Editable updates never touch it, which keeps future upgrades conflict-free. It loads after [app.css](./src/app.css), so any variable defined there can be overridden:

```css
:root {
	--background: oklch(0.98 0 0);
	--foreground: oklch(0 0 0);
	--accent: oklch(0.21 0.034 264);
	--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
	--font-serif: 'Libertinos Serif Display', ui-serif, Georgia, serif;
}
```

However, likely you'll want to customize more than that. E.g. edit [Button.svelte](./src/routes/components/Button.svelte) to create your very own distinct button style. Anything in [src/routes](./src/routes/) is meant to be customized by you for your project.

## Manual

For detailed documentation on building with Editable see [MANUAL.md](./MANUAL.md).

## Deploy

Editable deploys to [Fly.io](https://fly.io). Install [`flyctl`](https://fly.io/docs/flyctl/install/), then sign in (opens your browser; creates a free account if you don't have one):

```sh
fly auth login
```

Create the app. Pick a globally-unique name:

```sh
fly apps create my-site
```

Now pin that name in [fly.toml](./fly.toml) — uncomment the `app` line and set it:

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

The data scripts move the `data/` folder between your machine and your deployment. Like the `fly` commands, they read the target app from `fly.toml`:

```
npm run data:pull   # remote → local (for local development)
npm run data:push   # local → remote
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
npm run data:backups          # list restore points
npm run data:restore <name>   # roll back to one
```

A rollback restores only the database; it re-points at the same immutable asset pool, which is why `ASSET_GRACE_PERIOD_DAYS` (see above) defines how far back you can safely go. Take an on-demand backup any time with `npm run data:backup`.

> Don't edit the site while a push is in progress — the safeguard assumes the remote state is stable for the moment it takes to snapshot and swap.

## Automated backups (optional)

The manual snapshots above are deliberate actions you take. Optionally, Editable can also back itself up continuously to an S3-compatible bucket: the database is replicated on every write via [Litestream](https://litestream.io) (with point-in-time recovery), and uploaded assets are mirrored to the bucket as they arrive, with a reconciliation sweep at every boot catching anything missed. Everything is write-driven — there are no cron jobs, and suspend mode (`auto_stop_machines = "suspend"`) is fully supported: a suspended machine isn't writing anything, so there's nothing to miss.

### Enabling

Create a bucket and set the secrets. On Fly, [Tigris](https://fly.io/docs/tigris/) does both in one command:

```sh
fly storage create
```

Then `fly deploy`. That's it — the presence of the `BUCKET_NAME` secret enables automated backups; without it, nothing changes. Any S3-compatible provider (Cloudflare R2, AWS S3, MinIO) works by setting the same secrets manually:

```sh
fly secrets set \
  BUCKET_NAME='my-site-backup' \
  AWS_ENDPOINT_URL_S3='https://...' \
  AWS_REGION='auto' \
  AWS_ACCESS_KEY_ID='...' \
  AWS_SECRET_ACCESS_KEY='...'
```

Use one bucket per site. The bucket is append-only: local asset cleanup is never mirrored to it, so unlike volume-local rollbacks, restores from the bucket are not bounded by `ASSET_GRACE_PERIOD_DAYS` — every asset ever uploaded is still there. Replication runs as a supervised sidecar: if it ever fails, your site stays up and the logs say so loudly.

### What you get

- **Disaster recovery, automatically.** On boot, a machine with an empty volume restores the database from the bucket, then downloads the assets it references. If your volume (or app, or region) is ever lost: `fly deploy` against a fresh volume brings your site back.
- **Point-in-time restore to production.** Roll the live database back to any moment, shipped through the same guarded swap as a push (pre-restore backup, integrity validation, verification). List the available restore points, then pick one:

  ```sh
  npm run data:cloud-snapshots                              # what moments can I restore to?
  npm run data:restore-cloud                                # latest bucket state
  npm run data:restore-cloud -- --at "2026-07-10T15:00:00Z" # a specific moment
  ```

- **Local restores** — rebuild your local `data/` from the bucket, e.g. to investigate a past state without touching production. See [Local restores](#local-restores) below.

Restores always download only the assets the restored database references — the bucket holds full history, but a restore transfers just the site's working set as of that moment.

Continuous backups complement the manual snapshots rather than replacing them: `data:push`/`data:pull`/`data:backup`/`data:restore` remain the tools for deliberate, operational state moves. Design details in [PLAN_AUTOMATED_BACKUP.md](./PLAN_AUTOMATED_BACKUP.md).

### Local restores

Rebuild your local `data/` folder from nothing but the bucket — a new laptop, or forensic work: say the site was vandalized and you need to find the last good state. Try timestamps locally until you find it, then restore production to that exact moment. Iterating is cheap: each round downloads a small database plus only the missing assets, and your previous local database is backed up to `data-backups/` first. Nothing here ever writes to the bucket or touches production.

One-time setup — install Litestream into the project (pinned to the same version the server runs, so local restores always read the exact format the server writes) and put the bucket credentials into your `.env` (see `.env.example`; read them from the machine with `fly ssh console -C env`):

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
git pull upstream main    # get the latest Editable
npm install               # update dependencies (including svedit)
npm run data:pull         # bring your live content local
npm run dev               # test the new code against your real content
fly deploy                # ship it
git push                  # your repo now holds the upgraded state
```

The order is the safety net: back up before touching anything, and test the new code against your real content locally before deploying it. Database schema migrations run automatically when the new code boots, locally and on the server.

Merge conflicts can only occur in files you changed. If your customizations live in the files meant for you — [custom.css](./src/custom.css), the `app` line in `fly.toml`, and your own code in [src/routes](./src/routes/) — pulls are typically conflict-free, since upstream never touches `custom.css` and rarely touches the rest. The more you've rewritten, the more the pull becomes a starting point for a manual merge — at that point, review what changed upstream and adopt what applies.

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
