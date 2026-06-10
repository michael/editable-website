<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag="h3"
			class="ew-h3 font-serif text-xl md:text-2xl lg:text-3xl text-balance text-(--foreground)"
			path={[...path, 'content']}
			placeholder="Heading 3"
		/>
	</div>
</Node>
