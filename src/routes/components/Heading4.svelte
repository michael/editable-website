<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<Node class="ew-heading-4" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='h3'
			class={`display-4 ${layout === 2 ? 'text-(--foreground)/50' : ''}`}
			path={[...path, 'content']}
			placeholder='Heading 4'
		/>
	</div>
</Node>
