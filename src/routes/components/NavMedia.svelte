<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node class="nav-media flex items-center shrink-0 min-w-10" {path}>
	<svelte:element
		class="h-7 block min-w-0 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
		style:aspect-ratio={media_node.width && media_node.height ? `${media_node.width} / ${media_node.height}` : '1 / 1'}
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
	>
		<MediaProperty path={[...path, 'media']} />
	</svelte:element>
</Node>
