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

<Node {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="group contents"
	>
		<SizableViewbox
			{path}
			class="{is_centered
				? 'mx-auto '
				: ''}outline-1 outline-transparent group-focus-visible:outline-offset-1 group-focus-visible:outline-(--svedit-editing-stroke)"
			style="border-radius: var(--image-border-radius)"
		>
			<MediaProperty class="supporting-media" path={[...path, 'media']} />
		</SizableViewbox>
	</svelte:element>
</Node>
