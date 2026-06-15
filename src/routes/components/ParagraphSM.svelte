<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<Node class="ew-paragraph-sm" {path}>
	<div use:reveal class={layout === 2 ? 'text-(--foreground-color)/50' : '[&_a]:text-(--foreground) [&_strong]:text-(--foreground) [&_strong]:font-normal'}>
		<AnnotatedTextProperty
			tag='p'
			class="body-sm"
			path={[...path, 'content']}
			placeholder='Small Paragraph'
		/>
	</div>
</Node>
