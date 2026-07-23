<script lang="ts">
	import type { Nodes } from '$lib/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '../svedit_context.js';
	const svedit = get_svedit_context();
	let { path, content }: { path: DocumentPath; content: string } = $props();
	let node: Nodes['strong'] = $derived(svedit.session.get(path));
</script>

<strong class="font-semibold" id={node.id} data-node-id={node.id}>{content}</strong>
