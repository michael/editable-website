<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
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
		class="ew-button inline-flex min-h-11 max-w-full min-w-11 items-center justify-center rounded-(--button-border-radius) border border-transparent bg-(--accent) px-5 py-2 text-center text-base leading-6 font-medium wrap-anywhere text-(--accent-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) {render_as_link
			? 'cursor-pointer hover:bg-[color-mix(in_srgb,var(--accent),var(--accent-foreground)_20%)] active:bg-[color-mix(in_srgb,var(--accent),var(--accent-foreground)_30%)]'
			: ''}"
	>
		<TextProperty path={[...path, 'label']} placeholder="Button" />
	</svelte:element>
{/snippet}

{#snippet secondary()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="ew-button inline-flex min-h-11 max-w-full min-w-11 items-center justify-center rounded-(--button-border-radius) border border-(--stroke) bg-transparent px-5 py-2 text-center text-base leading-6 font-medium wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) {render_as_link
			? 'cursor-pointer hover:bg-(--muted) active:bg-(--foreground)/10'
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
		class="ew-button inline-flex min-h-11 max-w-full min-w-6 items-center justify-start py-2.5 text-start text-base leading-6 font-medium wrap-anywhere text-(--foreground) underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) pointer-coarse:min-w-11 {render_as_link
			? 'hover:decoration-2 active:decoration-2'
			: ''}"
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
