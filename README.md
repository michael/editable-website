# editable.website v2

The next generation of [editable.website](https://editable.website) — a complete rewrite designed to make Svelte users very happy.

> **NOTE:** v2 is currently under heavy development. You can try it out, but it's not ready to use yet.

## Who is editable.website for?

For anyone who enjoys creating websites using Svelte and wants to allow their clients to make edits directly in the layout as they browse their site.

You no longer need a CMS. Start from a fully functional, user-editable website that supports common content types: prose, heroes, features, galleries, and listings.

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

And run the development server:

```sh
npm run dev
```

<!--**Note:** After `git pull`, delete `data/db.sqlite3` to pick up schema changes.-->

## Status

This is v2, a complete rewrite using [Svedit](https://github.com/michael/svedit). It's under active development — feel free to explore locally, but hold off on production deployments for now.

## Deploying to Fly.io

### Prerequisites

1. Install the Fly CLI: https://fly.io/docs/flyctl/install/
2. Sign up or log in: `fly auth login`

### First-time setup

Run the init command to create your deployment configuration:

```sh
npm run deploy:init
```

This will ask for your app name and region, then create:
- `fly.toml` — Fly.io configuration
- `Dockerfile` — Container build instructions  
- `.env.production.example` — Template for your secrets

Copy the example and add your values:

```sh
cp .env.production.example .env.production
```

Edit `.env.production` with your actual values (this file is gitignored).

### Deploy

Build and deploy your site:

```sh
npm run build
npm run deploy
```

Your site will be live at `https://your-app-name.fly.dev`

### Updating secrets

When you add new secrets to `deploy/config.js`:

1. Add the value to `.env.production`
2. Run `npm run deploy:secrets`

### Custom domain

```sh
fly certs add yourdomain.com
```

Then configure DNS to point to your Fly.io app:

| Type  | Name | Value                    |
|-------|------|--------------------------|
| CNAME | www  | your-app-name.fly.dev    |

For the root domain (@), use one of these options:
- **ALIAS/ANAME** (if your DNS supports it): Point to `your-app-name.fly.dev`
- **A/AAAA records**: Run `fly ips list` and create A (IPv4) and AAAA (IPv6) records

## Deploying to other platforms

This repo is configured for Fly.io deployment by default (using `@sveltejs/adapter-node`). 

**For Vercel or Cloudflare Pages:** You'll need to switch the adapter in `svelte.config.js`.

## Looking for v1?

Find it [here](https://github.com/michael/editable-website/tree/v1).
