<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node {path}>
	<div use:reveal>
		<AnnotatedTextProperty
			tag="span"
			class="ew-eyebrow leading-loose block text-xs md:text-sm uppercase tracking-widest text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]"
			path={[...path, 'content']}
			placeholder="Kicker"
		/>
	</div>
</Node>
