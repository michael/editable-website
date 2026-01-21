import { Command, is_selection_collapsed } from 'svedit';
import { get_layout_node } from './app_utils.js';

/**
 * Command that cycles through available layouts for a node.
 * Direction can be 'next' or 'previous'.
 */
export class CycleLayoutCommand extends Command {
	layout_node = $derived(get_layout_node(this.context.session));

	constructor(direction, context) {
		super(context);
		this.direction = direction;
	}

	is_enabled() {
		if (!this.context.editable || !this.layout_node) return false;

		const layout_count = this.context.session.config.node_layouts?.[this.layout_node.type];
		return layout_count > 1 && this.layout_node?.layout;
	}

	execute() {
		const session = this.context.session;
		const node = this.layout_node;
		const layout_count = session.config.node_layouts[node.type];

		let new_layout;
		if (this.direction === 'next') {
			new_layout = (node.layout % layout_count) + 1;
		} else {
			new_layout = ((node.layout - 2 + layout_count) % layout_count) + 1;
		}

		const tr = session.tr;
		tr.set([node.id, 'layout'], new_layout);
		session.apply(tr);
	}
}

/**
 * Command that cycles through available node types in a node array.
 * Direction can be 'next' or 'previous'.
 */
export class CycleNodeTypeCommand extends Command {
	constructor(direction, context) {
		super(context);
		this.direction = direction;
	}

	is_enabled() {
		const session = this.context.session;

		if (!this.context.editable || !session.selection) return false;

		// Need to check if we have a node selection or can select parent
		let selection = session.selection;
		if (selection.type !== 'node') {
			// Would need to select parent first
			return true; // Let execute handle this
		}

		const node_array_schema = session.inspect(selection.path);
		if (node_array_schema.type !== 'node_array') return false;

		// Need at least 2 types to cycle
		return node_array_schema.node_types?.length > 1;
	}

	execute() {
		const session = this.context.session;

		// Ensure we have a node selection
		if (session.selection.type !== 'node') {
			session.select_parent();
		}

		const node = session.selected_node;
		const old_selection = structuredClone(session.selection);
		const node_array_schema = session.inspect(session.selection.path);

		// If we are not dealing with a node selection in a container, return
		if (node_array_schema.type !== 'node_array') return;

		const current_type_index = node_array_schema.node_types.indexOf(node.type);
		let new_type_index;

		if (this.direction === 'next') {
			new_type_index = (current_type_index + 1) % node_array_schema.node_types.length;
		} else {
			new_type_index =
				(current_type_index - 1 + node_array_schema.node_types.length) %
				node_array_schema.node_types.length;
		}

		const new_type = node_array_schema.node_types[new_type_index];
		const tr = session.tr;
		session.config.inserters[new_type](tr);
		tr.set_selection(old_selection);
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
