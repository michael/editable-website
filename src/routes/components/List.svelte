<script>
	import { Node, NodeArrayProperty } from 'svedit';

	let { path } = $props();
</script>

<Node {path}>
	<div class="mx-auto flex w-full max-w-4xl flex-col py-2" role="list">
		<NodeArrayProperty class="flex flex-col gap-2" path={[...path, 'list_items']} />
	</div>
</Node>
