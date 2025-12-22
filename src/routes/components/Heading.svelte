<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
	let tag = $derived(get_tag(layout));
	let text_style = $derived(get_text_style(layout));
	let placeholder = $derived(get_placeholder(layout));

	function get_tag(layout) {
		switch (layout) {
			case 1:
				return 'h1';
			case 2:
				return 'h2';
			case 3:
				return 'h3';
			default:
				return 'h2';
		}
	}

	function get_text_style(layout) {
		switch (layout) {
			case 1:
				return 'text-4xl font-bold mt-6 mb-2 text-balance';
			case 2:
				return 'text-3xl font-bold mt-4 mb-2 text-balance';
			case 3:
				return 'text-2xl font-semibold mt-3 mb-1 text-balance';
			default:
				return 'text-3xl font-bold text-balance';
		}
	}

	function get_placeholder(layout) {
		switch (layout) {
			case 1:
				return 'Heading 1';
			case 2:
				return 'Heading 2';
			case 3:
				return 'Heading 3';
			default:
				return 'Heading';
		}
	}
</script>

<Node {path}>
	<AnnotatedTextProperty
		{tag}
		class={text_style}
		path={[...path, 'content']}
		{placeholder}
	/>
</Node>
