import {
	Session,
	define_document_schema,
	define_keymap,
	SelectAllCommand,
	InsertDefaultNodeCommand,
	AddNewLineCommand,
	BreakTextNodeCommand,
	UndoCommand,
	RedoCommand,
	SelectParentCommand
} from 'svedit';
import nanoid from './nanoid.js';
import {
	CycleLayoutCommand,
	CycleNodeTypeCommand,
	ResetImageCommand,
	ToggleLinkCommand
} from './commands.svelte.js';

// System components
import NodeCursorTrap from './components/NodeCursorTrap.svelte';
import Overlays from './components/Overlays.svelte';

// Node components
import Page from './components/Page.svelte';
import Nav from './components/Nav.svelte';
import NavItem from './components/NavItem.svelte';
import Footer from './components/Footer.svelte';
import FooterLinkColumn from './components/FooterLinkColumn.svelte';
import FooterLink from './components/FooterLink.svelte';

import Prose from './components/Prose.svelte';
import Heading from './components/Heading.svelte';
import Paragraph from './components/Paragraph.svelte';
import Gallery from './components/Gallery.svelte';
import GalleryItem from './components/GalleryItem.svelte';
import LinkCollection from './components/LinkCollection.svelte';
import LinkCollectionItem from './components/LinkCollectionItem.svelte';
import Figure from './components/Figure.svelte';
import Feature from './components/Feature.svelte';
import Image from './components/Image.svelte';

import Strong from './components/Strong.svelte';
import Emphasis from './components/Emphasis.svelte';
import Highlight from './components/Highlight.svelte';
import Link from './components/Link.svelte';

const ALL_ANNOTATIONS = ['strong', 'emphasis', 'highlight', 'link'];
const TITLE_ANNOTATIONS = ['emphasis', 'highlight'];

const document_schema = define_document_schema({
	page: {
		kind: 'document',
		properties: {
			body: {
				type: 'node_array',
				node_types: ['prose', 'figure', 'gallery', 'feature'],
				default_node_type: 'prose'
			},
			nav: {
				type: 'node',
				node_types: ['nav'],
				default_node_type: 'nav'
			},
			footer: {
				type: 'node',
				node_types: ['footer'],
				default_node_type: 'footer'
			}
		}
	},
	footer: {
		kind: 'block',
		properties: {
			copyright: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: true
			},
			footer_link_columns: {
				type: 'node_array',
				node_types: ['footer_link_column'],
				default_node_type: 'footer_link_column'
			}
		}
	},
	footer_link_column: {
		kind: 'block',
		properties: {
			label: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: false
			},
			footer_links: {
				type: 'node_array',
				node_types: ['footer_link'],
				default_node_type: 'footer_link'
			}
		}
	},
	footer_link: {
		kind: 'block',
		properties: {
			url: { type: 'string' },
			label: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: false
			}
		}
	},
	nav: {
		kind: 'block',
		properties: {
			nav_items: {
				type: 'node_array',
				node_types: ['nav_item'],
				default_node_type: 'nav_item'
			}
		}
	},
	nav_item: {
		kind: 'block',
		properties: {
			url: { type: 'string' },
			label: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: false
			}
		}
	},
	prose: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			content: {
				type: 'node_array',
				node_types: ['heading', 'paragraph'],
				default_node_type: 'paragraph'
			}
		}
	},
	paragraph: {
		kind: 'text',
		properties: {
			content: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	heading: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1 },
			content: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: false
			}
		}
	},
	image: {
		kind: 'block',
		properties: {
			src: { type: 'string' },
			width: { type: 'integer' },
			height: { type: 'integer' },
			alt: { type: 'string' },
			focal_point_x: { type: 'number', default: 0 },
			focal_point_y: { type: 'number', default: 0 },
			scale: { type: 'number', default: 1.0 },
			object_fit: { type: 'string', default: 'cover' }
		}
	},
	figure: {
		kind: 'block',
		properties: {
			image: {
				type: 'node',
				node_types: ['image'],
				default_node_type: 'image'
			}
		}
	},
	gallery: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			gallery_items: {
				type: 'node_array',
				node_types: ['gallery_item']
			}
		}
	},
	gallery_item: {
		kind: 'block',
		properties: {
			image: {
				type: 'node',
				node_types: ['image'],
				default_node_type: 'image'
			}
		}
	},
	link_collection: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			link_collection_items: {
				type: 'node_array',
				node_types: ['link_collection_item']
			}
		}
	},
	link_collection_item: {
		kind: 'block',
		properties: {
			href: { type: 'string' },
			preline: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: false
			},
			title: {
				type: 'annotated_text',
				node_types: TITLE_ANNOTATIONS,
				allow_newlines: false
			},
			description: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	feature: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			image: {
				type: 'node',
				node_types: ['image'],
				default_node_type: 'image'
			},
			title: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: false
			},
			description: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},

	link: {
		kind: 'annotation',
		properties: {
			href: { type: 'string' }
		}
	},
	strong: {
		kind: 'annotation',
		properties: {}
	},
	emphasis: {
		kind: 'annotation',
		properties: {}
	},
	highlight: {
		kind: 'annotation',
		properties: {}
	}
});

