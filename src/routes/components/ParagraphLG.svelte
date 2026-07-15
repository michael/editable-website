<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'default');
</script>

<Node class="ew-paragraph-lg" {path}>
	<div use:reveal>
		<TextProperty
			tag="p"
			class={`body-lg ${layout === 'muted' ? 'text-(--muted-foreground)' : ''}`}
			path={[...path, 'content']}
			placeholder="Large Paragraph"
		/>
	</div>
</Node>
