<script lang="ts">
	import Image from './Image.svelte';
	import Video from './Video.svelte';

	import type { PreviewMediaNode } from '#app/page_metadata.js';

	// Accepts both document media nodes (Nodes['image'] / Nodes['video']) and
	// derived preview nodes — anything with the media display shape.
	let { node, editable = false }: { node: PreviewMediaNode; editable?: boolean } = $props();
</script>

{#if node?.type === 'video'}
	<Video {node} {editable} />
{:else if node}
	<Image {node} />
{/if}
