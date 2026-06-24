<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let item_count = $derived(node.items?.nodes.length || 0);
	let grid_cols_class = $derived(
		item_count <= 1 ? 'lg:grid-cols-1' :
		item_count === 2 ? 'lg:grid-cols-2' :
		item_count === 3 ? 'lg:grid-cols-3' :
		'lg:grid-cols-3'
	);
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="{TW_PAGE_PADDING_X} py-10 sm:py-14 md:py-16 lg:py-28">
			<NodeArrayProperty
				class="grid grid-cols-1 {grid_cols_class} gap-x-5 sm:gap-x-7 gap-y-8 lg:gap-y-7 [--row:1]"
				path={[...path, 'items']}
			/>
		</div>
	</div>
</Node>
