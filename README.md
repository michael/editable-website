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

However, likely you'll want to customize more than that. E.g. edit [Button.svelte](./src/routes/components/Button.svelte) to create your very own distinct button style. Anything [src/routes](./src/routes/) is meant to be customized by you for your project.

<!--**Note:** After `git pull`, delete `data/db.sqlite3` to pick up schema changes.-->

## Status

This is v2, a complete rewrite using [Svedit](https://github.com/michael/svedit). It's under active development — feel free to explore locally, but hold off on production deployments for now.

## FAQs

### How is this different to using a CMS?

The editing infrastructure (Svedit) becomes an integral part of your website (at runtime). This means that for your next website project, you might not need a Content Management System (CMS) anymore. As a developer, all you do is define content types (e.g. Figure) and implement components (e.g. Figure.svelte) — they are editable by default.

### Is mobile editing supported?

Editable Website is desktop-only, simply because keyboard shortcuts don't work on mobile. This might change in the future. Mobile editing is supported in Svedit. The experience doesn't match my high standards for an editing interface. However, I'll work towards gradually supporting mobile editing. Maybe a good compromise is allowing text changes on mobile (like fixing a typo) while structural editing remains desktop-only.

### But end-users will be overwhelmed with keyboard shortcuts?

Likely, I agree. The pure keyboard-shortcut-driven approach may be temporary. I want to test out how that purist approach is received. So far, most people have been pleasantly surprised by how intuitive the interface is. It's definitely a different feel when there's just your content and almost no distracting UI, though there's a bit of a learning curve. In practice, I think that eventually I will add a few interface elements, like save, cancel, and browse buttons. Don't expect a full-fledged Google Docs style toolbar though.

### Where is the data stored?

Editable Website stores all content, including source images in an SQLite database. So to backup your site, all you have to do is make regular copies of your site.sqlite3 file.

### How about AI?

Editable Website is a foundational, AI-agnostic tool. That said, it makes perfect sense to utilize AI workflows to help building your custom site. Think prompts like "Create a hero block type with title + description and optional CTA buttons" and "Implement Hero.svelte with 5 distinct layout variations".

### Plugins?

Editable Website is modular and you can and should reuse code across projects. However, I purposely don't want to establish a community maintained plugin repository. I want to encourage you to own all your code, for the benefit of simplicity, safety, and control. Share code snippets, not plugins.

### Hosting?

Editable Website runs on any VPS. All you need is Node.js and SQLite. I'm personally using [Fly.io](https://fly.io) for hosting. A Dockerfile will be provided that can be used with Fly.io and other platforms that support Docker.

### Static builds?

There's no point for static builds with Editable Website. The whole idea is that users edit content live, without having to wait for a rebuild to finish. SQLite is fast. Very fast. Web-optimized images are generated on the fly and cached on the server's file system. It makes sense to enable a proxy for images, so they can be delivered from a CDN.

### License?

Editable Website will at least be source-available. There will likely be an affordable one-time registration fee (per domain) for personal use, and a fair fee for commercial projects. I'm still working on the details. If you’re open to discussion, join the [technical preview](https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform).

## Looking for v1?

Find it [here](https://github.com/michael/editable-website/tree/v1).
