<script>
	import Image from './Image.svelte';
	import Video from './Video.svelte';

	/** @type {{ node: any, editable?: boolean }} */
	let { node, editable = false } = $props();
</script>

{#if node?.type === 'video'}
	<Video {node} {editable} />
{:else if node}
	<Image {node} />
{/if}