<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="footer-link-column flex flex-col">
		<div class="px-4 py-1.5 border-b border-gray-400 text-center">
			<AnnotatedTextProperty
				class="text-xs uppercase text-gray-400"
				path={[...path, 'label']}
				placeholder="Column Label"
			/>
		</div>
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

	:global(.footer-links > *) {
		border-bottom: 1px solid rgb(156, 163, 175);
	}


</style>
