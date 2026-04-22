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
	class="underline decoration-2 decoration-(--foreground) underline-offset-2 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
	style="anchor-name: --{path.join('-')};">{content}</a
>
