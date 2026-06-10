<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<AnnotatedTextProperty tag="p" path={[...path, 'content']} placeholder="Paragraph" />
	</div>
</Node>
