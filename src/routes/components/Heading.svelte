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
				return 'font-bold text-3xl md:text-4xl lg:text-5xl pt-20 pb-4 text-balance';
			case 2:
				return 'font-bold text-2xl md:text-3xl lg:text-4xl pt-10 pb-4 text-balance';
			case 3:
				return 'font-bold text-xl md:text-2xl lg:text-3xl pt-6 pb-4 text-balance';
			default:
				return 'font-bold text-4xl text-balance';
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
