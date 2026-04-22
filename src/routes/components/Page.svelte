<script>
  import { getContext } from 'svelte';
  import { AnnotatedTextProperty, Node, NodeArrayProperty } from 'svedit';
  import Nav from './Nav.svelte';
  import Footer from './Footer.svelte';
  import { get_head_metadata } from '$lib/page_metadata.js';

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
</script>

<svelte:head>
  <title>{head_metadata.title}</title>
  {#if head_metadata.description}
    <meta name="description" content={head_metadata.description} />
    <meta property="og:description" content={head_metadata.description} />
    <meta name="twitter:description" content={head_metadata.description} />
  {/if}
  <meta property="og:title" content={head_metadata.title} />
  <meta name="twitter:title" content={head_metadata.title} />
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
    		<div class="px-5 sm:px-7 md:px-10 lg:px-14 py-6 flex flex-col gap-4">
    			<div class="text-xs uppercase tracking-widest opacity-60">Page metadata</div>
    			<div class="flex flex-col gap-2">
    				<div class="text-xs uppercase tracking-widest opacity-60">Title</div>
    				<AnnotatedTextProperty
    					path={[...path, 'title']}
    					placeholder="Page title"
    					class="block font-serif text-2xl text-(--foreground)"
    				/>
    			</div>
    			<div class="flex flex-col gap-2">
    				<div class="text-xs uppercase tracking-widest opacity-60">Description</div>
    				<AnnotatedTextProperty
    					path={[...path, 'description']}
    					placeholder="Page description"
    					class="block text-(--foreground)"
    				/>
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
