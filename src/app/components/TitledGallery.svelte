<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node, NodeArrayProperty } from 'svedit';

	let { path, mark: section = null } = $props();
	const svedit = get_svedit_context();
	let node: Nodes['titled_gallery'] = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'cards');
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
</script>

<Node class="ew-titled-gallery" {path}>
	<div class="mx-auto max-w-7xl w-full">
		<div
			class={[
				'px-5 sm:px-7',
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<NodeArrayProperty
				class={layout === 'compact'
					? 'grid grid-cols-1 gap-x-10 gap-y-8 [--row:1] md:grid-cols-2 md:gap-y-7 lg:gap-x-14'
					: 'grid grid-cols-1 gap-x-5 gap-y-8 [--row:1] sm:gap-x-7 md:grid-cols-2 md:gap-y-7 xl:grid-cols-3'}
				path={[...path, 'items']}
			/>
		</div>
	</div>
</Node>
