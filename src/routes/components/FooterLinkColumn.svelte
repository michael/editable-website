<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="footer-link-column flex flex-col gap-4 pb-8">
		<AnnotatedTextProperty
			class="font-lora h6 scroll-mt-24 font-medium text-balance text-black"
			path={[...path, 'label']}
			placeholder="Label"
		/>
		<NodeArrayProperty
			class="[--layout-orientation:vertical] footer-links flex flex-col text-sm"
			path={[...path, 'footer_links']}
		/>
	</div>
</Node>
