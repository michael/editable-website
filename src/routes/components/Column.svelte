<script>
	import { Node, NodeArrayProperty } from 'svedit';

	let { path } = $props();
</script>

<Node class="ew-column" {path}>
	<NodeArrayProperty class="flex flex-col gap-6" path={[...path, 'content']} />
</Node>
