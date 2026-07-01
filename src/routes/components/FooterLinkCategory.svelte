<script>
	import { TextProperty, Node } from 'svedit';
	let { path } = $props();
</script>

<Node {path} class="ew-footer-link-category">
	<TextProperty
		class="block body-sm text-(--foreground)/50"
		path={[...path, 'title']}
		placeholder="Category"
	/>
</Node>
