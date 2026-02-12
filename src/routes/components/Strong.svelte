<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<strong class="font-semibold" id={node.id} data-node-id={node.id}>{content}</strong>

<style>
	/*:global(h1 strong,h2 strong,h3 strong) {
		font-weight: inherit;
	}*/
</style>
