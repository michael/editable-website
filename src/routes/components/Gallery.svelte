<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');
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
	<div class="bg-(--background) text-(--foreground) {colorset_class}">
		<div class="{TW_LIMITER} w-full ">
			<div>
				<div class="{TW_PAGE_PADDING_X} py-2.5 sm:py-3.5 md:py-5 lg:py-7">
					<NodeArrayProperty class="flex flex-col gap-5 sm:gap-7 md:gap-10 lg:gap-14 {grid_layout}" path={[...path, 'gallery_items']} />
				</div>
			</div>
		</div>
	</div>
</Node>
