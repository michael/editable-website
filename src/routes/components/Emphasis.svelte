<script lang="ts">
	import type { Nodes } from '#lib/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '../svedit_context.js';
	const svedit = get_svedit_context();
	let { path, content }: { path: DocumentPath; content: string } = $props();
	let node: Nodes['emphasis'] = $derived(svedit.session.get(path));
</script>

<em id={node.id} data-node-id={node.id}>{content}</em>
