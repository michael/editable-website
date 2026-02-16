<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="footer-link-column flex flex-col items-center md:items-start gap-3 md:gap-6">
		<AnnotatedTextProperty
			class="text-xs md:text-sm font-medium uppercase tracking-wider text-(--foreground) opacity-60"
			path={[...path, 'label']}
			placeholder="Column Label"
		/>
		<NodeArrayProperty
			class="footer-links w-full flex flex-col items-center md:items-stretch"
			path={[...path, 'footer_links']}
		/>
	</div>
</Node>

<style>
	:global(.footer-links) {
		--layout-orientation: vertical;
	}
</style>
