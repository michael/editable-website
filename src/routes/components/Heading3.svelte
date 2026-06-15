<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-heading-3" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='h4'
			class="display-5"
			path={[...path, 'content']}
			placeholder='Heading 3'
		/>
	</div>
</Node>
