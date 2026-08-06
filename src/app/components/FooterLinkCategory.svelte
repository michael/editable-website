<script lang="ts">
	import type { DocumentPath } from 'svedit';
	import { TextProperty, Node } from 'svedit';
	let { path }: { path: DocumentPath } = $props();
</script>

<Node {path} class="ew-footer-link-category">
	<TextProperty
		class="block body-sm text-(--muted-foreground)"
		path={[...path, 'title']}
		placeholder="Category"
	/>
</Node>
