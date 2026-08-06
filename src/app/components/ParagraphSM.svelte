<script lang="ts">
	import type { Nodes } from '#app/editable_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '#app/reveal.js';

	const svedit = get_svedit_context();
	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['paragraph_sm'] = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'regular');
</script>

<Node class="ew-paragraph-sm" {path}>
	<div
		use:reveal
		class={layout === 'muted'
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
