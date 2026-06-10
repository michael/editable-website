<script>
	import { Node } from 'svedit';
	import Small from './Small.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-note" {path}>
	<div use:reveal class="text-[color-mix(in_oklch,var(--foreground)_40%,transparent)]">
		<Small
			path={[...path, 'content']}
			placeholder="Note"
		/>
	</div>
</Node>
