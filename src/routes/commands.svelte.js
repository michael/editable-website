import { Command, is_selection_collapsed, serialize_path } from 'svedit';
import {
	get_closest_switchable_layout,
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
 * @param {string | null} [new_layout]
 */
function replace_node_with_equivalent_type(
	tr,
	node_array_path,
	node_index,
	node,
	new_type,
	new_layout = null
) {
	const node_schema = tr.schema[node.type];
	const new_node_schema = tr.schema[new_type];
	const new_node = {
		id: tr.generate_id(),
		type: new_type
	};

	for (const property_name of Object.keys(node_schema.properties)) {
		if (property_name in new_node_schema.properties) {
			new_node[property_name] = structuredClone(node[property_name]);
		}
	}
	if (new_layout && 'layout' in new_node_schema.properties) new_node.layout = new_layout;

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
	closest_switchable_layout = $derived(get_closest_switchable_layout(this.context.session));

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
		const layouts = session.schema[node.type].properties.layout.values;
		const current_layout_index = layouts.indexOf(node.layout);
		if (current_layout_index === -1) return;

		const offset = this.direction === 'next' ? 1 : -1;
		const new_layout_index = (current_layout_index + offset + layouts.length) % layouts.length;
		const new_layout = layouts[new_layout_index];

		this.execute_with_layout(new_layout);
	}

	/** @param {string} new_layout */
	execute_with_layout(new_layout) {
		const session = this.context.session;
		const closest_switchable_layout = this.closest_switchable_layout;
		if (!closest_switchable_layout) return;

		const { node, node_array_path, node_index } = closest_switchable_layout;
		const layouts = session.schema[node.type]?.properties?.layout?.values ?? [];
		if (!layouts.includes(new_layout) || new_layout === node.layout) return;

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
		const cycle_node_state = this.cycle_node_state;
		if (!cycle_node_state || cycle_node_state.available_types.length === 0) return;

		const { available_types } = cycle_node_state;
		const new_type = this.direction === 'next' ? available_types[0] : available_types.at(-1);
		this.execute_with_type(new_type);
	}

	/**
	 * Replace the derived switchable node with an explicitly chosen type/variant.
	 *
	 * @param {string} new_type
	 * @param {string | null} [new_layout]
	 */
	execute_with_type(new_type, new_layout = null) {
		const session = this.context.session;
		const cycle_node_state = this.cycle_node_state;
		if (!cycle_node_state?.available_types.includes(new_type)) return;

		const { node, node_array_path, node_index } = cycle_node_state;
		const allowed_layouts = session.schema[new_type]?.properties?.layout?.values ?? [];
		const selected_layout = allowed_layouts.includes(new_layout) ? new_layout : null;
		const tr = session.tr;

		tr.set_selection({
			type: 'node',
			path: node_array_path,
			anchor_offset: node_index,
			focus_offset: node_index + 1
		});

		if (is_node_subtree_empty(session, node)) {
			session.config.inserters[new_type](tr);
			const replacement_id = tr.get(node_array_path)?.nodes?.[node_index];
			if (replacement_id && selected_layout && 'layout' in tr.schema[new_type].properties) {
				tr.set([replacement_id, 'layout'], selected_layout);
			}
		} else {
			replace_node_with_equivalent_type(
				tr,
				node_array_path,
				node_index,
				node,
				new_type,
				selected_layout
			);
		}

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
 * Command that toggles link marks on text selections.
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
		const selected_marks = this.context.session.selected_marks;
		return selected_marks.length === 1 && selected_marks[0].node.type === 'link';
	}

	is_enabled() {
		const { session, editable } = this.context;

		if (!editable || session.selection?.type !== 'text') return false;

		const selected_marks = session.selected_marks;
		const can_remove_link = selected_marks.length === 1 && selected_marks[0].node.type === 'link';
		const can_create_link =
			selected_marks.length === 0 && !is_selection_collapsed(session.selection);

		return can_remove_link || can_create_link;
	}

	execute() {
		if (!this.is_enabled()) return;

		const session = this.context.session;
		const selected_marks = session.selected_marks;
		const has_selected_link = selected_marks.length === 1 && selected_marks[0].node.type === 'link';

		if (has_selected_link) {
			// Delete link
			session.apply(session.tr.toggle_mark('link'));
		} else {
			// Show prompt for creating link
			this.show_prompt = true;
		}
	}
}

export class ToggleAccordionCommand extends Command {
	is_enabled() {
		const session = this.context.session;
		if (!session.selection) return false;
		const path = session.selection.path;
		const property_definition = session.inspect(path);

		if (property_definition?.type === 'text' && property_definition.name === 'title') {
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

		// Check for active link mark (text link)
		const active_link = session.active_mark;
		if (active_link?.node.type === 'link') return true;

		return false;
	}

	execute() {
		if (this.is_enabled()) {
			const { session } = this.context;
			// Select the parent node if a property is selected (but not for text link marks)
			const active_link = session.active_mark?.node.type === 'link';
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
