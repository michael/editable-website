<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<code
	id={node.id}
	data-node-id={node.id}
	class="rounded bg-(--foreground)/8 px-1 py-0.5 font-mono text-sm subpixel-antialiased text-[0.9em]">{content}</code
>
