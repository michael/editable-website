<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node } from 'svedit';

	let { path } = $props();
</script>

<Node {path}>
	<div class="">
		<div class="nav mx-auto w-full max-w-5xl py-6 pb-12">
			<NodeArrayProperty class="nav-items flex flex-wrap" path={[...path, 'nav_items']} />
		</div>
	</div>
</Node>

<style>
	.nav :global(.nav-items) {
		--layout-orientation: horizontal;
	}
</style>
