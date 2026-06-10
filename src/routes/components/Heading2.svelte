<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag="h2"
			class="ew-h2 font-serif text-2xl md:text-3xl lg:text-4xl text-balance text-(--foreground)"
			path={[...path, 'content']}
			placeholder="Heading 2"
		/>
	</div>
</Node>
