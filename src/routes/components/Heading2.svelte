<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<Node class="ew-heading-2" {path}>
	<div use:reveal>
		<TextProperty
			tag="h2"
			class={`display-3 ${layout === 2 ? 'text-(--muted-foreground)' : ''}`}
			path={[...path, 'content']}
			placeholder="Heading 2"
		/>
	</div>
</Node>
