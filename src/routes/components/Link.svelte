<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<a
	data-node-id={node.id}
	href={node?.href}
	target={node?.target || '_self'}
	class="underline"
	style="anchor-name: --{path.join('-')};">{content}</a
>
