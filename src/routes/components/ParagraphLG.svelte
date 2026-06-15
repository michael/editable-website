<script>
	import { Node } from 'svedit';
	import { AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-paragraph-lg" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='p'
			class="body-lg"
			path={[...path, 'content']}
			placeholder='Large Paragraph'
		/>
	</div>
</Node>
