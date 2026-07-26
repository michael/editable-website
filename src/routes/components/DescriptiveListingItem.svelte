<script lang="ts">
	import type { Nodes } from '#lib/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '../svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = get_svedit_context();
	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['descriptive_listing_item'] = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
	let display_meta = $derived(svedit.editable || !!node.meta?.content?.trim());
</script>

<Node class="descriptive-listing-item group border-b border-(--border)" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block py-4 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) sm:py-2 md:py-3"
		use:reveal
	>
		<div class="flex items-center justify-between gap-6">
			<div class="min-w-2/3 flex-1">
				<TextProperty
					class="body-base {node.href ? 'underline underline-offset-2' : ''}"
					path={[...path, 'title']}
					placeholder="Title"
				/>
				<TextProperty
					class="pt-1 body-base text-balance text-(--muted-foreground)"
					path={[...path, 'description']}
					placeholder="Description"
				/>
			</div>

			{#if display_meta}
				<div class="min-w-0 self-center text-right">
					<TextProperty
						class="pt-1 body-base text-(--muted-foreground)"
						path={[...path, 'meta']}
						placeholder="Meta"
					/>
				</div>
			{/if}
		</div>
	</svelte:element>
</Node>
