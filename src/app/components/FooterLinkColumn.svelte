<script lang="ts">
	import type { DocumentPath } from 'svedit';
	import { NodeArrayProperty, Node } from 'svedit';
	let { path }: { path: DocumentPath } = $props();
</script>

<Node {path}>
	<div
		class="ew-footer-link-column"
		style="anchor-name: --footer-link-items; --node-caret-boundary: initial;"
	>
		<NodeArrayProperty
			class="ew-footer-link-items space-y-4 [--row:0] [&>.ew-footer-link-category:not(.first)]:mt-10 sm:[&>.ew-footer-link-category:not(.first)]:mt-12"
			path={[...path, 'items']}
		/>
	</div>
</Node>
