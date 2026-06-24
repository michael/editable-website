import { Command, is_selection_collapsed, serialize_path } from 'svedit';
import {
	get_closest_switchable_layout,
	get_colorset_node,
	get_cycle_node_state,
	is_node_subtree_empty
} from './app_utils.js';

/**
 * Replace a node with a schema-equivalent node type while preserving property values.
 *
 * @param {import('svedit').Transaction} tr
 * @param {(string|number)[]} node_array_path
 * @param {number} node_index
 * @param {object} node
 * @param {string} new_type
 */
function replace_node_with_equivalent_type(tr, node_array_path, node_index, node, new_type) {
	const node_schema = tr.schema[node.type];
	const new_node = {
		id: tr.generate_id(),
		type: new_type
	};

	for (const property_name of Object.keys(node_schema.properties)) {
		new_node[property_name] = structuredClone(node[property_name]);
	}

	tr.create(new_node);

	const node_array_value = structuredClone(tr.get(node_array_path));
	node_array_value.nodes[node_index] = new_node.id;
	tr.set(node_array_path, node_array_value);
	tr.set_selection({
		type: 'node',
		path: node_array_path,
		anchor_offset: node_index,
		focus_offset: node_index + 1
	});
}

/**
 * Command that cycles through available layouts for a node.
 * Direction can be 'next' or 'previous'.
 */
export class CycleLayoutCommand extends Command {
	closest_switchable_layout = $derived(
		get_closest_switchable_layout(this.context.session, this.context.session.config)
	);

	constructor(direction, context) {
		super(context);
		this.direction = direction;
	}

	is_enabled() {
		return this.context.editable && this.closest_switchable_layout !== null;
	}

	execute() {
		const session = this.context.session;
		const { node, node_array_path, node_index } = this.closest_switchable_layout;
		const layout_count = session.config.node_layouts[node.type];

		let new_layout;
		if (this.direction === 'next') {
			new_layout = (node.layout % layout_count) + 1;
		} else {
			new_layout = ((node.layout - 2 + layout_count) % layout_count) + 1;
		}

		const tr = session.tr;
		// Set node selection so it's clear which node's layout changed
		tr.set_selection({
			type: 'node',
			path: node_array_path,
			anchor_offset: node_index,
			focus_offset: node_index + 1
		});
		tr.set([node.id, 'layout'], new_layout);
		session.apply(tr);
	}
}

/**
 * Command that cycles through available node types in a node array.
 * Direction can be 'next' or 'previous'.
 */
export class CycleNodeTypeCommand extends Command {
	cycle_node_state = $derived(get_cycle_node_state(this.context.session));

	constructor(direction, context) {
		super(context);
		this.direction = direction;
	}

	is_enabled() {
		return this.context.editable && (this.cycle_node_state?.available_types.length ?? 0) > 0;
	}

	execute() {
		const session = this.context.session;
		const cycle_node_state = this.cycle_node_state;
		if (!cycle_node_state || cycle_node_state.available_types.length === 0) return;

		const { node, node_array_path, node_index, available_types } = cycle_node_state;
		const new_type = this.direction === 'next' ? available_types[0] : available_types.at(-1);
		const tr = session.tr;

		tr.set_selection({
			type: 'node',
			path: node_array_path,
			anchor_offset: node_index,
			focus_offset: node_index + 1
		});

		if (is_node_subtree_empty(session, node)) {
			session.config.inserters[new_type](tr);
		} else {
			replace_node_with_equivalent_type(tr, node_array_path, node_index, node, new_type);
		}

		session.apply(tr);
	}
}

/**
 * Command that cycles through colorset options (0, 1, 2).
 * Finds the nearest ancestor with a colorset property and cycles it.
 */
export class CycleColorsetCommand extends Command {
	colorset_node = $derived(get_colorset_node(this.context.session));

	is_enabled() {
		return this.context.editable && this.colorset_node !== null;
	}

	execute() {
		const session = this.context.session;
		const node = this.colorset_node;
		if (!node) return;

		// Cycle through 0, 1, 2
		const new_colorset = (node.colorset + 1) % 3;

		const tr = session.tr;
		tr.set([node.id, 'colorset'], new_colorset);
		session.apply(tr);
	}
}

export class ReplaceMediaCommand extends Command {
	is_enabled() {
		const session = this.context.session;
		if (!this.context.editable || session.selection?.type !== 'property') return false;
		const selected_property = session.get(session.selection.path);
		return selected_property?.type === 'image' || selected_property?.type === 'video';
	}

	execute() {
		if (!this.is_enabled()) return;

		const selection_path = this.context.session.selection?.path;
		if (!selection_path) return;

		document.documentElement.dataset.replaceMediaPath = JSON.stringify(selection_path);
		const replace_media_input = /** @type {HTMLInputElement | null} */ (
			document.getElementById('replace-media-input')
		);
		replace_media_input?.click();
	}
}

export class EditImageCommand extends Command {
	show_prompt = $state(false);

	constructor(context) {
		super(context);

		$effect(() => {
			this.context.session.selection;
			this.show_prompt = false;
		});
	}

	is_enabled() {
		const session = this.context.session;
		if (!this.context.editable || session.selection?.type !== 'property') return false;
		const selected_property = session.get(session.selection.path);
		return selected_property?.type === 'image' || selected_property?.type === 'video';
	}

	execute() {
		if (!this.is_enabled()) return;

		setTimeout(() => {
			this.show_prompt = true;
		}, 0);
	}
}

/**
 * Command that toggles link annotations on text selections.
 * Shows a custom prompt for URL when creating a link.
 */
