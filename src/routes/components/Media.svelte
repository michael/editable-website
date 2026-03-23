<script>
	import { getContext } from 'svelte';
	import Image from './Image.svelte';
	import Video from './Video.svelte';

	const svedit = getContext('svedit');

	/** @type {{ path: any[], mask?: boolean }} */
	let { path, mask = false } = $props();
	let node = $derived(svedit.session.get(path));
</script>

{#if node.type === 'video'}
	<Video {path} />
{:else}
	<Image {path} {mask} />
{/if}