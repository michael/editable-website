<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="flex items-center justify-center py-4 transition-all duration-150 ease-out"
		class:hover-effect={render_as_link}
	>
		<AnnotatedTextProperty path={[...path, 'label']} placeholder="Label" />
	</svelte:element>
</Node>

<style>
	.hover-effect:hover {
		box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.12);
	}
	.hover-effect:active {
		box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.18);
	}
</style>