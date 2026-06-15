<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, Node } from 'svedit';
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
			class="inline-block py-1.5 hover:underline underline-offset-2 transition-all duration-500 ease-in-out decoration-transparent hover:decoration-(--foreground) hover:text-(--foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
			class:hover:underline={render_as_link}
		>
			<AnnotatedTextProperty class="inline" path={[...path, 'label']} placeholder="Label" />
		</svelte:element>
	</div>
</Node>
