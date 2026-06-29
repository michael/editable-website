<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<Node class="ew-heading-1" {path}>
	<div use:reveal>
		<TextProperty
			tag="h1"
			class={`display-1 ${layout === 2 ? 'text-(--foreground)/50' : ''}`}
			path={[...path, 'content']}
			placeholder="Heading 1"
		/>
	</div>
</Node>
