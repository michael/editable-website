<script lang="ts">
	import type { Nodes } from '#lib/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '../svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = get_svedit_context();
	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['heading_2'] = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'default');
</script>

<Node class="ew-heading-2" {path}>
	<div use:reveal>
		<TextProperty
			tag="h2"
			class={`display-3 ${layout === 'muted' ? 'text-(--muted-foreground)' : ''}`}
			path={[...path, 'content']}
			placeholder="Heading 2"
		/>
	</div>
</Node>
