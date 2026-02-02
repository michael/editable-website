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
				return 'p';
			case 2:
				return 'h1';
			case 3:
				return 'h2';
			case 4:
				return 'h3';
			case 5:
				return 'p';
			default:
				return 'p';
		}
	}

	function get_text_style(layout) {
		switch (layout) {
			case 1:
				return '';
			case 2:
				return 'font-light text-3xl md:text-4xl lg:text-5xl text-balance text-(--accent)';
			case 3:
				return 'font-light text-2xl md:text-3xl lg:text-4xl text-balance';
			case 4:
				return 'font-light text-xl md:text-2xl lg:text-3xl text-balance';
			case 5:
				return 'text-sm font-medium uppercase tracking-wider';
			default:
				return '';
		}
	}

	function get_placeholder(layout) {
		switch (layout) {
			case 1:
				return 'Paragraph';
			case 2:
				return 'Heading 1';
			case 3:
				return 'Heading 2';
			case 4:
				return 'Heading 3';
			case 5:
				return 'Eyebrow';
			default:
				return 'Text';
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
