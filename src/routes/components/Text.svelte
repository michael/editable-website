<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
	let tag = $derived(get_tag(layout));
	let text_style = $derived(get_text_style_from_layout(layout));
	let readable_text_type = $derived(get_readable_text_type_from_layout(layout));

	function get_text_style_from_layout(layout) {
		switch (layout) {
			case 1:
				return 'text-base';
			case 2:
				return 'text-5xl font-bold mt-6';
			case 3:
				return 'text-3xl font-bold';
			case 4:
				return 'text-2xl font-bold';
			default:
				return 'text-base';
		}
	}

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
			default:
				return 'div';
		}
	}

	function get_readable_text_type_from_layout(layout) {
		switch (layout) {
			case 1:
				return 'Paragraph';
			case 2:
				return 'Heading 1';
			case 3:
				return 'Heading 2';
			case 4:
				return 'Heading 3';
			default:
				return 'Paragraph';
		}
	}
</script>

<Node {path}>
	<div class="text layout-{layout} mx-auto w-full max-w-5xl px-3 py-3 sm:px-4">
		<AnnotatedTextProperty
			{tag}
			class={text_style}
			path={[...path, 'content']}
			placeholder={readable_text_type}
		/>
	</div>
</Node>
