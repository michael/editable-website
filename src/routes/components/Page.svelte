<script>
	import { getContext } from 'svelte';
	import { TextProperty, Node, NodeArrayProperty } from 'svedit';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import MediaProperty from './MediaProperty.svelte';
	import { get_head_metadata, get_media_asset_url } from '$lib/page_metadata.js';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
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
	<div class="page flex min-h-screen flex-col [--row:0]">
		<div class="bg-(--background) text-(--foreground)">
			<Nav path={[...path, 'nav']} />
		</div>
		<div class="grow" style="anchor-name: --page-body; --node-caret-boundary: --page-body;">
			<NodeArrayProperty class="body-node-array" path={[...path, 'body']} />
		</div>
		<div class="bg-(--background) text-(--foreground)">
			<Footer path={[...path, 'footer']} />
		</div>
		{#if svedit.editable}
			<div class="border-t border-(--border) bg-(--muted) text-(--foreground)">
				<div class={TW_LIMITER}>
					<div class="{TW_PAGE_PADDING_X} flex flex-col gap-6 py-12 md:py-16">
						<!-- <div
							contenteditable="false"
							class="max-w-2xl text-left body-base text-(--muted-foreground)"
						>
							How should this page be displayed in a search result?
						</div> -->
						<div class="grid w-full max-w-2xl grid-cols-[8rem_minmax(0,1fr)] items-center gap-6">
							<div class="aspect-square w-32 border border-(--border)">
								<MediaProperty path={[...path, 'image']} />
							</div>
							<div class="flex flex-col justify-center gap-4">
								<TextProperty
									path={[...path, 'title']}
									placeholder="Page title"
									class="block display-5"
								/>
								<TextProperty
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
