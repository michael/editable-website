<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<Node class="ew-paragraph-sm" {path}>
	<div
		use:reveal
		class={layout === 2
			? 'text-(--muted-foreground)'
			: '[&_a]:text-(--foreground) [&_strong]:font-normal [&_strong]:text-(--foreground)'}
	>
		<TextProperty
			tag="p"
			class="body-sm"
			path={[...path, 'content']}
			placeholder="Small Paragraph"
		/>
	</div>
</Node>
