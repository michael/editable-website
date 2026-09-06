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
		class="inline-flex min-h-9 min-w-9 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) pointer-coarse:min-h-11 pointer-coarse:min-w-11"
		href={render_as_link ? node.href : undefined}
		target={render_as_link && node.target !== '_self' ? node.target : undefined}
	>
		<div
			class="h-8"
			style:aspect-ratio={media_node.width && media_node.height
				? `${media_node.width} / ${media_node.height}`
				: '1 / 1'}
		>
			<MediaProperty path={[...path, 'media']} />
		</div>
	</svelte:element>
</Node>
