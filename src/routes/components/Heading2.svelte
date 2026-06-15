<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-heading-2" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='h3'
			class="display-4"
			path={[...path, 'content']}
			placeholder='Heading 2'
		/>
	</div>
</Node>
