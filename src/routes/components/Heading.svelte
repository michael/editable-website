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
				return 'text-5xl font-bold mt-6';
			case 2:
				return 'text-3xl font-bold';
			case 3:
				return 'text-2xl font-bold';
			default:
				return 'text-3xl font-bold';
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
	<div class="heading layout-{layout} mx-auto w-full max-w-5xl px-3 py-3 sm:px-4">
		<AnnotatedTextProperty
			{tag}
			class={text_style}
			path={[...path, 'content']}
			placeholder={placeholder}
		/>
	</div>
</Node>