// App-specific config object, always available via session.config for introspection
const session_config = {
	// Custom ID generator function
	generate_id: nanoid,
	// Provide definitions/overrides for system native components,
	// such as NodeCursorTrap or Overlays
	system_components: {
		NodeCursorTrap,
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
		Prose,
		Heading,
		Paragraph,
		Image,
		Figure,
		Feature,
		Gallery,
		GalleryItem,
		LinkCollection,
		LinkCollectionItem,
		Strong,
		Emphasis,
		Highlight,
		Link
	},
	handle_image_paste: async (session, pasted_images) => {
		// ATTENTION: In a real-world-app, you may want to upload `pasted_images` here,
		// before referencing them from the document.
		if (session.selection.type === 'property') {
			const node = session.get(session.selection.path);
			if (node.type === 'image') {
				const tr = session.tr;
				tr.set([...session.selection.path, 'src'], pasted_images[0].data_url);
				session.apply(tr);
			}
			return null;
		} else {
			const pasted_json = { main_nodes: [], nodes: {} };
			// When cursor inside an image grid we want to insert an image_grid_item
			// otherwise we want to insert a story, as that is the only body node,
			// that can carry an image.
			let target_node_type;
			if (session.can_insert('gallery_item')) {
				target_node_type = 'gallery_item';
			} else {
				target_node_type = 'figure';
			}
			for (let i = 0; i < pasted_images.length; i++) {
				const pasted_image = pasted_images[i];

				pasted_json.nodes['node_image_' + i] = {
					id: 'node_image_' + i,
					type: 'image',
					src: pasted_image.data_url,
					width: 800,
					height: 600,
					alt: 'Sample image',
					scale: 1.0,
					focal_point_x: 0.5,
					focal_point_y: 0.5,
					object_fit: 'cover'
				};
				pasted_json.nodes['node_' + i] = {
					id: 'node_' + i,
					type: target_node_type,
					image: 'node_image_' + i
				};
				pasted_json.main_nodes.push('node_' + i);
			}
			return pasted_json;
		}
	},

	// HTML exporters for different node types
	html_exporters: {
		prose: (node, session, html_exporters) => {
			let html = '<div class="prose">\n';
			for (const child_id of node.content) {
				const child = session.get(child_id);
				const exporter = html_exporters[child.type];
				if (exporter) {
					html += exporter(child, session, html_exporters);
				}
			}
			html += '</div>\n';
			return html;
		},
		paragraph: (node) => {
			return `<p>${node.content.text}</p>\n`;
		},
		heading: (node) => {
			const tag_name =
				{
					1: 'h1',
					2: 'h2',
					3: 'h3'
				}[node.layout] ?? 'h2';
			return `<${tag_name}>${node.content.text}</${tag_name}>\n`;
		}
	},
	node_layouts: {
		prose: 3,
		paragraph: 1,
		heading: 3,
		figure: 1,
		feature: 6,
		gallery: 4
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
			undo: new UndoCommand(context),
			redo: new RedoCommand(context),
			select_parent: new SelectParentCommand(context),
			cycle_layout_next: new CycleLayoutCommand('next', context),
			cycle_layout_previous: new CycleLayoutCommand('previous', context),
			cycle_node_type_next: new CycleNodeTypeCommand('next', context),
			cycle_node_type_previous: new CycleNodeTypeCommand('previous', context),
			reset_image: new ResetImageCommand(context),
			toggle_link: new ToggleLinkCommand(context)
		};

		// Define keymap binding keys to commands
		const keymap = define_keymap({
			'meta+a,ctrl+a': [commands.select_all],
			enter: [commands.break_text_node, commands.insert_default_node],
			// In case of a node cursor, fall back to inserting a default node. This is needed
			// because on iOS selecting a node cursor triggers auto capitalization (shift pressed)
			'shift+enter': [commands.add_new_line, commands.insert_default_node],
			'meta+z,ctrl+z': [commands.undo],
			'meta+shift+z,ctrl+shift+z': [commands.redo],
			escape: [commands.select_parent],
			'ctrl+alt+arrowright': [commands.cycle_layout_next],
			'ctrl+alt+arrowleft': [commands.cycle_layout_previous],
			'ctrl+alt+arrowdown': [commands.cycle_node_type_next],
			'ctrl+alt+arrowup': [commands.cycle_node_type_previous],
			backspace: [commands.reset_image],
			// Fallback for iOS, as property selection triggers auto capitalization (shift pressed)
			'shift+backspace': [commands.reset_image],
			'meta+k,ctrl+k': [commands.toggle_link]
		});

		return { commands, keymap };
	},

	// Custom functions to insert new "blank" nodes and setting the selection depening on the
	// intended behavior.
	inserters: {
		prose: function (tr) {
			const new_heading = {
				id: nanoid(),
				type: 'heading',
				layout: 1,
				content: { text: '', annotations: [] }
			};
			tr.create(new_heading);
			const new_paragraph = {
				id: nanoid(),
				type: 'paragraph',
				content: { text: '', annotations: [] }
			};
			tr.create(new_paragraph);
			const new_prose = {
				id: nanoid(),
				type: 'prose',
				layout: 1,
				content: [new_heading.id, new_paragraph.id]
			};
			tr.create(new_prose);
			tr.insert_nodes([new_prose.id]);
			// NOTE: Relies on insert_nodes selecting the newly inserted node(s)
			// tr.set_selection({
			// 	type: 'text',
			// 	path: [...tr.selection.path, tr.selection.focus_offset - 1, 'content', 0, 'content'],
			// 	anchor_offset: 0,
			// 	focus_offset: 0
			// });
		},
		paragraph: function (tr, content = { text: '', annotations: [] }) {
			const new_paragraph = {
				id: nanoid(),
				type: 'paragraph',
				content
			};
			tr.create(new_paragraph);
			tr.insert_nodes([new_paragraph.id]);
			// NOTE: Relies on insert_nodes selecting the newly inserted node(s)
			tr.set_selection({
				type: 'text',
				path: [...tr.selection.path, tr.selection.focus_offset - 1, 'content'],
				anchor_offset: 0,
				focus_offset: 0
			});
		},
		heading: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_heading = {
				id: nanoid(),
				type: 'heading',
				layout,
				content
			};
			tr.create(new_heading);
			tr.insert_nodes([new_heading.id]);
			// NOTE: Relies on insert_nodes selecting the newly inserted node(s)
			tr.set_selection({
				type: 'text',
				path: [...tr.selection.path, tr.selection.focus_offset - 1, 'content'],
				anchor_offset: 0,
				focus_offset: 0
			});
		},
		feature: function (tr) {
			const new_feature_id = tr.build('new_feature', {
				feature_image: {
					id: 'feature_image',
					type: 'image',
					src: '',
					width: 800,
					height: 600,
					alt: 'Feature image',
					scale: 1.0,
					focal_point_x: 0.5,
					focal_point_y: 0.5,
					object_fit: 'cover'
				},
				new_feature: {
					id: 'new_feature',
					type: 'feature',
					layout: 1,
					image: 'feature_image',
					title: { text: '', annotations: [] },
					description: { text: '', annotations: [] }
				}
			});

			tr.insert_nodes([new_feature_id]);
			// Set selection to the title field
			// tr.set_selection({
			// 	type: 'text',
			// 	path: [...tr.selection.path, tr.selection.focus_offset - 1, 'title'],
			// 	anchor_offset: 0,
			// 	focus_offset: 0
			// });
		},
		figure: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_figure_id = tr.build('new_figure', {
				image_one: {
					id: 'image_one',
					type: 'image',
					src: '',
					width: 800,
					height: 600,
					alt: 'Image One'
				},
				new_figure: {
					id: 'new_figure',
					type: 'figure',
					image: 'image_one'
				}
			});

			tr.insert_nodes([new_figure_id]);
			// NOTE: Relies on insert_nodes selecting the newly inserted node(s)
			// tr.set_selection({
			//   type: 'text',
			//   path: [...tr.selection.path, tr.selection.focus_offset - 1 , 'content'],
			//   anchor_offset: 0,
			//   focus_offset: 0
			// });
		},
		nav_item: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_nav_item_id = tr.build('new_nav_item', {
				new_nav_item: {
					id: 'new_nav_item',
					type: 'nav_item'
				}
			});

			tr.insert_nodes([new_nav_item_id]);
			// NOTE: Relies on insert_nodes selecting the newly inserted node(s)
			// tr.set_selection({
			//   type: 'text',
			//   path: [...tr.selection.path, tr.selection.focus_offset - 1 , 'content'],
			//   anchor_offset: 0,
			//   focus_offset: 0
			// });
		},
		footer_link: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_footer_link_id = tr.build('new_footer_link', {
				new_footer_link: {
					id: 'new_footer_link',
					type: 'footer_link'
				}
			});

			tr.insert_nodes([new_footer_link_id]);
			// NOTE: Relies on insert_nodes selecting the newly inserted node(s)
			// tr.set_selection({
			//   type: 'text',
			//   path: [...tr.selection.path, tr.selection.focus_offset - 1 , 'content'],
			//   anchor_offset: 0,
			//   focus_offset: 0
			// });
		},
		footer_link_column: function (tr, content = { text: '', annotations: [] }, layout = 1) {
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
			// NOTE: Relies on insert_nodes selecting the newly inserted node(s)
			// tr.set_selection({
			//   type: 'text',
			//   path: [...tr.selection.path, tr.selection.focus_offset - 1 , 'content'],
			//   anchor_offset: 0,
			//   focus_offset: 0
			// });
		},

		gallery: function (tr) {
			const new_gallery_items = [];
			for (let i = 0; i < 6; i++) {
				const gallery_item_image = {
					id: nanoid(),
					type: 'image',
					src: '',
					width: 800,
					height: 600,
					alt: 'Sample image',
					scale: 1.0,
					focal_point_x: 0.5,
					focal_point_y: 0.5,
					object_fit: 'cover'
				};
				tr.create(gallery_item_image);
				const gallery_item = {
					id: nanoid(),
					type: 'gallery_item',
					image: gallery_item_image.id
				};
				tr.create(gallery_item);
				new_gallery_items.push(gallery_item.id);
			}
			const new_gallery = {
				id: nanoid(),
				type: 'gallery',
				layout: 1,
				gallery_items: new_gallery_items
			};
			tr.create(new_gallery);
			tr.insert_nodes([new_gallery.id]);
		},
		gallery_item: function (tr) {
			const gallery_item_image = {
				id: nanoid(),
				type: 'image',
				src: '',
				width: 800,
				height: 600,
				alt: 'Sample image',
				scale: 1.0,
				focal_point_x: 0.5,
				focal_point_y: 0.5,
				object_fit: 'cover'
			};
			tr.create(gallery_item_image);
			const new_gallery_item = {
				id: nanoid(),
				type: 'gallery_item',
				image: gallery_item_image.id
			};
			tr.create(new_gallery_item);
			tr.insert_nodes([new_gallery_item.id]);
			tr.set_selection({
				type: 'node',
				path: [...tr.selection.path],
				anchor_offset: tr.selection.focus_offset,
				focus_offset: tr.selection.focus_offset
			});
		},

		link_collection: function (tr) {
			const new_link_collection_items = [];
			for (let i = 0; i < 3; i++) {
				const link_collection_item = {
					id: nanoid(),
					type: 'link_collection_item',
					href: '',
					preline: { text: 'Preline', annotations: [] },
					title: { text: 'Title', annotations: [] },
					description: { text: 'Description text goes here.', annotations: [] }
				};
				tr.create(link_collection_item);
				new_link_collection_items.push(link_collection_item.id);
			}
			const new_link_collection = {
				id: nanoid(),
				type: 'link_collection',
				layout: 1,
				link_collection_items: new_link_collection_items
			};
			tr.create(new_link_collection);
			tr.insert_nodes([new_link_collection.id]);
		},

		link_collection_item: function (tr) {
			const new_link_collection_item = {
				id: nanoid(),
				type: 'link_collection_item',
				href: '',
				preline: { text: 'Preline', annotations: [] },
				title: { text: 'Title', annotations: [] },
				description: { text: 'Description text goes here.', annotations: [] }
			};
			tr.create(new_link_collection_item);
			tr.insert_nodes([new_link_collection_item.id]);
			tr.set_selection({
				type: 'node',
				path: [...tr.selection.path],
				anchor_offset: tr.selection.focus_offset,
				focus_offset: tr.selection.focus_offset
			});
		}
	}
};

export function create_session(doc) {
	const session = new Session(document_schema, doc, session_config);
	return session;
}
