<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<mark
	id={node.id}
	data-node-id={node.id}
	class="bg-transparent text-inherit underline decoration-solid decoration-(--accent) underline-offset-4"
	style="anchor-name: --{path.join('-')}; text-decoration-thickness: var(--highlight-thickness, 4px);">{content}</mark>


<style>
	:global(h1) {
		--highlight-thickness: 4px;
	}

	:global(h2) {
		--highlight-thickness: 3px;
	}

	:global(h3) {
		--highlight-thickness: 2px;
	}
</style>
