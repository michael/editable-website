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
	class="rounded-[min(var(--button-border-radius),0.25em)] bg-(--foreground)/8 box-decoration-clone px-[0.25em] py-[0.125em] font-mono text-sm text-[0.9em] subpixel-antialiased"
	>{content}</code
>
