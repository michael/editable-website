<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<mark
	id={node.id}
	data-node-id={node.id}
	class="text-(--strong-mix) [background:linear-gradient(to_bottom,transparent_10%,var(--highlight-background)_10%,var(--highlight-background)_90%,transparent_90%)]"
	style="anchor-name: --{path.join('-')};">{content}</mark>