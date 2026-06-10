<script>
	import { Node } from 'svedit';
	import Title from './Title.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-heading-3" {path}>
	<div use:reveal>
		<Title
			path={[...path, 'content']}
			placeholder="Heading 3"
		/>
	</div>
</Node>
