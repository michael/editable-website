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
		class="nav-item-link mx-2 block min-w-max py-2 decoration-transparent underline-offset-2 outline-1 outline-transparent hover:text-(--foreground) hover:underline hover:decoration-(--foreground) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) sm:mx-3"
	>
		<TextProperty path={[...path, 'label']} placeholder="Label" />
	</svelte:element>
{/snippet}

{#snippet layout_2()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block rounded-(--button-border-radius) bg-(--accent) py-2 text-(--accent-foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		class:hover:opacity-80={render_as_link}
	>
		<TextProperty class="px-2 sm:px-3.5" path={[...path, 'label']} placeholder="Label" />
	</svelte:element>
{/snippet}

{#snippet layout_3()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block rounded-(--button-border-radius) py-2 text-(--foreground) outline-1 outline-(--foreground)/15 focus-visible:outline-(--svedit-editing-stroke) {render_as_link
			? 'hover:bg-(--foreground)/5'
			: ''}"
	>
		<TextProperty class="px-2 sm:px-3.5" path={[...path, 'label']} placeholder="Label" />
	</svelte:element>
{/snippet}

<Node {path}>
	{#if layout === 2}
		{@render layout_2()}
	{:else if layout === 3}
		{@render layout_3()}
	{:else}
		{@render layout_1()}
	{/if}
</Node>
