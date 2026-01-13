<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER } from '../tailwind_theme.js';
	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let grid_layout = $derived.by(get_grid_layout);

	function get_grid_layout() {
		const layouts = {
			1: `
	    	[--layout-orientation:horizontal]
				grid grid-cols-6
				*:p-5 *:sm:p-7 *:md:p-10 *:lg:p-14
				*:col-span-6 *:**:[.image-wrapper]:aspect-[2/1]
				*:nth-[6n+2]:col-span-3 *:nth-[6n+2]:**:[.image-wrapper]:aspect-square *:nth-[6n+3]:col-span-3
				*:nth-[6n+3]:**:[.image-wrapper]:aspect-square *:nth-[6n+4]:col-span-2 *:nth-[6n+4]:**:[.image-wrapper]:aspect-[4/6] *:nth-[6n+5]:col-span-2 *:nth-[6n+5]:**:[.image-wrapper]:aspect-[4/6] *:nth-[6n+6]:col-span-2 *:nth-[6n+6]:**:[.image-wrapper]:aspect-[4/6]
   		`,
			2: `
	     	[--layout-orientation:horizontal]
				grid grid-cols-3
				*:p-5 *:sm:p-7 *:md:p-10 *:lg:p-14
				**:[.image-wrapper]:aspect-[3/4]
   		`,
			3: `
	     	[--layout-orientation:horizontal]
				grid grid-cols-2 md:grid-cols-4
				*:p-5 *:sm:p-7 *:md:p-10 *:lg:p-14
				**:[.image-wrapper]:aspect-square
   		`,
			4: `
	     	[--layout-orientation:horizontal]
				grid grid-cols-2
				*:p-5 *:sm:p-7 *:md:p-10 *:lg:p-14
				**:[.image-wrapper]:aspect-[2/1]
   		`
		};

		return layouts[node.layout ?? 2];
	}
</script>

<Node {path}>
	<div class="border-t border-gray-400">
		<div class="{TW_LIMITER} w-full">
			<div class="-mb-px max-xl:-mr-px xl:border-l border-gray-400">
				<NodeArrayProperty class="{grid_layout} *:border-gray-400 *:border-r *:border-b" path={[...path, 'gallery_items']} />
			</div>
		</div>
	</div>
</Node>
