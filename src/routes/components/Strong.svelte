<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<strong class="font-normal text-(--foreground-accent)" id={node.id} data-node-id={node.id}>{content}</strong>
