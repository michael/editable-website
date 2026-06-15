<script>
	import { Node } from 'svedit';
	import { AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='p'
			class="body-base"
			path={[...path, 'content']}
			placeholder='Paragraph'
		/>
	</div>
</Node>
