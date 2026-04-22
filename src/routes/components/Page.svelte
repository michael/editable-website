<script>
  import { getContext } from 'svelte';
  import { AnnotatedTextProperty, Node, NodeArrayProperty } from 'svedit';
  import Nav from './Nav.svelte';
  import Footer from './Footer.svelte';
  import MediaProperty from './MediaProperty.svelte';
  import { get_head_metadata, get_media_asset_url } from '$lib/page_metadata.js';
  import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

  const svedit = getContext('svedit');
  let { path } = $props();
  let node = $derived(svedit.session.get(path));
  let first_body_node_id = $derived(node.body?.[0]);
  let first_body_node = $derived(first_body_node_id ? svedit.session.get([first_body_node_id]) : null);
  let nav_colorset_class = $derived(first_body_node?.colorset ? `ew-colorset-${first_body_node.colorset}` : '');

  let last_body_node_id = $derived(node.body?.[node.body.length - 1]);
  let last_body_node = $derived(last_body_node_id ? svedit.session.get([last_body_node_id]) : null);
  let footer_colorset_class = $derived(last_body_node?.colorset ? `ew-colorset-${last_body_node.colorset}` : '');
  let head_metadata = $derived(get_head_metadata(svedit.session.doc));
  let social_image_url = $derived(
    head_metadata.preview_media_node?.type === 'image'
      ? get_media_asset_url(head_metadata.preview_media_node)
      : null
  );
</script>

<svelte:head>
  <title>{head_metadata.title}</title>
  {#if head_metadata.description}
    <meta name="description" content={head_metadata.description} />
    <meta property="og:description" content={head_metadata.description} />
    <meta name="twitter:description" content={head_metadata.description} />
  {/if}
  <meta property="og:title" content={head_metadata.title} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={head_metadata.title} />
  {#if social_image_url}
    <meta property="og:image" content={social_image_url} />
    <meta name="twitter:image" content={social_image_url} />
  {/if}
</svelte:head>

<Node {path}>
  <div class="page min-h-screen flex flex-col">
  	<div class="bg-(--background) text-(--foreground) {nav_colorset_class}">
  		<Nav path={[...path, 'nav']}/>
  	</div>
   	<div class="grow" style="anchor-name: --page-body; --node-caret-boundary: --page-body;">
    	<NodeArrayProperty class="body-node-array" path={[...path, 'body']} />
    </div>
    <div class="bg-(--background) text-(--foreground) {footer_colorset_class}">
    	<Footer path={[...path, 'footer']}/>
    </div>
    {#if svedit.editable}
    	<div class="border-t border-(--foreground)/10 bg-(--background) text-(--foreground)">
    		<div class="{TW_LIMITER}">
    			<div class="{TW_PAGE_PADDING_X} py-12 md:py-16 flex flex-col gap-6">
    				<div contenteditable="false" class="text-xs uppercase tracking-widest opacity-60 max-w-2xl text-left">How should this page be displayed in a search result?</div>
    				<div class="w-full max-w-2xl grid grid-cols-[8rem_minmax(0,1fr)] gap-6 items-center">
    					<div class="w-32 aspect-square border border-(--foreground)/10">
    						<MediaProperty path={[...path, 'image']} />
    					</div>
    					<div class="flex flex-col gap-4 justify-center">
    						<AnnotatedTextProperty
    							path={[...path, 'title']}
    							placeholder="Page title"
    							class="block font-serif text-2xl text-(--foreground)"
    						/>
						<AnnotatedTextProperty
							path={[...path, 'description']}
							placeholder="Write a clear summary of this page for search results.
Explain what people will find here in 1–2 concise sentences.
Aim for specific, human-readable copy rather than keywords."
							class="block text-(--foreground)"
						/>
    					</div>
    				</div>
    			</div>
    		</div>
    	</div>
    {/if}
  </div>
</Node>

<style>
	.page {
		--row: 0;
	}
  :global {
    .body-node-array {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
</style>
