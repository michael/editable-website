<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node class="link-collection-item group" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
		use:reveal
	>
		<div class="overflow-hidden" style:aspect-ratio="4/3" style:border-radius="var(--image-border-radius)">
			<MediaProperty path={[...path, 'media']} />
		</div>
		<div class="pt-4">
			<AnnotatedTextProperty class="text-xs md:text-sm uppercase tracking-widest text-(--foreground) opacity-60 mb-2" path={[...path, 'preline']} placeholder="Preline" />
			<div class="pt-1">
				<AnnotatedTextProperty class="{!svedit.editable ? 'title-underline' : ''} inline font-serif text-(--foreground) text-2xl lg:text-3xl text-balance" path={[...path, 'title']} placeholder="Title" />
			</div>
			<AnnotatedTextProperty class="text-balance pt-2" path={[...path, 'description']} placeholder="Description" />
		</div>
	</svelte:element>
</Node>

<style>
	:global(.title-underline) {
		display: inline;
		background: linear-gradient(to left, var(--foreground), var(--foreground));
		background-size: 0 2px;
		background-position: 0 100%, 100% 100%;
		background-repeat: no-repeat;
		transition: background-size cubic-bezier(0.8, 0, 0.2, 1) 0.4s;
	}

	:global(.group:hover .title-underline) {
		background-size: 100% 2px;
	}


</style>
