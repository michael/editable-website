import {
	Session,
	define_keymap,
	SelectAllCommand,
	InsertDefaultNodeCommand,
	AddNewLineCommand,
	BreakTextNodeCommand,
	ToggleAnnotationCommand,
	UndoCommand,
	RedoCommand,
	SelectParentCommand
} from 'svedit';
import nanoid from './nanoid.js';
import {
	CycleLayoutCommand,
	CycleNodeTypeCommand,
	CycleColorsetCommand,
	ToggleLinkCommand,
	EditLinkCommand,
	ReplaceMediaCommand,
	EditImageCommand
} from './commands.svelte.js';
// Command imported from 'svedit' above

// System components
import Overlays from './components/Overlays.svelte';

// Node components
import Page from './components/Page.svelte';
import Nav from './components/Nav.svelte';
import NavItem from './components/NavItem.svelte';
import Footer from './components/Footer.svelte';
import FooterLinkColumn from './components/FooterLinkColumn.svelte';
import FooterLink from './components/FooterLink.svelte';

import Text from './components/Text.svelte';
import FourColumnsWithIntro from './components/FourColumnsWithIntro.svelte';
import DescriptiveMediaCard from './components/DescriptiveMediaCard.svelte';
import Chatbot from './components/Chatbot.svelte';
import Decoration from './components/Decoration.svelte';
import Hero from './components/Hero.svelte';
import Button from './components/Button.svelte';
import Image from './components/Image.svelte';
import Video from './components/Video.svelte';

import Strong from './components/Strong.svelte';
import Emphasis from './components/Emphasis.svelte';
import Highlight from './components/Highlight.svelte';
import Link from './components/Link.svelte';

import { document_schema } from '$lib/document_schema.js';
import { start_processing } from '$lib/client/asset_upload.js';
import { MEDIA_DEFAULTS } from '$lib/config.js';
import { set_properties } from 'svedit';
import { get_media_dimensions } from '$lib/client/media_dimensions.js';

/** @returns {'image' | 'video'} */
function get_media_type(file) {
	if (file.type.startsWith('video/')) return 'video';
	return 'image';
}

function select_inserted_label(tr) {
	tr.set_selection({
		type: 'text',
		path: [...tr.selection.path, tr.selection.focus_offset - 1, 'label'],
		anchor_offset: 0,
		focus_offset: 0
	});
}

function empty_annotated_text() {
	return { text: '', annotations: [] };
}

const chatbot_messages = [
	`Visitor: What can this presentation do?\nChatbot: It turns each slide into live editable content.\nVisitor: Can I change the columns too?\nChatbot: Yes. Switch a card into a chatbot and edit this script directly.`,
	`Visitor: Give me the short version.\nChatbot: Your website becomes the editor.\nVisitor: No dashboard?\nChatbot: No dashboard. Just click, type, save.`,
	`Visitor: Can this answer product questions?\nChatbot: Yes. Start with common questions, then connect richer knowledge later.\nVisitor: What should I write here?\nChatbot: A compact demo conversation that shows the value.`
];

function random_chatbot_message() {
	const message_index = Math.floor(Math.random() * chatbot_messages.length);
	return { text: chatbot_messages[message_index], annotations: [] };
}

function create_chatbot(tr) {
	const chatbot_id = nanoid();
	tr.create({
		id: chatbot_id,
		type: 'chatbot',
		message: random_chatbot_message()
	});

	return chatbot_id;
}

function create_descriptive_media_card(tr) {
	const media_id = nanoid();
	tr.create({
		id: media_id,
		type: 'image',
		...MEDIA_DEFAULTS
	});

	const body_text_id = nanoid();
	tr.create({
		id: body_text_id,
		type: 'text',
		layout: 4,
		content: empty_annotated_text()
	});

	const button_id = nanoid();
	tr.create({
		id: button_id,
		type: 'button',
		layout: 1,
		href: '',
		target: '_self',
		label: empty_annotated_text()
	});

	const card_id = nanoid();
	tr.create({
		id: card_id,
		type: 'descriptive_media_card',
		media: media_id,
		body: [body_text_id],
		buttons: [button_id]
	});

	return card_id;
}

