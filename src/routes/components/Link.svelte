<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<a
	id={node.id}
	data-node-id={node.id}
	href={node?.href}
	target={node?.target || '_self'}
	class="underline decoration-2 decoration-(--accent) underline-offset-2"
	style="anchor-name: --{path.join('-')};">{content}</a
>
