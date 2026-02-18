<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');
	let has_intro = $derived(node.intro && node.intro.length > 0);
	let has_outro = $derived(node.outro && node.outro.length > 0);

	const heading_spacing = `
		[&>div:has(h1)~div>h1]:pt-8
		[&>div:has(h2)~div>h2]:pt-6
		[&>div:has(h3)~div>h3]:pt-4
	`;
</script>

{#snippet intro()}
	{@const intro_padding = has_intro ? 'pt-10 sm:pt-14 md:pt-16 lg:pt-20 pb-2 sm:pb-3 md:pb-5 lg:pb-7' : 'pt-10 sm:pt-14 md:pt-16 lg:pt-20'}
	<div class="{TW_PAGE_PADDING_X} max-w-4xl lg:text-lg {intro_padding}">
		<NodeArrayProperty class="ew-intro space-y-5 md:space-y-8 {heading_spacing}" path={[...path, 'intro']} />
	</div>
{/snippet}

{#snippet outro()}
	{@const outro_padding = has_outro ? 'pt-5 sm:pt-7 md:pt-10 lg:pt-14 pb-20 sm:pb-24 md:pb-28 lg:pb-32' : 'pb-20 sm:pb-24 md:pb-28 lg:pb-32'}
	<div class="{TW_PAGE_PADDING_X} max-w-4xl lg:text-lg {outro_padding}">
		<NodeArrayProperty class="ew-intro space-y-5 md:space-y-8 {heading_spacing}" path={[...path, 'outro']} />
	</div>
{/snippet}

<Node {path}>
	<div class="border-b border-(--border-color) bg-(--background) text-(--foreground) {colorset_class}">
		<div class="{TW_LIMITER} w-full">
			<div class="border-l border-r border-(--border-color)">
				{@render intro()}
				<div class="{TW_PAGE_PADDING_X} py-8 sm:py-10 md:py-12 lg:py-14">
					<NodeArrayProperty
						class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16 md:gap-10 lg:gap-14 [--layout-orientation:horizontal]"
						path={[...path, 'link_collection_items']}
					/>
				</div>
				{@render outro()}
			</div>
		</div>
	</div>
</Node>


<style>
	/* HACK: When intro or outro is empty, prevent the empty node placeholder from taking up vertical space */
	:global(.ew-intro .node.empty-node-array, .ew-outro .node.empty-node-array) {
		min-height: 0 !important;
	}
</style>
