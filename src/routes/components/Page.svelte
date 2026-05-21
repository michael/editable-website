<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { get_head_metadata, get_media_asset_url } from '$lib/page_metadata.js';

	const svedit = getContext('svedit');
	let { path } = $props();
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
		<div class="grow" style="anchor-name: --page-body; --node-caret-boundary: --page-body;">
			<NodeArrayProperty class="body-node-array" path={[...path, 'body']} />
		</div>
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
