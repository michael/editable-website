<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<Node class="ew-paragraph-lg" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='p'
			class={`body-lg ${layout === 2 ? 'text-(--foreground)/50' : ''}`}
			path={[...path, 'content']}
			placeholder='Large Paragraph'
		/>
	</div>
</Node>
