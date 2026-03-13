<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<span
	id={node.id}
	data-node-id={node.id}
	class="bg-(--accent) text-(--accent-foreground) no-underline px-2"
	style="anchor-name: --{path.join('-')};">{content}</span>
