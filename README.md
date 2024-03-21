# editable-website

A SvelteKit template for coding **completely custom websites**, while allowing non-technical people to **make edits** to the content by simply logging in with a secure admin password.

Check out the demo at [editable.website](https://editable.website).

See it out in the wild at [sonjastojanovic.com](https://sonjastojanovic.com), [nisse.tech](https://nisse.tech), [michaelaufreiter.com](https://michaelaufreiter.com), [postowl.com](https://postowl.com), [trails-shop.at](https://trails-shop.at)
and [officegallery.cz](https://officegallery.cz).

Read the discussion on [Hackernews](https://news.ycombinator.com/item?id=35456083).

Editable Website won the 2nd price in the [SvelteHack 2023](https://hack.sveltesociety.dev/winners). 🥳 We still can't believe it. Big thanks to the [Svelte Society](https://sveltesociety.dev/) and congrats to the other winners, and everyone who participated. 🙏 So many inspiring projects!

## But why?

It's a dynamic website but light as a feather compared to building on top of a CMS. It makes editing content self-explanatory for end-users.

## Step 0 - Requirements

- Node.js 18+
- SQLite3

These are needed to run the example as is, but you can choose any other database and file storage solution.

## Step 1 - Development setup

This is a full-fledged web app you want to adjust to your own needs. So please **create a copy** or fork of the source code and rename the project accordingly.

First clone the repository.

```bash
$ git clone https://github.com/michael/editable-website.git
cd editable-website
```

Install the dependencies.

```bash
npm install
```

Copy the contents of `.env.example` into `.env` and adjust to your needs.

```bash
DB_PATH=./data/db.sqlite3
ADMIN_PASSWORD=xxxxxxxxxxxx
ORIGIN=http://localhost:5173
```

Seed the database:

```bash
sqlite3 data/db.sqlite3 < sql/schema.sql
```

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev
```

To create and test a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Making changes to your website

You can literally do everything that SvelteKit allows you to do. Below is the source code for the /imprint page, which has a `<PlainText>` title and `<RichText>` content.

```svelte
<svelte:head>
  <title>Imprint</title>
</svelte:head>

{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
      <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
      <LoginMenu {currentUser} />
    </div>
  </Modal>
{/if}

{#if editable}
  <EditorToolbar on:cancel={initOrReset} on:save={savePage} />
{/if}

<WebsiteNav bind:showUserMenu {currentUser} bind:editable />

<div class="py-12 sm:py-24">
  <div class="max-w-screen-md mx-auto px-6 md:text-xl">
    <h1 class="text-4xl md:text-7xl font-bold pb-8">
      <PlainText {editable} bind:content={title} />
    </h1>
    <div class="prose md:prose-xl pb-12 sm:pb-24">
      <RichText multiLine {editable} bind:content={imprint} />
    </div>
  </div>
</div>

<Footer counter="/imprint" />
```

To see the full picture, open [src/routes/imprint/+page.svelte](src/routes/imprint/%2Bpage.svelte) and [src/routes/imprint/+page.server.js](src/routes/imprint/%2Bpage.server.js).

Please use this as a starting point for new pages you want to add to your website. `editable-website` is not a widget-library on purpose. Instead you are encouraged to inspect and adjust all source code, including the [schema](./src/lib/prosemirrorSchemas.js) for the editors. I want you to be in control of everything. No behind-the-scene magic.

## Making changes to the content

Just navigate to `http://127.0.0.1:5173/login` and enter your secure admin password (`ADMIN_PASSWORD`). Now you see an additional ellipsis menu, which will provide you an "Edit page" or "Edit post" option for all pages that you have set up as "editable".

## Deployment to Fly.io

This repo contains the files you need to deploy your site to [fly.io](https://fly.io/).

1. Create an account with [fly.io](https://fly.io/). (Fly [require an active, valid credit / bank card](https://fly.io/docs/about/credit-cards/) to prevent abuse, but the site runs well on their free tier. Unless you have a very busy site, hosting will be free.)
1. [Install `fly`](https://fly.io/docs/hands-on/install-flyctl/) and sign in with `fly auth login`
1. Clone this repo to a directory on your computer
1. Enter the directory you cloned the repo to: `cd myapp`
1. Run `fly apps create`
   1. Enter a name for your application at the prompt (e.g. `myapp`)
   1. Choose a Fly organization to deploy to
1. Copy the contents from `fly.toml.example` to `fly.toml` and adjust to your needs. You have to change `app = "myapp"` and `source = "myapp_data"` to the app name you provided earlier.
1. Run `fly deploy` as shown below. **Substitute your own values for the secrets** and make sure to replace all instances of `myapp` with the name you chose when creating the application above:

```
fly deploy \
    --build-secret DB_PATH="./data/db.sqlite3" \
    --build-secret ADMIN_PASSWORD="your-super-secret-admin-password" \
    --build-secret ORIGIN="https://myapp.fly.dev"
```

The `-a` option in `fly deploy` lets you override the app name specified in `fly.toml`.

Fly will let you know when the app is deployed. Visit the URL shown in your terminal and sign in at `/login` with the `ADMIN_PASSWORD` you set above.

## Connect a domain to your Fly.io app

- Run `fly ips list -a myapp` to get the IPv4 and IPv6 addresses.
- Head over to your DNS provider and add A and AAAA records for myapp.com with the IPv4 and IPv6 values.
- Run `fly certs create -a myapp myapp.com`
- Run `fly certs show -a myapp myapp.com` to watch your certificates being issued.

## Fly.io Backups

You can pull a backup locally and run it to check if it is valid. That's also quite useful for developing/testing against the latest production data. For the best experience, keep your database small. ;)

1. Make a snapshot remotely
   - `fly ssh console`
   - `sqlite3 data/db.sqlite3 ".backup data/backup-db.sqlite3"`
   - `sqlite3 data/backup-db.sqlite3 "PRAGMA integrity_check;"` (optional integrity check)
   - Exit the remote console (CTRL+D)
1. Download the database and test it with your local instance
   - `rm -rf data/db.*` (careful, this wipe the database files locally)
   - `fly sftp get data/backup-db.sqlite3 data/db.sqlite3` (and puts the downloaded backup in place)

To restore a backup in production, you need to be a bit careful and follow these steps (your site could be down for a few minutes during the restore).

1. Make sure nobody writes to the app
1. Make a backup remotely (in case something goes wrong)
   - `fly ssh console`
   - `sqlite3 data/db.sqlite3 ".backup data/backup-db.sqlite3"`
   - `sqlite3 data/backup-db.sqlite3 "PRAGMA integrity_check;"` (optional integrity check)
   - `rm -rf data/db.*` (this removes the current database files, not the backup)
   - Exit the remote console (CTRL+D)
1. Copy your local db.sqlite3 file to production using SFTP
   - `sqlite3 data/db.sqlite3 ".backup data/backup-db.sqlite3"`
   - `rm -rf data/db*`
   - `mv data/backup-db.sqlite3 data/db.sqlite3` (the first 3 commands make sure db.sqlite3 has the very latest state)
   - `fly sftp shell`
   - `cd app/data`
   - `put data/db.sqlite3`
   - Exit SFTP client (CTRL+D)
1. Restart the app (so that the new DB gets picked up)
   - `fly apps restart`

## Get in touch

If you have questions or need help (with development or deployment), please email me at michael@letsken.com.

## Examples

Community provided examples of additional features you can add to your editable website:

- [ChatGPT completion tool](https://github.com/nilskj/editable-website)
