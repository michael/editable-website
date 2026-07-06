<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	let { path, mark: section = null } = $props();
	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
</script>

<Node class="ew-descriptive-gallery" {path}>
	<div class="{TW_LIMITER} w-full">
		<div
			class={[
				TW_PAGE_PADDING_X,
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<NodeArrayProperty
				class={layout === 2
					? 'grid grid-cols-1 gap-x-10 gap-y-8 [--row:1] md:grid-cols-2 md:gap-y-7 lg:gap-x-14'
					: 'grid grid-cols-1 gap-x-5 gap-y-8 [--row:1] sm:gap-x-7 md:grid-cols-2 md:gap-y-7 xl:grid-cols-3'}
				path={[...path, 'items']}
			/>
		</div>
	</div>
</Node>
