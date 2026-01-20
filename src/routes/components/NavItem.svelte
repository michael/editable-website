<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<svelte:element
		this={svedit.editable ? 'div' : 'a'}
		target={node?.target || '_self'}
		href={svedit.editable ? undefined : node.href}
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
