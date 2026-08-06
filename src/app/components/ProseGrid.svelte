<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '#app/tailwind_theme.js';

	const svedit = get_svedit_context();
	let { path, mark: section = null } = $props();
	let node: Nodes['prose_grid'] = $derived(svedit.session.get(path));
	let item_count = $derived(node.items?.nodes.length || 0);
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
	let grid_cols_class = $derived(
		item_count <= 1
			? 'lg:grid-cols-1'
			: item_count === 2
				? 'lg:grid-cols-2'
				: item_count === 3
					? 'lg:grid-cols-3'
					: 'lg:grid-cols-3'
	);
</script>

<Node {path}>
	<div class={TW_LIMITER}>
		<div
			class={[
				TW_PAGE_PADDING_X,
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<NodeArrayProperty
				class="grid grid-cols-1 {grid_cols_class} gap-x-5 gap-y-8 [--row:1] sm:gap-x-7 lg:gap-y-7"
				path={[...path, 'items']}
			/>
		</div>
	</div>
</Node>
