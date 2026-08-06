<script lang="ts">
	import type { Nodes } from '#app/editable_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	const svedit = get_svedit_context();

	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['nav_link'] = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="nav-link block min-w-max py-2 decoration-transparent underline-offset-2 outline-1 outline-transparent hover:text-(--foreground) hover:underline hover:decoration-(--foreground) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
	>
		<TextProperty path={[...path, 'label']} placeholder="Link" />
	</svelte:element>
</Node>
