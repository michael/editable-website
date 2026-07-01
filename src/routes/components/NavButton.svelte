<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
	let layout = $derived(node.layout || 1);
</script>

{#snippet primary()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block rounded-(--button-border-radius) bg-(--accent) py-1 text-(--accent-foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		class:hover:opacity-80={render_as_link}
	>
		<TextProperty class="px-1.5 sm:px-2.5" path={[...path, 'label']} placeholder="Button" />
	</svelte:element>
{/snippet}

{#snippet secondary()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block rounded-(--button-border-radius) py-1 text-(--foreground) outline-1 outline-(--foreground)/15 focus-visible:outline-(--svedit-editing-stroke) {render_as_link
			? 'hover:bg-(--foreground)/5'
			: ''}"
	>
		<TextProperty class="px-1.5 sm:px-2.5" path={[...path, 'label']} placeholder="Button" />
	</svelte:element>
{/snippet}

<Node {path}>
	{#if layout === 2}
		{@render secondary()}
	{:else}
		{@render primary()}
	{/if}
</Node>
