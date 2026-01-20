<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
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
		class="nav-item"
	>
		<AnnotatedTextProperty
			class="px-3 py-1 sm:px-4"
			path={[...path, 'label']}
			placeholder="Label"
		/>
	</svelte:element>
</Node>

<style>
	.nav-item {
		display: block;
		text-decoration: none;
	}
</style>
