<script>
	import { serialize_path } from 'svedit';
	import { get_selection_node_ancestors } from '../app_utils.js';

	let { session, focus_canvas } = $props();

	let ancestors = $derived(get_selection_node_ancestors(session));
	let type_state = $derived(session.commands.cycle_node_type_next?.cycle_node_state ?? null);
	let layout_state = $derived(
		session.commands.cycle_layout_next?.closest_switchable_layout ?? null
	);
	let type_target_key = $derived(get_state_path_key(type_state));
	let layout_target_key = $derived(get_state_path_key(layout_state));
	let variant_item = $derived.by(
		() =>
			ancestors
				.map((ancestor) => build_item(ancestor))
				.filter((item) => item.option_count > 1)
				.at(-1) ?? null
	);

	function get_state_path_key(state) {
		if (!state) return null;
		return serialize_path([...state.node_array_path, state.node_index]);
	}

	function get_layouts(node_type) {
		if (!('layout' in (session.schema[node_type]?.properties ?? {}))) return [null];
		const layouts = session.config.node_layouts?.[node_type] ?? [];
		return layouts.length > 0 ? layouts : [null];
	}

	function encode_variant(node_type, layout) {
		return JSON.stringify([node_type, layout]);
	}

	function humanize_node_id(value, capitalize = false) {
		if (typeof value !== 'string') return '';
		let words = value.replaceAll('_', ' ').replaceAll('-', ' ');
		words = words.replace(/\b(xl|lg|sm)\b/g, (word) => word.toUpperCase());
		return capitalize ? words.charAt(0).toUpperCase() + words.slice(1) : words;
	}

	function get_variant_label(node_type, layout) {
		const type_label = humanize_node_id(node_type, true);
		const layout_label = humanize_node_id(layout);
		return layout_label ? `${type_label} (${layout_label})` : type_label;
	}

	function build_item(ancestor) {
		const path_key = serialize_path(ancestor.path);
		const is_type_target = path_key === type_target_key;
		const is_layout_target = path_key === layout_target_key;
		const current_layout = ancestor.node.layout ?? null;
		const current_value = encode_variant(ancestor.node.type, current_layout);
		const groups = [];

		if (is_type_target) {
			const allowed_types = new Set([ancestor.node.type, ...(type_state?.available_types ?? [])]);
			const schema_order = session.inspect(type_state.node_array_path)?.node_types ?? [];
			for (const node_type of schema_order.filter((node_type) => allowed_types.has(node_type))) {
				const layouts =
					node_type === ancestor.node.type && !is_layout_target
						? [current_layout]
						: get_layouts(node_type);
				groups.push({
					node_type,
					options: layouts.map((layout) => ({
						layout,
						value: encode_variant(node_type, layout),
						label: get_variant_label(node_type, layout)
					}))
				});
			}
		} else if (is_layout_target) {
			groups.push({
				node_type: ancestor.node.type,
				options: get_layouts(ancestor.node.type).map((layout) => ({
					layout,
					value: encode_variant(ancestor.node.type, layout),
					label: get_variant_label(ancestor.node.type, layout)
				}))
			});
		}

		return {
			...ancestor,
			is_type_target,
			is_layout_target,
			current_value,
			label: get_variant_label(ancestor.node.type, current_layout),
			type_label: humanize_node_id(ancestor.node.type, true),
			layout_label: humanize_node_id(current_layout),
			groups,
			options: groups.flatMap((group) => group.options),
			option_count: groups.reduce((count, group) => count + group.options.length, 0)
		};
	}

	function handle_arrow_mousedown(event, item, direction) {
		event.preventDefault();
		const current_index = item.options.findIndex((option) => option.value === item.current_value);
		if (current_index === -1 || item.options.length < 2) return;
		const offset = direction === 'next' ? 1 : -1;
		const next_index = (current_index + offset + item.options.length) % item.options.length;
		choose_variant(item, item.options[next_index].value);
	}

	function handle_variant_change(event, item) {
		choose_variant(item, event.currentTarget.value);
		restore_canvas_selection();
	}

	function choose_variant(item, value) {
		const [node_type, layout] = JSON.parse(value);
		if (node_type !== item.node.type && item.is_type_target) {
			session.commands.cycle_node_type_next?.execute_with_type(node_type, layout);
		} else if (layout !== item.node.layout && item.is_layout_target) {
			session.commands.cycle_layout_next?.execute_with_layout(layout);
		}
	}

	function restore_canvas_selection() {
		// Native selects move DOM focus outside Svedit. Re-focus after the
		// select event finishes, then assign a fresh selection object so Svedit
		// renders the current model selection back into the DOM.
		setTimeout(() => {
			focus_canvas();
			if (session.selection) {
				session.selection = {
					...session.selection,
					path: [...session.selection.path]
				};
			}
		}, 0);
	}

	function handle_variant_keydown(event) {
		if (event.key === 'Escape') restore_canvas_selection();
	}
</script>

{#if variant_item}
	<div
		class="flex shrink-0 items-center rounded-full border border-(--border) bg-(--background)/95 p-1 text-xs leading-5 text-(--foreground) shadow-sm backdrop-blur-sm"
		aria-label="Current node variant"
	>
		<button
			class="flex size-7 items-center justify-center rounded-full text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground)"
			onmousedown={(event) => handle_arrow_mousedown(event, variant_item, 'previous')}
			title="Previous variant"
			aria-label="Previous variant for {variant_item.label}">←</button
		>
		<button
			class="flex size-7 items-center justify-center rounded-full text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground)"
			onmousedown={(event) => handle_arrow_mousedown(event, variant_item, 'next')}
			title="Next variant"
			aria-label="Next variant for {variant_item.label}">→</button
		>

		<label
			class="relative flex cursor-pointer items-center rounded-full px-2 py-1 hover:bg-(--muted)"
		>
			<span class="sr-only">Choose variant for {variant_item.node.type}</span>
			<span aria-hidden="true">
				<span class="font-medium">{variant_item.type_label}</span>
				{#if variant_item.layout_label}
					<span class="ml-1 font-mono text-[11px] text-(--muted-foreground)"
						>({variant_item.layout_label})</span
					>
				{/if}
			</span>
			<select
				class="variant-select absolute inset-0 size-full cursor-pointer opacity-0"
				value={variant_item.current_value}
				aria-label="Choose variant; current variant is {variant_item.label}"
				onchange={(event) => handle_variant_change(event, variant_item)}
				onblur={restore_canvas_selection}
				onkeydown={handle_variant_keydown}
			>
				{#each variant_item.groups as group}
					{#if variant_item.groups.length > 1}
						<optgroup label={humanize_node_id(group.node_type, true)}>
							{#each group.options as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</optgroup>
					{:else}
						{#each group.options as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					{/if}
				{/each}
			</select>
		</label>
	</div>
{/if}

<style>
	.variant-select,
	.variant-select:focus,
	.variant-select:focus-visible {
		appearance: none;
		-webkit-appearance: none;
		border: 0;
		outline: 0;
		box-shadow: none;
		background-image: none;
	}
</style>
