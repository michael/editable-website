<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<mark id={node.id} data-node-id={node.id} style="anchor-name: --{path.join('-')};">{content}</mark>

<style>
	mark {
		background: yellow;
	}
</style>
