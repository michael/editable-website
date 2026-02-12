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
		class="flex items-center justify-center w-full h-full"
		class:hover:text-(--foreground)={render_as_link}
	>
		<AnnotatedTextProperty
			class="px-3 py-1 sm:px-4"
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
		class="flex items-center justify-center w-full h-full bg-(--accent) text-(--foreground) ml-2 rounded-(--border-radius)"
		class:hover:opacity-80={render_as_link}
	>
		<AnnotatedTextProperty
			class="px-3 py-1 sm:px-4"
			path={[...path, 'label']}
			placeholder="Label"
		/>
	</svelte:element>
{/snippet}

<Node {path}>
	{#if layout === 2}
		{@render layout_2()}
	{:else}
		{@render layout_1()}
	{/if}
</Node>
