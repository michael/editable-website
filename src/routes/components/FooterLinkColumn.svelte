<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="footer-link-column flex flex-col gap-2 px-4">
		<AnnotatedTextProperty
			class="font-bold"
			path={[...path, 'label']}
			placeholder="Column Label"
		/>
		<NodeArrayProperty
			class="footer-links flex flex-col"
			path={[...path, 'footer_links']}
		/>
	</div>
</Node>

<style>
	:global(.footer-links) {
		--layout-orientation: vertical;
	}
</style>
