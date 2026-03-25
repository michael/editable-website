<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X, TW_BLOCK_PADDING_Y } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);

	function get_grid_class() {
		return layout === 2
			? 'grid grid-cols-1 gap-8 md:grid-cols-3'
			: 'grid grid-cols-1 gap-8 md:grid-cols-2';
	}
</script>

<Node class="ew-columns bg-(--background) text-(--foreground)" {path}>
	<div class={TW_LIMITER}>
		<div class={TW_BLOCK_PADDING_Y}>
			<div class={TW_PAGE_PADDING_X}>
				<NodeArrayProperty
					class="columns-grid {get_grid_class()} [--row:0]"
					path={[...path, 'columns']}
				/>
			</div>
		</div>
	</div>
</Node>
