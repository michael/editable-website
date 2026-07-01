<script>
	import { getContext } from 'svelte';
	import { TextProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node {path}>
	<div class="block">
		<svelte:element
			this={render_as_link ? 'a' : 'div'}
			href={render_as_link ? node.href : undefined}
			target={render_as_link ? node.target : undefined}
			class="inline-block decoration-transparent underline-offset-2 outline-1 outline-transparent transition-all duration-500 ease-in-out hover:text-(--foreground) hover:underline hover:decoration-(--foreground) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
			class:hover:underline={render_as_link}
		>
			<TextProperty class="inline" path={[...path, 'label']} placeholder="Link label" />
		</svelte:element>
	</div>
</Node>
