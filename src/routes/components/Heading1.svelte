<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag="h1"
			class="ew-h1 font-serif text-3xl md:text-4xl lg:text-5xl text-balance text-(--foreground)"
			path={[...path, 'content']}
			placeholder="Heading 1"
		/>
	</div>
</Node>
