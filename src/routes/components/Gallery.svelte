<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X, TW_BLOCK_PADDING_Y } from '../tailwind_theme.js';
	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let has_intro = $derived(node.intro && node.intro.length > 0);
	let has_outro = $derived(node.outro && node.outro.length > 0);
	let grid_layout = $derived.by(get_grid_layout);


	function get_grid_layout() {
		const layouts = {
			1: `
	    	[--layout-orientation:horizontal]
				grid grid-cols-6

				*:col-span-6 *:**:[.image-wrapper]:aspect-[2/1]
				*:nth-[6n+2]:col-span-3 *:nth-[6n+2]:**:[.image-wrapper]:aspect-square *:nth-[6n+3]:col-span-3
				*:nth-[6n+3]:**:[.image-wrapper]:aspect-square *:nth-[6n+4]:col-span-2 *:nth-[6n+4]:**:[.image-wrapper]:aspect-[4/6] *:nth-[6n+5]:col-span-2 *:nth-[6n+5]:**:[.image-wrapper]:aspect-[4/6] *:nth-[6n+6]:col-span-2 *:nth-[6n+6]:**:[.image-wrapper]:aspect-[4/6]
   		`,
			2: `
	     	[--layout-orientation:horizontal]
				grid grid-cols-3
				**:[.image-wrapper]:aspect-[3/4]
   		`,
			3: `
	     	[--layout-orientation:horizontal]
				grid grid-cols-2 md:grid-cols-4
				**:[.image-wrapper]:aspect-square
   		`,
			4: `
	     	[--layout-orientation:horizontal]
				grid grid-cols-1 md:grid-cols-2
				**:[.image-wrapper]:aspect-[2/1]
   		`
		};

		return layouts[node.layout ?? 2];
	}
	const heading_spacing = `
		[&>div:has(h1)~div>h1]:pt-8
		[&>div:has(h2)~div>h2]:pt-6
		[&>div:has(h3)~div>h3]:pt-4
	`;
</script>

{#snippet intro()}
	{@const intro_padding = has_intro ? 'py-5 sm:py-7 md:py-10 lg:py-14' : 'py-2.5 sm:py-3.5 md:py-5 lg:py-7'}
	<div class="{TW_PAGE_PADDING_X} max-w-4xl {intro_padding}">
		<NodeArrayProperty class="ew-intro space-y-8 {heading_spacing}" path={[...path, 'intro']} />
	</div>
{/snippet}

{#snippet outro()}
		{@const outro_padding = has_outro ? 'py-5 sm:py-7 md:py-10 lg:py-14' : 'py-2.5 sm:py-3.5 md:py-5 lg:py-7'}
		<div class="{TW_PAGE_PADDING_X} max-w-4xl {outro_padding}">
			<NodeArrayProperty class="ew-outro space-y-8 {heading_spacing}" path={[...path, 'outro']} />
		</div>
{/snippet}

<Node {path}>
	<div class="border-b border-(--foreground-subtle)">
		<div class="{TW_LIMITER} w-full">
			<div class="border-l border-r border-(--foreground-subtle)">
				{@render intro()}
				<div class="px-5 sm:px-7 md:px-10 lg:px-14">
					<NodeArrayProperty class="gap-5 sm:gap-7 md:gap-10 lg:gap-14 {grid_layout}" path={[...path, 'gallery_items']} />
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
