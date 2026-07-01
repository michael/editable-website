<script>
	import { NodeArrayProperty, Node } from 'svedit';
	let { path } = $props();
</script>

<Node {path}>
	<div
		class="ew-footer-link-column"
		style="anchor-name: --footer-column-items; --node-caret-boundary: initial;"
	>
		<NodeArrayProperty
			class="ew-footer-column-items [--row:0] space-y-4 [&>.footer-column-label:not(.first)]:mt-10 sm:[&>.footer-column-label:not(.first)]:mt-12"
			path={[...path, 'items']}
		/>
	</div>
</Node>
