<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<Node class="ew-paragraph-xl" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='p'
			class={`body-xl ${layout === 2 ? 'text-(--foreground-color)/50' : ''}`}
			path={[...path, 'content']}
			placeholder='Extra large paragraph'
		/>
	</div>
</Node>
