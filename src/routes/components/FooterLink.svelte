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
		class="block py-1"
		class:hover:underline={render_as_link}
	>
		<AnnotatedTextProperty path={[...path, 'label']} placeholder="Label" />
	</svelte:element>
</Node>
