<script>
	import { getContext } from 'svelte';
	import ProseLayout from './ProseLayout.svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);

	// We expect the list_node to be the parent in the path
	let prose_node = $derived(svedit.session.get(path.slice(0, -2)));
	let prose_layout = $derived(prose_node?.layout);

	// let tag = $derived(get_tag(layout));
	let text_style = $derived(get_text_style(prose_layout));
	// let placeholder = $derived(get_placeholder(layout));

	// function get_tag(layout) {
	// 	switch (layout) {
	// 		case 1:
	// 			return 'h1';
	// 		case 2:
	// 			return 'h2';
	// 		case 3:
	// 			return 'h3';
	// 		default:
	// 			return 'h2';
	// 	}
	// }

	function get_text_style(layout) {
		switch (layout) {
			case 1:
				return 'text-4xl font-bold mt-6 mb-2 text-balance';
			case 2:
				return 'text-3xl font-bold mt-4 mb-2 text-balance';
			case 3:
				return 'text-2xl font-semibold mt-3 mb-1 text-balance';
		}
	}

	// function get_placeholder(layout) {
	// 	switch (layout) {
	// 		case 1:
	// 			return 'Heading 1';
	// 		case 2:
	// 			return 'Heading 2';
	// 		case 3:
	// 			return 'Heading 3';
	// 		default:
	// 			return 'Heading';
	// 	}
	// }
</script>




<Node {path}>
	<ProseLayout layout={prose_layout}>
		<AnnotatedTextProperty
			tag="h{layout}"
			class={text_style}
			path={[...path, 'content']}
			placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
		/>
	</ProseLayout>

</Node>