/**
 * Replace a media node at the given path with a new file.
 * Reused by handle_media_paste and the toolbar's replace-image button.
 *
 * @param {import('svedit').Session} session
 * @param {any[]} path - path to the media node (image/video)
 * @param {File} file
 * @param {string} blob_url - a blob: or data: URL for immediate display
 */
async function replace_media(session, path, file, blob_url) {
	const node = session.get(path);
	if (node.type !== 'image' && node.type !== 'video') return;

	const media_type = get_media_type(file);
	const dims = await get_media_dimensions(file);

	// HACK: Make sure we have a proper before selection
	// Needed because of the focus steal in Toolbar.
	session.selection = { type: 'property', path };
	const tr = session.tr;

	if (media_type === node.type) {
		// Same type — replace src and dimensions, reset crop
		set_properties(tr, path, {
			...MEDIA_DEFAULTS,
			src: blob_url,
			mime_type: file.type,
			width: dims.width,
			height: dims.height
		});
	} else {
		// Different type — replace the entire node
		const new_node = {
			...MEDIA_DEFAULTS,
			id: nanoid(),
			type: media_type,
			src: blob_url,
			mime_type: file.type,
			width: dims.width,
			height: dims.height,
		};
		tr.create(new_node);
		const parent_path = path.slice(0, -1);
		const property_name = path[path.length - 1];
		tr.set([...parent_path, property_name], new_node.id);
	}

	// Set selection on the transaction so undo/redo restores it correctly
	tr.selection = { type: 'property', path };
	session.apply(tr);
	start_processing(blob_url, file);
}

