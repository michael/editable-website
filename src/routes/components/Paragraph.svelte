<script lang="ts">
	import { Node, TextProperty } from 'svedit';
	import type { DocumentPath } from 'svedit';
	import type { Nodes } from '#lib/document_schema.js';
	import { get_svedit_context } from '../svedit_context.js';
	import { reveal } from '../reveal.js';

	const svedit = get_svedit_context();
	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['paragraph'] = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'regular');
</script>

<Node {path}>
	<div use:reveal>
		<TextProperty
			tag="p"
			class={`body-base ${layout === 'muted' ? 'text-(--muted-foreground)' : ''}`}
			path={[...path, 'content']}
			placeholder="Paragraph"
		/>
	</div>
</Node>
