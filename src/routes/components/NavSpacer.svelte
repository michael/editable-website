<script>
	import { Node } from 'svedit';

	let { path } = $props();
</script>

<Node class="nav-spacer flex-1 min-w-6" {path}>
	<div class="flex-1" contenteditable="false" aria-hidden="true"></div>
</Node>
