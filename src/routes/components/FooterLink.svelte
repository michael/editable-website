<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<svelte:element
		this={svedit.editable ? 'div' : 'a'}
		href={svedit.editable ? undefined : node.href}
		target={node?.target || '_self'}
	>
		<AnnotatedTextProperty class="px-2 py-1" path={[...path, 'label']} placeholder="Label" />
	</svelte:element>
</Node>
