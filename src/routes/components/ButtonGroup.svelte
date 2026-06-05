<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let prose_path = $derived(path.slice(0, -2));
	let prose_node = $derived(svedit.session.get(prose_path));
	let is_centered = $derived(prose_node?.type === 'prose' && prose_node?.layout === 2);
</script>

<Node class="ew-button-group" {path}>
	<NodeArrayProperty
		class="[--row:1] button-group-buttons flex flex-wrap items-center gap-4{is_centered ? ' w-fit mx-auto' : ''}"
		path={[...path, 'buttons']}
	/>
</Node>
