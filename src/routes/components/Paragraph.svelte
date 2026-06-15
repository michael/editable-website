<script>
	import { Node } from 'svedit';
	import Base from './Base.svelte';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<Base tag="p" path={[...path, 'content']} placeholder="Paragraph" />
	</div>
</Node>
