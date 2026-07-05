<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
	let layout = $derived(node.layout || 1);
</script>

{#snippet layout_1()}
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

{#snippet layout_2()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="ew-button flex items-center justify-center rounded-(--button-border-radius) px-4 py-3 text-sm text-(--foreground) bg-(--background) outline-1 outline-(--foreground)/15 focus-visible:outline-(--svedit-editing-stroke) {render_as_link
			? 'hover:bg-(--foreground)/5'
			: ''}"
	>
		<TextProperty path={[...path, 'label']} placeholder="Button" />
	</svelte:element>
{/snippet}

<Node {path}>
	{#if layout === 2}
		{@render layout_2()}
	{:else}
		{@render layout_1()}
	{/if}
</Node>
