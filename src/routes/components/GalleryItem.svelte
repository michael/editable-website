<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node class="gallery-item" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="image-wrapper block overflow-hidden outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		style:border-radius="var(--image-border-radius)"
		use:reveal
	>
		<MediaProperty class="image-property" path={[...path, 'media']} />
	</svelte:element>
</Node>
