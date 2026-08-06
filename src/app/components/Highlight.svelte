<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { serialize_path } from 'svedit';
	const svedit = get_svedit_context();
	let { path, content }: { path: DocumentPath; content: string } = $props();
	let node: Nodes['highlight'] = $derived(svedit.session.get(path));
</script>

<span
	id={node.id}
	data-node-id={node.id}
	class="bg-(--accent) text-(--accent-foreground) no-underline"
	style="anchor-name: --{serialize_path(path)};">{content}</span
>
