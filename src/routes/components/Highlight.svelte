<script>
	import { getContext } from 'svelte';
	import { serialize_path } from 'svedit';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<span
	id={node.id}
	data-node-id={node.id}
	class="bg-(--accent) text-(--accent-foreground) no-underline"
	style="anchor-name: --{serialize_path(path)};">{content}</span>


