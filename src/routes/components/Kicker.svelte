<script>
	import { Node } from 'svedit';
	import Label from './Label.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal class="">
		<Label
			class="text-(--foreground)/50"
			path={[...path, 'content']}
			placeholder="Kicker"
		/>
	</div>
</Node>
