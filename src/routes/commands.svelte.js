import { Command, is_selection_collapsed } from 'svedit';
import { get_closest_switchable_layout, get_colorset_node, get_closest_switchable_type } from './app_utils.js';

/**
 * Command that cycles through available layouts for a node.
 * Direction can be 'next' or 'previous'.
 */
export class CycleLayoutCommand extends Command {
	closest_switchable_layout = $derived(get_closest_switchable_layout(this.context.session, this.context.session.config));

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
	closest_switchable_type = $derived(get_closest_switchable_type(this.context.session));

	constructor(direction, context) {
		super(context);
		this.direction = direction;
	}

	is_enabled() {
		return this.context.editable && this.closest_switchable_type !== null;
	}

	execute() {
		const session = this.context.session;
		const { node, node_array_path, node_index } = this.closest_switchable_type;
		const numeric_index = parseInt(String(node_index));
		const node_array_schema = session.inspect(node_array_path);
		const node_types = node_array_schema.node_types;

		const current_type_index = node_types.indexOf(node.type);
		let new_type_index;

		if (this.direction === 'next') {
			new_type_index = (current_type_index + 1) % node_types.length;
		} else {
			new_type_index = (current_type_index - 1 + node_types.length) % node_types.length;
		}

		const new_type = node_types[new_type_index];
		const tr = session.tr;
		// Set the selection inside the transaction so undo/redo replays correctly
		tr.set_selection({
			type: 'node',
			path: node_array_path,
			anchor_offset: numeric_index,
			focus_offset: numeric_index + 1
		});
		session.config.inserters[new_type](tr);
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

/**
 * Command that resets the image src on the selected image node.
 */
export class ResetImageCommand extends Command {
	is_enabled() {
		const session = this.context.session;
		if (!this.context.editable || session.selection?.type !== 'property') return false;
		const property_definition = session.inspect(session.selection.path);
		return property_definition.type === 'node';
	}

	execute() {
		const session = this.context.session;
		const image_node = session.get(session.selection.path);
		if (image_node?.type !== 'image') return;

		const tr = session.tr;
		tr.set([image_node.id, 'src'], '');
		session.apply(tr);
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
			if (!active_link && (session.selection?.type === 'text' || session.selection?.type === 'property')) {
				session.select_parent();
			}
			// Wait for selection change to settle before showing prompt
			setTimeout(() => {
				this.show_prompt = true;
			}, 0);
		}
	}
}
