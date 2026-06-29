<script>
	import { NodeArrayProperty, TextProperty, Node } from 'svedit';
	let { path } = $props();
</script>

<Node {path}>
	<div class="footer-link-column">
		<TextProperty
			class="pb-1.5 body-sm text-(--foreground)/50"
			path={[...path, 'label']}
			placeholder="Column Label"
		/>
		<div style="anchor-name: --footer-links; --node-caret-boundary: initial;">
			<NodeArrayProperty class="footer-links [--row:0]" path={[...path, 'footer_links']} />
		</div>
	</div>
</Node>
