<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<mark
	id={node.id}
	data-node-id={node.id}
	class="bg-transparent text-(--strong-mix) underline decoration-wavy decoration-(--accent) decoration-2 underline-offset-4"
	style="anchor-name: --{path.join('-')};">{content}</mark>