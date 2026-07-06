<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	let { path, mark: section = null } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
	let grid_layout = $derived.by(get_grid_layout);

	function get_grid_layout() {
		const layouts = {
			1: `
	    	[--row:1]
				grid grid-cols-6

				*:col-span-6 *:**:[.image-wrapper]:aspect-[2/1]
				[&>:nth-child(6n+2_of_[data-type=node])]:col-span-3 [&>:nth-child(6n+2_of_[data-type=node])]:**:[.image-wrapper]:aspect-square [&>:nth-child(6n+3_of_[data-type=node])]:col-span-3
				[&>:nth-child(6n+3_of_[data-type=node])]:**:[.image-wrapper]:aspect-square [&>:nth-child(6n+4_of_[data-type=node])]:col-span-2 [&>:nth-child(6n+4_of_[data-type=node])]:**:[.image-wrapper]:aspect-[4/6] [&>:nth-child(6n+5_of_[data-type=node])]:col-span-2 [&>:nth-child(6n+5_of_[data-type=node])]:**:[.image-wrapper]:aspect-[4/6] [&>:nth-child(6n+6_of_[data-type=node])]:col-span-2 [&>:nth-child(6n+6_of_[data-type=node])]:**:[.image-wrapper]:aspect-[4/6]
   		`,
			2: `
	     	[--row:1]
				grid grid-cols-3
				**:[.image-wrapper]:aspect-[3/4]
   		`,
			3: `
	     	[--row:1]
				grid grid-cols-2 md:grid-cols-4
				**:[.image-wrapper]:aspect-square
   		`,
			4: `
	     	[--row:1]
				grid grid-cols-1 md:grid-cols-2
				**:[.image-wrapper]:aspect-[2/1]
   		`,
			5: `
	     	[--row:1]
				grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
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

<Node {path}>
	<div class="bg-(--background) text-(--foreground)">
		<div class="{TW_LIMITER} w-full">
			<div
				class={[
					TW_PAGE_PADDING_X,
					padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
					padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
				]}
			>
				<NodeArrayProperty
					class="flex flex-col gap-5 sm:gap-7 {grid_layout}"
					path={[...path, 'gallery_items']}
				/>
			</div>
		</div>
	</div>
</Node>
