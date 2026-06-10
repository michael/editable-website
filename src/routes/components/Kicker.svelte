<script>
	import { Node } from 'svedit';
	import Label from './Label.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<Label
			path={[...path, 'content']}
			placeholder="Kicker"
		/>
	</div>
</Node>
