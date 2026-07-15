<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import SizableViewbox from './SizableViewbox.svelte';

	const svedit = getContext('svedit');
	const prose = getContext('prose');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);

	// The Prose or ProseGridItem node's layout determines alignment
	let is_centered = $derived(prose?.is_centered);
</script>

{#snippet viewbox(linked = false)}
	<SizableViewbox
		{path}
		class="{is_centered ? 'mx-auto ' : ''}outline-1 outline-transparent {linked
			? 'group-focus-visible:outline-offset-1 group-focus-visible:outline-(--svedit-editing-stroke)'
			: ''}"
		style="border-radius: var(--image-border-radius)"
	>
		<MediaProperty class="supporting-media" path={[...path, 'media']} />
	</SizableViewbox>
{/snippet}

<Node {path}>
	{#if render_as_link}
		<a href={node.href} target={node.target} class="group contents">
			{@render viewbox(true)}
		</a>
	{:else}
		{@render viewbox()}
	{/if}
</Node>
