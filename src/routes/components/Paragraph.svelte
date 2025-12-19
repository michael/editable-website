<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
</script>

<Node {path}>
	<div class="paragraph mx-auto w-full max-w-5xl px-3 py-3 sm:px-4">
		<AnnotatedTextProperty
			tag="p"
			class="text-base"
			path={[...path, 'content']}
			placeholder="Paragraph"
		/>
	</div>
</Node>