<script lang="ts">
	import type { Nodes } from '#lib/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '../svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	const svedit = get_svedit_context();

	let { path }: { path: DocumentPath } = $props();
	let node: Nodes['button'] = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
	let layout = $derived(node.layout || 'primary');
</script>

{#snippet primary()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="ew-button flex min-w-[calc(1lh+24px)] items-center justify-center rounded-(--button-border-radius) bg-(--accent) px-6 py-3 text-sm text-(--accent-foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		class:hover:opacity-80={render_as_link}
	>
		<TextProperty path={[...path, 'label']} placeholder="Button" />
	</svelte:element>
{/snippet}

{#snippet secondary()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="ew-button flex items-center justify-center rounded-(--button-border-radius) bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-1 outline-(--foreground)/15 focus-visible:outline-(--svedit-editing-stroke) {render_as_link
			? 'hover:bg-(--foreground)/5'
			: ''}"
	>
		<TextProperty path={[...path, 'label']} placeholder="Button" />
	</svelte:element>
{/snippet}

{#snippet link()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="ew-button flex items-center justify-center border-b border-(--foreground) py-3 text-sm text-(--foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		class:hover:opacity-70={render_as_link}
	>
		<TextProperty path={[...path, 'label']} placeholder="Button" />
	</svelte:element>
{/snippet}

<Node {path}>
	{#if layout === 'secondary'}
		{@render secondary()}
	{:else if layout === 'link'}
		{@render link()}
	{:else}
		{@render primary()}
	{/if}
</Node>