export class ToggleLinkCommand extends Command {
	active = $derived(this.is_active());
	show_prompt = $state(false);

	constructor(context) {
		super(context);

		// Reset show_prompt when selection changes
		$effect(() => {
			// Access selection to track it
			this.context.session.selection;
			// Reset prompt state on any selection change
			this.show_prompt = false;
		});
	}

	is_active() {
		return this.context.session.active_annotation('link');
	}

	is_enabled() {
		const { session, editable } = this.context;

		const can_remove_link = session.active_annotation('link');
		const can_create_link =
			!session.active_annotation() && !is_selection_collapsed(session.selection);
		return editable && session.selection?.type === 'text' && (can_remove_link || can_create_link);
	}

	execute() {
		const session = this.context.session;
		const has_active_link = session.active_annotation('link');

		if (has_active_link) {
			// Delete link
			session.apply(session.tr.annotate_text('link'));
		} else {
			// Show prompt for creating link
			this.show_prompt = true;
		}
	}
}

/**
 * Command that toggles section annotations on non-empty node selections.
 *
 * Node-array annotations are exclusive. If the selection overlaps an existing
 * annotation, the first toggle removes it while preserving the selection. A
 * second toggle can then create a section for that original selection.
 */
export class ToggleSectionCommand extends Command {
	active = $derived(this.is_active());

	get_active_annotation() {
		const selection = this.context.session.selection;
		if (selection?.type !== 'node') return null;

		const start = Math.min(selection.anchor_offset, selection.focus_offset);
		const end = Math.max(selection.anchor_offset, selection.focus_offset);
		const node_array_value = this.context.session.get(selection.path);

		return (
			node_array_value?.annotations?.find(
				(annotation) =>
					(annotation.start_offset <= start && annotation.end_offset > start) ||
					(annotation.start_offset < end && annotation.end_offset >= end) ||
					(annotation.start_offset >= start && annotation.end_offset <= end)
			) ?? null
		);
	}

	is_active() {
		const annotation = this.get_active_annotation();
		if (!annotation) return false;
		return this.context.session.get(annotation.node_id)?.type === 'section';
	}

	is_enabled() {
		const { session, editable } = this.context;
		const selection = session.selection;
		if (!editable || selection?.type !== 'node') return false;

		const start = Math.min(selection.anchor_offset, selection.focus_offset);
		const end = Math.max(selection.anchor_offset, selection.focus_offset);
		if (start === end) return false;

		const active_annotation = this.get_active_annotation();
		const property_definition = session.inspect(selection.path);
		return (
			!!active_annotation || property_definition?.annotation_types?.includes('section') === true
		);
	}

	execute() {
		if (!this.is_enabled()) return;

		const session = this.context.session;
		const selection = session.selection;
		const start = Math.min(selection.anchor_offset, selection.focus_offset);
		const end = Math.max(selection.anchor_offset, selection.focus_offset);
		const active_annotation = this.get_active_annotation();
		const node_array_value = structuredClone(session.get(selection.path));
		const tr = session.tr;

		if (active_annotation) {
			const annotation_index = node_array_value.annotations.findIndex(
				(annotation) =>
					annotation.start_offset === active_annotation.start_offset &&
					annotation.end_offset === active_annotation.end_offset &&
					annotation.node_id === active_annotation.node_id
			);
			if (annotation_index === -1) return;

			tr.delete(active_annotation.node_id);
			node_array_value.annotations.splice(annotation_index, 1);
		} else {
			const section = {
				id: tr.generate_id(),
				type: 'section'
			};
			tr.create(section);
			node_array_value.annotations.push({
				start_offset: start,
				end_offset: end,
				node_id: section.id
			});
		}

		tr.set(selection.path, node_array_value);
		tr.set_selection(selection);
		session.apply(tr);
	}
}

export class ToggleAccordionCommand extends Command {
	is_enabled() {
		const session = this.context.session;
		if (!session.selection) return false;
		const path = session.selection.path;
		const property_definition = session.inspect(path);

		if (property_definition?.type === 'annotated_text' && property_definition.name === 'title') {
			const owning_node = session.get(path.slice(0, -1));
			return owning_node.type === 'accordion_item';
		}
	}

	execute() {
		const path_key = serialize_path(this.context.session.selection.path.slice(0, -1));
		const details = document.querySelector(`[data-path="${path_key}"] details`);
		if (details instanceof HTMLDetailsElement) {
			details.open = !details.open;
		}
	}
}

/**
 * Command that opens the edit link dialog for link-ish nodes (nodes with href property).
 */
export class EditLinkCommand extends Command {
	show_prompt = $state(false);

	constructor(context) {
		super(context);

		// Reset show_prompt when selection changes
		$effect(() => {
			// Access selection to track it
			this.context.session.selection;
			// Reset prompt state on any selection change
			this.show_prompt = false;
		});
	}

	is_enabled() {
		const { session, editable } = this.context;
		if (!editable || !session.selection) return false;

		// Check if selected_node has an href property (link-ish block node)
		const selected_node = session.selected_node;
		if (selected_node && 'href' in selected_node) return true;

		// Check for active link annotation (text link)
		const active_link = session.active_annotation('link');
		if (active_link) return true;

		return false;
	}

	execute() {
		if (this.is_enabled()) {
			const { session } = this.context;
			// Select the parent node if a property is selected (but not for annotation links)
			const active_link = session.active_annotation('link');
			if (
				!active_link &&
				(session.selection?.type === 'text' || session.selection?.type === 'property')
			) {
				session.select_parent();
			}
			// Wait for selection change to settle before showing prompt
			setTimeout(() => {
				this.show_prompt = true;
			}, 0);
		}
	}
}
