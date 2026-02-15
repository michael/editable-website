<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

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
				return 'span';
			default:
				return 'p';
		}
	}

	function get_text_style(layout) {
		switch (layout) {
			case 1:
				return '';
			case 2:
				return 'ew-h1 font-heading text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-balance text-(--foreground) [text-box:trim-both_cap_alphabetic]';
			case 3:
				return 'ew-h2 font-heading text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-balance text-(--foreground) [text-box:trim-both_cap_alphabetic]';
			case 4:
				return 'ew-h3 font-heading text-xl md:text-2xl lg:text-3xl xl:text-4xl text-balance text-(--foreground)';
			case 5:
				return 'ew-eyebrow block text-xs md:text-sm xl:text-base font-medium uppercase tracking-wider text-(--foreground) opacity-60';
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
	<div use:reveal>
		<AnnotatedTextProperty
			{tag}
			class={text_style}
			path={[...path, 'content']}
			{placeholder}
		/>
	</div>
</Node>
