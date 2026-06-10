<script>
	import { NodeArrayProperty, Node } from 'svedit';
	import Small from './Small.svelte';

	let { path } = $props();
</script>

<Node {path}>
	<div class="footer-link-column flex flex-col items-center lg:items-start gap-1">
		<Small class="text-(--foreground)" path={[...path, 'label']} placeholder="Column Label"/>
		<NodeArrayProperty
			class="footer-links w-full flex flex-col items-center lg:items-stretch"
			path={[...path, 'footer_links']}
		/>
	</div>
</Node>

<style>
	:global(.footer-links) {
		--row: 0;
	}
</style>
