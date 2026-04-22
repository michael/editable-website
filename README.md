# Editable Website v2

The next generation of Editable Website — a complete rewrite designed to make Svelte developers happy.

> **NOTE:** v2 is a complete rewrite using [Svedit](https://github.com/michael/svedit). It's under active development — feel free to explore locally, but hold off on production deployments for now.

## Who is Editable Website for?

For anyone who enjoys creating websites using Svelte and wants to allow their clients to make edits directly in the layout as they browse their site.

For your next website project, you might not need a Content Management System (CMS) anymore. Start from a fully functional, user-editable website that supports common content types: prose, heroes, features, galleries, and listings.

Adapt colors and fonts to deploy a beautiful site within minutes — or customize the entire layout and model your own content types using the [Svedit APIs](https://github.com/michael/svedit).

## Getting started

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

To re-seed the database with the initial demo content, use:

```sh
npm run dev:seed
```

Next, you probably want to adjust the colors and fonts in [app.css](./src/app.css) to match your style.

```css
:root {
	--background: oklch(0.98 0 0);
	--foreground: oklch(0 0 0);
	--accent: oklch(0.21 0.034 264);
	--accent-foreground: oklch(0.98 0 0);
}

@theme {
	--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
	--font-serif: 'Libertinos Serif Display', ui-serif, Georgia, serif;
	--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
```

However, likely you'll want to customize more than that. E.g. edit [Button.svelte](./src/routes/components/Button.svelte) to create your very own distinct button style. Anything in [src/routes](./src/routes/) is meant to be customized by you for your project.

<!--**Note:** After `git pull`, delete `data/site.sqlite3` to pick up schema changes.-->

## Manual

For detailed documentation on building with Editable Website see [MANUAL.md](./MANUAL.md).

## Deploy

```
fly apps create my-editable-website
```

```
fly secrets set -a my-editable-website \
  ORIGIN='https://my-editable-website.fly.dev' \
  BODY_SIZE_LIMIT='30000000' \
  ADMIN_PASSWORD='change-me'
```

```
fly deploy -a my-editable-website --primary-region fra --vm-size shared-cpu-1x --vm-memory 256 --volume-initial-size 1
```

## FAQs

### How is this different to using a CMS?

The editing infrastructure (Svedit) becomes an integral part of your website (at runtime). As a developer, all you do is define content types (e.g. Figure) and implement components (e.g. Figure.svelte) — they are editable by default.

### Is mobile editing supported?

There is experimental support for mobile editing — it works in principle. The current focus is on desktop UX, but mobile editing will improve over time.

### Where is the data stored?

All content lives in a single `data/` directory — an SQLite database (`db.sqlite3`) and uploaded assets (`assets/`). Locally this defaults to `./data`. On Fly.io it's a persistent volume at `/data`. To back up your site, copy this directory.

### How about AI?

Editable Website is a foundational, AI-agnostic tool. That said, it makes perfect sense to utilize AI workflows to help building your custom site. Think prompts like "Create a hero block type with title + description and optional CTA buttons" and "Implement Hero.svelte with 5 distinct layout variations".

### Plugins?

Editable Website is modular and you can and should reuse code across projects. However, I purposely don't want to establish a community maintained plugin repository. I want to encourage you to own all your code, for the benefit of simplicity, safety, and control. Share code snippets, not plugins.

### Hosting?

Editable Website runs on any VPS. All you need is Node.js and SQLite. The repository includes a `Dockerfile` and `fly.toml` for one-command deployment to [Fly.io](https://fly.io) — see [Deploying to Fly.io](#deploying-to-flyio) above. The same Dockerfile works with any platform that supports Docker.

### Static builds?

There's no point for static builds with Editable Website. The whole idea is that users edit content live, without having to wait for a rebuild to finish. SQLite is fast. Very fast. Web-optimized images are generated client-side before upload: resizing happens in the browser via canvas and `toBlob()`, and WebP encoding is done with `@jsquash/webp`. It still makes sense to enable a proxy for images, so they can be delivered from a CDN.

### License?

Editable Website will at least be source-available. There will likely be an affordable one-time registration fee (per domain) for personal use, and a fair fee for commercial projects. I'm still working on the details. If you’re open to discussion, join the [technical preview](https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform).

## Looking for v1?

Find it [here](https://github.com/michael/editable-website/tree/v1).