// App-specific config object, always available via session.config for introspection
const session_config = {
	// Custom ID generator function
	generate_id: nanoid,
	// Provide definitions/overrides for system native components,
	// such as NodeCursorTrap or Overlays
	system_components: {
		Overlays
	},
	// Registry of components for each node type
	node_components: {
		Page,
		Nav,
		NavItem,
		Footer,
		FooterLinkColumn,
		FooterLink,
		Hero,
		Button,
		Text,
		Image,
		Video,
		FourColumnsWithIntro,
		DescriptiveMediaCard,
		Chatbot,
		Decoration,
		Strong,
		Emphasis,
		Highlight,
		Link
	},
	replace_media,
	handle_property_deletion: (tr, path) => {
		const property_definition = tr.inspect(path);
		if (property_definition?.type !== 'node') return;

		const target_node = tr.get(path);
		if (target_node?.type !== 'image' && target_node?.type !== 'video') return;

		set_properties(tr, [target_node.id], MEDIA_DEFAULTS);
	},
	handle_media_paste: async (session, pasted_media) => {
		if (session.selection.type === 'property') {
			const node = session.get(session.selection.path);
			if (node.type === 'image' || node.type === 'video') {
				await replace_media(session, session.selection.path, pasted_media[0].blob, pasted_media[0].data_url);
			}
			return null;
		} else {
			const target_node_type = session.can_insert('decoration')
				? 'decoration'
				: session.can_insert('descriptive_media_card')
					? 'descriptive_media_card'
					: null;

			if (!target_node_type) return null;

			const pasted_json = { main_nodes: [], nodes: {} };
			for (let i = 0; i < pasted_media.length; i++) {
				const pasted_item = pasted_media[i];
				const blob_url = pasted_item.data_url;
				const media_type = get_media_type(pasted_item.blob);

				const dims = await get_media_dimensions(pasted_item.blob);
				const width = dims.width;
				const height = dims.height;

				pasted_json.nodes['node_media_' + i] = {
					...MEDIA_DEFAULTS,
					id: 'node_media_' + i,
					type: media_type,
					src: blob_url,
					mime_type: pasted_item.blob.type,
					width,
					height,
					alt: ''
				};

				if (target_node_type === 'decoration') {
					pasted_json.nodes['node_' + i] = {
						id: 'node_' + i,
						type: 'decoration',
						media_max_width: 0,
						media_aspect_ratio: 0,
						media: 'node_media_' + i
					};
				} else {
					pasted_json.nodes['node_text_' + i] = {
						id: 'node_text_' + i,
						type: 'text',
						layout: 4,
						content: { text: '', annotations: [] }
					};
					pasted_json.nodes['node_button_' + i] = {
						id: 'node_button_' + i,
						type: 'button',
						layout: 1,
						href: '',
						target: '_self',
						label: { text: '', annotations: [] }
					};
					pasted_json.nodes['node_' + i] = {
						id: 'node_' + i,
						type: 'descriptive_media_card',
						media: 'node_media_' + i,
						body: ['node_text_' + i],
						buttons: ['node_button_' + i]
					};
				}
				pasted_json.main_nodes.push('node_' + i);

				// Start background processing (hash + resize/encode)
				start_processing(blob_url, pasted_item.blob);
			}
			return pasted_json;
		}
	},

	// HTML exporters for different node types
	html_exporters: {
		text: (node) => {
			const tag_name =
				{
					1: 'p',
					2: 'h1',
					3: 'h2',
					4: 'h3',
					5: 'p'
				}[node.layout] ?? 'p';
			return `<${tag_name}>${node.content.text}</${tag_name}>\n`;
		}
	},
	node_layouts: {
		text: 5,
		decoration: 1,
		nav_item: 2,
		button: 2,
		hero: 4
	},

	/**
	 * Factory function to create Svedit commands and keymap.
	 * Called by Svedit component with the svedit context.
	 *
	 * @param {object} context - The svedit context with session, editable, canvas.
	 * @returns {{ commands: object, keymap: object }}
	 */
	create_commands_and_keymap: (context) => {
		// Create command instances with the provided context
		const commands = {
			select_all: new SelectAllCommand(context),
			insert_default_node: new InsertDefaultNodeCommand(context),
			add_new_line: new AddNewLineCommand(context),
			break_text_node: new BreakTextNodeCommand(context),
			toggle_strong: new ToggleAnnotationCommand('strong', context),
			toggle_emphasis: new ToggleAnnotationCommand('emphasis', context),
			toggle_highlight: new ToggleAnnotationCommand('highlight', context),
			undo: new UndoCommand(context),
			redo: new RedoCommand(context),
			select_parent: new SelectParentCommand(context),
			cycle_layout_next: new CycleLayoutCommand('next', context),
			cycle_layout_previous: new CycleLayoutCommand('previous', context),
			cycle_node_type_next: new CycleNodeTypeCommand('next', context),
			cycle_node_type_previous: new CycleNodeTypeCommand('previous', context),
			toggle_link: new ToggleLinkCommand(context),
			edit_link: new EditLinkCommand(context),
			edit_image: new EditImageCommand(context),
			cycle_colorset: new CycleColorsetCommand(context),
			replace_media: new ReplaceMediaCommand(context)
		};

		// Define keymap binding keys to commands
		const keymap = define_keymap({
			'meta+a,ctrl+a': [commands.select_all],
			enter: [commands.replace_media, commands.break_text_node, commands.insert_default_node],
			// In case of a node cursor, fall back to inserting a default node. This is needed
			// because on iOS selecting a node cursor triggers auto capitalization (shift pressed)
			'shift+enter': [commands.replace_media, commands.add_new_line, commands.insert_default_node],
			'alt+enter': [commands.edit_image],
			'meta+b,ctrl+b': [commands.toggle_strong],
			'meta+i,ctrl+i': [commands.toggle_emphasis],
			'meta+u,ctrl+u': [commands.toggle_highlight],
			'meta+z,ctrl+z': [commands.undo],
			'meta+shift+z,ctrl+shift+z': [commands.redo],
			escape: [commands.select_parent],
			'ctrl+shift+arrowright': [commands.cycle_layout_next],
			'ctrl+shift+arrowleft': [commands.cycle_layout_previous],
			'ctrl+shift+arrowdown': [commands.cycle_node_type_next],
			'ctrl+shift+arrowup': [commands.cycle_node_type_previous],

			'meta+k,ctrl+k': [commands.edit_link, commands.toggle_link],
			'ctrl+shift+c': [commands.cycle_colorset]
		});

		return { commands, keymap };
	},

	// Custom functions to insert new blank nodes and set the selection depending on the intended behavior.
	inserters: {
		text: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_text = {
				id: nanoid(),
				type: 'text',
				layout,
				content
			};
			tr.create(new_text);
			tr.insert_nodes([new_text.id]);
			tr.set_selection({
				type: 'text',
				path: [...tr.selection.path, tr.selection.focus_offset - 1, 'content'],
				anchor_offset: 0,
				focus_offset: 0
			});
		},

		four_columns_with_intro: function (tr) {
			const intro_text_id = nanoid();
			tr.create({
				id: intro_text_id,
				type: 'text',
				layout: 1,
				content: empty_annotated_text()
			});

			const column_ids = [];
			for (let i = 0; i < 4; i++) {
				column_ids.push(create_descriptive_media_card(tr));
			}

			const section_id = nanoid();
			tr.create({
				id: section_id,
				type: 'four_columns_with_intro',
				intro: [intro_text_id],
				columns: column_ids
			});

			tr.insert_nodes([section_id]);
		},
		descriptive_media_card: function (tr) {
			const card_id = create_descriptive_media_card(tr);
			tr.insert_nodes([card_id]);
			tr.set_selection({
				type: 'node',
				path: [...tr.selection.path],
				anchor_offset: tr.selection.focus_offset,
				focus_offset: tr.selection.focus_offset
			});
		},
		chatbot: function (tr) {
			const chatbot_id = create_chatbot(tr);
			tr.insert_nodes([chatbot_id]);
			tr.set_selection({
				type: 'text',
				path: [...tr.selection.path, tr.selection.focus_offset - 1, 'message'],
				anchor_offset: 0,
				focus_offset: 0
			});
		},
		decoration: function (tr) {
			const new_decoration_id = tr.build('new_decoration', {
				decoration_media: {
					id: 'decoration_media',
					type: 'image',
					...MEDIA_DEFAULTS
				},
				new_decoration: {
					id: 'new_decoration',
					type: 'decoration',
					media_max_width: 0,
					media_aspect_ratio: 0,
					media: 'decoration_media'
				}
			});

			tr.insert_nodes([new_decoration_id]);
		},
		nav_item: function (tr) {
			const new_nav_item_id = tr.build('new_nav_item', {
				new_nav_item: {
					id: 'new_nav_item',
					type: 'nav_item'
				}
			});

			tr.insert_nodes([new_nav_item_id]);
			select_inserted_label(tr);
		},
		hero: function (tr) {
			const new_hero_id = tr.build('new_hero', {
				new_hero: {
					id: 'new_hero',
					type: 'hero',
					layout: 1,
					colorset: 0,
					title: { text: '', annotations: [] },
					description: { text: '', annotations: [] },
					buttons: []
				}
			});

			tr.insert_nodes([new_hero_id]);
		},
		button: function (tr) {
			const new_button_id = tr.build('new_button', {
				new_button: {
					id: 'new_button',
					type: 'button'
				}
			});

			tr.insert_nodes([new_button_id]);
			select_inserted_label(tr);
		},
		footer_link: function (tr) {
			const new_footer_link_id = tr.build('new_footer_link', {
				new_footer_link: {
					id: 'new_footer_link',
					type: 'footer_link'
				}
			});

			tr.insert_nodes([new_footer_link_id]);
			select_inserted_label(tr);
		},
		footer_link_column: function (tr) {
			const new_footer_link_column_id = tr.build('new_footer_link_column', {
				new_footer_link: {
					id: 'new_footer_link',
					type: 'footer_link'
				},
				new_footer_link_column: {
					id: 'new_footer_link_column',
					type: 'footer_link_column',
					footer_links: ['new_footer_link']
				}
			});

			tr.insert_nodes([new_footer_link_column_id]);
		}
	}
};

export function create_session(doc) {
	const session = new Session(document_schema, doc, session_config);
	return session;
}
