<script>
	import { Node } from 'svedit';
	import Small from './Small.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-note" {path}>
	<div use:reveal class="text-(--foreground)/50 [&_a]:text-(--foreground)">
		<Small
			path={[...path, 'content']}
			placeholder="Note"
		/>
	</div>
</Node>
