<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');
	let {
		path,
		type // either 'position-zero-cursor-trap' or 'after-node-cursor-trap'
	} = $props();

	let node_index = $derived(path.at(-1));
	let is_focused = $derived(_is_focused());

	function _is_focused() {
		const sel = svedit.session.selection;

		if (
			sel?.type === 'node' &&
			[...sel.path, node_index].join('.') === path.join('.') &&
			sel.anchor_offset === sel.focus_offset
		) {
			if (sel.anchor_offset === 0 && node_index === 0 && type === 'position-zero-cursor-trap') {
				return true;
			} else if (sel.anchor_offset === node_index + 1 && type === 'after-node-cursor-trap') {
				return true;
			}
		}
		return false;
	}
</script>

<!-- Cursor trap that provides a contenteditable target for node_array cursor positioning -->
<div
	class="cursor-trap"
	class:after-node-cursor-trap={type === 'after-node-cursor-trap'}
	class:position-zero-cursor-trap={type === 'position-zero-cursor-trap'}
	data-type={type}
>
	<!-- This is where the cursor gets trapped -->
	<div class="svedit-selectable"><br /></div>
	<!-- And this is the blinking cursor -->
	{#if is_focused}<div contenteditable="false" class="node-cursor">&ZeroWidthSpace;</div>{/if}
</div>

<style>
	.cursor-trap {
		/*outline: 1px dashed var(--editing-stroke-color);*/
		outline: 1px dashed color-mix(in srgb, var(--editing-stroke-color) 30%, transparent);
		position: relative;
		cursor: pointer;
		z-index: 20;
	}

	.node-cursor {
		position: absolute;
		background: var(--editing-stroke-color);
		pointer-events: none;
		animation: blink 0.7s infinite;
	}

	@keyframes blink {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@container style(--layout-orientation: vertical) {
		.cursor-trap {
			position: absolute;
			bottom: -6px;
			left: 0;
			right: 0;
			height: 12px;
		}

		.cursor-trap .svedit-selectable {
			height: 12px;
		}

		.node-cursor {
			height: 4px;
			left: 0;
			right: 0;
		}

		.cursor-trap.position-zero-cursor-trap .node-cursor {
			top: 4px;
		}

		.cursor-trap.after-node-cursor-trap .node-cursor {
			bottom: 4px;
		}

		.cursor-trap.position-zero-cursor-trap {
			bottom: auto;
			top: -6px;
		}
	}

	@container style(--layout-orientation: horizontal) {
		.cursor-trap {
			position: absolute;
			right: -6px;
			top: 0;
			bottom: 0;
			width: 12px;
		}

		.node-cursor {
			width: 4px;
			top: 0;
			bottom: 0;
		}

		.cursor-trap.position-zero-cursor-trap .node-cursor {
			left: 4px;
		}

		.cursor-trap.after-node-cursor-trap .node-cursor {
			right: 4px;
		}

		.cursor-trap.position-zero-cursor-trap {
			right: auto;
			left: -6px;
		}
	}
</style>
