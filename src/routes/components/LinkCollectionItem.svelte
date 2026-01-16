<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node class="link-collection-item" {path}>
	<svelte:element
		this={svedit.editable ? 'div' : 'a'}
		href={svedit.editable ? undefined : node.href}
		class="block p-6"
	>
		<AnnotatedTextProperty class="text-sm text-gray-500" path={[...path, 'preline']} />
		<AnnotatedTextProperty class="text-lg font-semibold" path={[...path, 'title']} />
		<AnnotatedTextProperty class="text-gray-600" path={[...path, 'description']} />
	</svelte:element>
</Node>