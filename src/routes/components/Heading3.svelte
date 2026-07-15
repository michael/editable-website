<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'default');
</script>

<Node class="ew-heading-3" {path}>
	<div use:reveal>
		<TextProperty
			tag="h3"
			class={`display-4 ${layout === 'muted' ? 'text-(--muted-foreground)' : ''}`}
			path={[...path, 'content']}
			placeholder="Heading 3"
		/>
	</div>
</Node>
