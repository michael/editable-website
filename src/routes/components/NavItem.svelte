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
		class="nav-item-link flex items-center justify-center w-full mx-3 sm:mx-4"
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
		class="flex items-center justify-center w-full h-full bg-(--accent) text-(--accent-foreground) uppercase font-medium rounded-(--button-border-radius)"
		class:hover:opacity-80={render_as_link}
	>
		<AnnotatedTextProperty
			class="px-3 sm:px-4"
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

<style>
	.nav-item-link {
		background: linear-gradient(to left, var(--accent), var(--accent));
		background-size: 0 2px;
		background-position: 0 100%, 100% 100%;
		background-repeat: no-repeat;
		transition: background-size cubic-bezier(0.8, 0, 0.2, 1) 0.4s;
	}

	.nav-item-link:hover {
		background-size: 100% 2px;
	}
</style>
