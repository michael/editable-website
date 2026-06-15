<script>
	import { Node } from 'svedit';
	import Headline from './Headline.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-heading-2" {path}>
	<div use:reveal>
		<Headline
			path={[...path, 'content']}
			placeholder="Heading 2"
		/>
	</div>
</Node>
