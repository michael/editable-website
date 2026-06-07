<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';

	const prose = getContext('prose');
	let { path } = $props();
	// The Prose or ProseGridItem node's layout determines alignment
	let is_centered = $derived(prose.is_centered);
</script>

<Node class="ew-button-group" {path}>
	<NodeArrayProperty
		class="[--row:1] button-group-buttons flex flex-wrap items-center gap-4{is_centered ? ' w-fit mx-auto' : ''}"
		path={[...path, 'buttons']}
	/>
</Node>
