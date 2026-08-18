<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { reveal } from '#app/reveal.js';

	const svedit = get_svedit_context();
	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['descriptive_gallery_item'] = $derived(svedit.session.get(path));
	let gallery = $derived(svedit.session.get(path.slice(0, -2)));
	let layout = $derived(gallery?.layout || 'cards');
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

{#snippet card()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		use:reveal
	>
		<div
			class="overflow-hidden"
			style:aspect-ratio="1/1"
			style:border-radius="var(--image-border-radius)"
		>
			<MediaProperty path={[...path, 'media']} />
		</div>
		<div class="pt-4">
			<TextProperty
				class="body-base {node.href ? 'underline underline-offset-2' : ''}"
				path={[...path, 'title']}
				placeholder="Title"
			/>
			<TextProperty
				class="pt-1 body-sm text-(--muted-foreground)"
				path={[...path, 'description']}
				placeholder="Description"
			/>
		</div>
	</svelte:element>
{/snippet}

{#snippet compact()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="flex items-center gap-5 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) sm:gap-7"
		use:reveal
	>
		<div
			class="aspect-square w-20 shrink-0 overflow-hidden sm:w-24 md:w-20 xl:w-24"
			style:border-radius="var(--image-border-radius)"
		>
			<MediaProperty path={[...path, 'media']} />
		</div>
		<div class="min-w-0">
			<TextProperty
				class="body-base {node.href ? 'underline underline-offset-2' : ''}"
				path={[...path, 'title']}
				placeholder="Title"
			/>
			<TextProperty
				class="pt-2 body-sm text-balance text-(--muted-foreground)"
				path={[...path, 'description']}
				placeholder="Description"
			/>
		</div>
	</svelte:element>
{/snippet}

<Node class="descriptive-gallery-item group" {path}>
	{#if layout === 'compact'}
		{@render compact()}
	{:else}
		{@render card()}
	{/if}
</Node>
