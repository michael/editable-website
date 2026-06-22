<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
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
		class="nav-item-link block py-2 mx-2 sm:mx-3 hover:underline underline-offset-2 transition-all duration-500 ease-in-out decoration-transparent hover:decoration-(--foreground) hover:text-(--foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
	>
		<AnnotatedTextProperty
			path={[...path, 'label']}
			placeholder="Label"
		/>
	</svelte:element>
{/snippet}

{#snippet layout_2()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block py-2 bg-(--accent) text-(--accent-foreground) rounded-(--button-border-radius) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
		class:hover:opacity-80={render_as_link}
	>
		<AnnotatedTextProperty
			class="px-2 sm:px-3.5"
			path={[...path, 'label']}
			placeholder="Label"
		/>
	</svelte:element>
{/snippet}

{#snippet layout_3()}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block py-2 outline-1 outline-(--foreground)/15 text-(--foreground) rounded-(--button-border-radius) focus-visible:outline-(--svedit-editing-stroke) {render_as_link ? 'hover:bg-(--foreground)/5' : ''}"
	>
		<AnnotatedTextProperty
			class="px-2 sm:px-3.5"
			path={[...path, 'label']}
			placeholder="Label"
		/>
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
