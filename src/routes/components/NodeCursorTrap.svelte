<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');
	let {
		path,
		type // either 'position-zero-cursor-trap' or 'after-node-cursor-trap'
	} = $props();

	let node_index = $derived(path.at(-1));
	let is_focused = $derived(_is_focused());
	let cursor_trap_el = $state(null);
	let layout_orientation = $state('vertical');

	$effect(() => {
		if (cursor_trap_el) {
			const parent = cursor_trap_el.parentElement;
			if (parent) {
				const style = getComputedStyle(parent);
				const orientation = style.getPropertyValue('--layout-orientation').trim();
				layout_orientation = orientation || 'vertical';
			}
		}
	});

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
	bind:this={cursor_trap_el}
	class="cursor-trap"
	class:after-node-cursor-trap={type === 'after-node-cursor-trap'}
	class:position-zero-cursor-trap={type === 'position-zero-cursor-trap'}
	data-type={type}
	data-orientation={layout_orientation}
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

	/* Vertical layout (default) */
	.cursor-trap[data-orientation='vertical'] {
		height: 12px;
		margin-bottom: -12px;
	}

	.cursor-trap[data-orientation='vertical'] .svedit-selectable {
		height: 12px;
	}

	.cursor-trap[data-orientation='vertical'] .node-cursor {
		height: 4px;
		left: 0;
		right: 0;
	}

	.cursor-trap[data-orientation='vertical'].position-zero-cursor-trap .node-cursor {
		top: 4px;
	}

	.cursor-trap[data-orientation='vertical'].after-node-cursor-trap .node-cursor {
		bottom: 4px;
	}

	.cursor-trap[data-orientation='vertical'].position-zero-cursor-trap {
		margin-bottom: 0;
		margin-top: -12px;
	}

	/* Horizontal layout */
	.cursor-trap[data-orientation='horizontal'] {
		position: absolute;
		right: -6px;
		top: 0;
		bottom: 0;
		width: 12px;
	}

	.cursor-trap[data-orientation='horizontal'] .svedit-selectable {
		width: 12px;
	}

	.cursor-trap[data-orientation='horizontal'] .node-cursor {
		width: 4px;
		top: 0;
		bottom: 0;
	}

	.cursor-trap[data-orientation='horizontal'].position-zero-cursor-trap .node-cursor {
		left: 4px;
	}

	.cursor-trap[data-orientation='horizontal'].after-node-cursor-trap .node-cursor {
		right: 4px;
	}

	.cursor-trap[data-orientation='horizontal'].position-zero-cursor-trap {
		right: auto;
		left: -6px;
		margin-top: 0;
		margin-bottom: 0;
	}
</style>
