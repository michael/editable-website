<script>
	import { Node } from 'svedit';
	import { AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	let { path } = $props();
</script>

<Node class="ew-paragraph-sm" {path}>
	<div use:reveal class="text-(--foreground)/50 [&_a]:text-(--foreground) [&_strong]:text-(--foreground) [&_strong]:font-normal">
		<AnnotatedTextProperty
			tag='p'
			class="body-sm"
			path={[...path, 'content']}
			placeholder='Small Paragraph'
		/>
	</div>
</Node>
