# editable-website

A SvelteKit template for coding **completely custom website**, while allowing non-technical people to **make edits** to the content by simply logging in with a secure admin password.

Check out the demo at [editable.website](https://editable.website).

## But why?

It's a dynamic website but light as a feather compared to building on top of a CMS. It makes editing content self-explanatory.

## Step 0 - Requirements

- Node.js 16+ or compatible JavaScript runtime
- Postgres 14+
- MinIO or other S3-compatible storage solution

These are needed to run the example as is, but you can choose any other database and file storage solution.

## Step 1 - Development setup

This is a full-fledged web app you want adjust to your own needs. So please **create a copy** or fork of the source code and rename the project accordingly. Then check out your own copy:

```bash
git clone https://github.com/your-user/your-website.git
cd your-website
```

Create a `.env` file and set the following environment variables to point to your development database and MinIO instance:

```bash
VITE_DB_URL=postgresql://$USER@localhost:5432/editable-website
VITE_S3_ACCESS_KEY=000000000000000000
VITE_S3_SECRET_ACCESS_KEY=00000000000000000000000000000000000000
VITE_S3_ENDPOINT=https://minio.ew-dev-assets--000000000000.addon.code.run
VITE_S3_BUCKET=editable-website
VITE_ASSET_PATH=https://minio.ew-dev-assets--000000000000.addon.code.run/editable-website
VITE_ADMIN_PASSWORD=00000000000000000000000000000000000000
```

Seed the database:

```bash
psql -h localhost -U $USER -d editable-website -a -f sql/schema.sql
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

## Step 2 - Making changes to your website

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

## Step 3 - Making changes to the content

Just navigate to `http://127.0.0.1:5173/login` and enter your secure admin password (`VITE_ADMIN_PASSWORD`). Now you see an additional ellipsis menu, which will provide you an "Edit page" or "Edit post" option for all pages that you have set up as "editable".

## Step 4 - Deployment

I will describe the steps to deploy to [Northflank](https://northflank.com/) (which I am using). I recommend to assign 0.2 vCPU and 512MB RAM to each resource (~ $17/month) but you can go lower to save some costs or higher if you expect your site to have significant traffic.

1. Create instances for Postgres 14 and MinIO through the Northflank user interface.

2. Create a combined service, select the Heroku buildpack and assign the environment variables as they are exposed by the Postgres and MinIO addons. Use the same environment variables during the build step and runtime (yes, you have to type them twice).

You can deploy your editable website anywhere else as well. For instance if you'd like to go the "Serverless" path, you can deploy on Vercel, and use NeonDB (or DigitalOcean with Connection Pooling activated). You may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Step 5 - Get in touch

If you have questions or need help (with development or deployment), send me an email (michael@letsken.com) and suggest a few slots where you have time for a 30 minute chat (I'm based in Austria GMT+1).

## Examples
Community provided examples of additional features you can add to your editable website:
- [ChatGPT completion tool](https://github.com/nilskj/editable-website)