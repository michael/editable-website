<script>
	import { Node } from 'svedit';
	import Large from './Large.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-lead" {path}>
	<div use:reveal>
		<Large
			path={[...path, 'content']}
			placeholder="Lead"
		/>
	</div>
</Node>
