<script>
	import { Node, AnnotatedTextProperty } from 'svedit';

	let { path } = $props();
</script>

<Node {path}>
	<AnnotatedTextProperty
		tag="p"
		class="whitespace-pre text-nowrap"
		path={[...path, 'content']}
		placeholder="Code line"
	/>
</Node>