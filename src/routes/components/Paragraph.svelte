<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<AnnotatedTextProperty
		tag="p"
		class="py-4 text-balance	"
		path={[...path, 'content']}
		placeholder="Paragraph"
	/>
</Node>
