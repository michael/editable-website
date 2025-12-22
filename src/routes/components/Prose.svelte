<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();

</script>

<!-- Layout 1: Left-aligned -->

<Node class="ew-prose" {path}>
	<NodeArrayProperty path={[...path, 'content']} />
	<!-- {@const layouts = [layout_1, layout_2, layout_3]}
	{@render layouts[layout - 1]()} -->
</Node>

<style>
	:global(.ew-prose) {
		padding-block: var(--prose-padding-block, 1rem);
	}
</style>
