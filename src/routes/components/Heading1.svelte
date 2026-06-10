<script>
	import { Node } from 'svedit';
	import Display from './Display.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-heading-1" {path}>
	<div use:reveal>
		<Display
			path={[...path, 'content']}
			placeholder="Heading 1"
		/>
	</div>
</Node>
