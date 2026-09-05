<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
	const svedit = get_svedit_context();
	let { path, content }: { path: DocumentPath; content: string } = $props();
	let node: Nodes['code'] = $derived(svedit.session.get(path));
</script>

<code
	id={node.id}
	data-node-id={node.id}
	class="rounded-(--button-border-radius) bg-(--foreground)/8 px-1 py-0.5 font-mono text-sm text-[0.9em] subpixel-antialiased"
	>{content}</code
>
