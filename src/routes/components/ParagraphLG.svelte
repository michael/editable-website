<script lang="ts">
	import type { Nodes } from '#lib/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '../svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = get_svedit_context();
	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['paragraph_lg'] = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'regular');
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
