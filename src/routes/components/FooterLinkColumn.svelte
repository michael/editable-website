<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="footer-link-column flex flex-col items-center gap-3 lg:items-start lg:gap-6">
		<AnnotatedTextProperty
			class="text-xs tracking-widest text-(--foreground) uppercase opacity-60 md:text-sm"
			path={[...path, 'label']}
			placeholder={svedit.editable ? 'Column Label' : undefined}
		/>
		<NodeArrayProperty
			class="footer-links flex w-full flex-col items-center lg:items-stretch"
			path={[...path, 'footer_links']}
		/>
	</div>
</Node>

<style>
	:global(.footer-links) {
		--row: 0;
	}
</style>
