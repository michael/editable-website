<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-heading-1" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='h2'
			class="display-3"
			path={[...path, 'content']}
			placeholder='Heading 1'
		/>
	</div>
</Node>
