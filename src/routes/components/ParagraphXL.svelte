<script>
	import { Node } from 'svedit';
	import { AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-paragraph-xl" {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag='p'
			class="body-xl"
			path={[...path, 'content']}
			placeholder='Extra large paragraph'
		/>
	</div>
</Node>
