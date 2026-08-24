<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = get_svedit_context();

	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['nav_media'] = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node class="nav-media flex min-w-10 shrink-0 items-center" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		class="block h-7 min-w-0 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--editing)"
		style:aspect-ratio={media_node.width && media_node.height
			? `${media_node.width} / ${media_node.height}`
			: '1 / 1'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
	>
		<MediaProperty path={[...path, 'media']} />
	</svelte:element>
</Node>
