<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';

	const svedit = getContext('svedit');

	let { path } = $props();
	let list_node = $derived(svedit.session.get(path.slice(0, -2)));
	let item_index = $derived(Number(path.at(-1)) || 0);
	let marker = $derived(get_marker(item_index + 1, list_node?.layout || 3));

	function get_marker(index, layout) {
		switch (layout) {
			case 1:
				return '▪';
			case 2:
				return '✓';
			case 3:
				return `${String(index).padStart(2, '0')}.`;
			case 4:
				return `${to_latin(index)}.`;
			default:
				return '▪';
		}
	}

	function to_latin(index) {
		let value = index;
		let result = '';

		while (value > 0) {
			value -= 1;
			result = String.fromCharCode(97 + (value % 26)) + result;
			value = Math.floor(value / 26);
		}

		return result;
	}
</script>

<Node {path}>
	<div class="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-0" role="listitem">
		<div
			contenteditable="false"
			class="text-right text-sm leading-7 text-[color-mix(in_oklch,var(--foreground)_60%,transparent)] select-none"
			aria-hidden="true"
		>
			{marker}
		</div>
		<TextProperty
			class="leading-7 text-(--foreground)"
			path={[...path, 'content']}
			placeholder="List item"
		/>
	</div>
</Node>
