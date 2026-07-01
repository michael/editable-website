<script>
	import { TextProperty, Node } from 'svedit';
	let { path } = $props();
</script>

<Node {path} class="ew-footer-column-label">
	<TextProperty
		class="block body-sm text-(--foreground)/50"
		path={[...path, 'label']}
		placeholder="Column Label"
	/>
</Node>
