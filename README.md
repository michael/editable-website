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

## License

Editable Website will at least be source-available. There will likely be an affordable one-time registration fee (per domain) for personal use, and a higher fee for commercial projects. I'm still working on the details. If you’re open to discussion, join the [technical preview](https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform).


## FAQs

### Is mobile editing supported?

Editable Website is desktop-only, simply because keyboard shortcuts don't work on mobile. This might change in the future, though mobile editing is supported in Svedit. The experience doesn't match my high standards for an editing interface. However, I'll work towards gradually supporting mobile editing. Maybe a good compromise is allowing text changes on mobile (like fixing a typo) while structural editing remains desktop-only.

### But end-users will be overwhelmed with keyboard shortcuts?

ikely, I agree. The pure keyboard-shortcut-driven approach may be temporary. I want to test out how that purist approach is received. So far, most people have been pleasantly surprised by how intuitive the interface is. It's definitely a different feel when there's just your content and almost no distracting UI, though there's a bit of a learning curve. In practice, I think that eventually I will add a few interface elements, like save, cancel, and browse buttons. Don't expect a full-fledged Google Docs style toolbar though.


## Looking for v1?

Find it [here](https://github.com/michael/editable-website/tree/v1).
