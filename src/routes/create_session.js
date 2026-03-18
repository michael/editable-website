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
	ResetImageCommand,
	ToggleLinkCommand,
	EditLinkCommand
} from './commands.svelte.js';

// System components
import Overlays from './components/Overlays.svelte';

// Node components
import Page from './components/Page.svelte';
import Nav from './components/Nav.svelte';
import NavItem from './components/NavItem.svelte';
import Footer from './components/Footer.svelte';
import FooterLinkColumn from './components/FooterLinkColumn.svelte';
import FooterLink from './components/FooterLink.svelte';

import Prose from './components/Prose.svelte';
import Text from './components/Text.svelte';
import Gallery from './components/Gallery.svelte';
import GalleryItem from './components/GalleryItem.svelte';
import LinkCollection from './components/LinkCollection.svelte';
import LinkCollectionItem from './components/LinkCollectionItem.svelte';
import Figure from './components/Figure.svelte';
import Decoration from './components/Decoration.svelte';
import Feature from './components/Feature.svelte';
import Hero from './components/Hero.svelte';
import Button from './components/Button.svelte';
import Image from './components/Image.svelte';
import Video from './components/Video.svelte';

import Strong from './components/Strong.svelte';
import Emphasis from './components/Emphasis.svelte';
import Highlight from './components/Highlight.svelte';
import Link from './components/Link.svelte';

import { document_schema } from '$lib/document_schema.js';
import { start_processing } from '$lib/client/asset-upload.js';
import { MEDIA_DEFAULTS } from '$lib/config.js';
import { set_properties } from 'svedit';

/** @returns {'image' | 'video'} */
function get_media_type(file) {
	if (file.type.startsWith('video/')) return 'video';
	return 'image';
}

/**
 * Extract image dimensions using a temporary <img> element.
 *
 * @param {Blob} blob
 * @returns {Promise<{ width: number, height: number }>}
 */
function get_image_dimensions(blob) {
	return new Promise((resolve, reject) => {
		const img = new window.Image();
		const object_url = URL.createObjectURL(blob);

		img.onload = () => {
			URL.revokeObjectURL(object_url);
			resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(object_url);
			reject(new Error('Failed to load image'));
		};

		img.src = object_url;
	});
}

/**
 * Extract video dimensions using a temporary <video> element.
 *
 * @param {Blob} blob
 * @returns {Promise<{ width: number, height: number }>}
 */
function get_video_dimensions(blob) {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		const object_url = URL.createObjectURL(blob);

		video.onloadedmetadata = () => {
			URL.revokeObjectURL(object_url);
			resolve({ width: video.videoWidth, height: video.videoHeight });
		};

		video.onerror = () => {
			URL.revokeObjectURL(object_url);
			reject(new Error('Failed to load video metadata'));
		};

		video.src = object_url;
	});
}

/**
 * Extract dimensions from a media file (image or video).
 *
 * @param {File} file
 * @returns {Promise<{ width: number, height: number }>}
 */
function get_media_dimensions(file) {
	if (file.type.startsWith('video/')) return get_video_dimensions(file);
	return get_image_dimensions(file);
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
		Prose,
		Text,
		Image,
		Video,
		Figure,
		Decoration,
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
	handle_media_paste: async (session, pasted_media) => {
		if (session.selection.type === 'property') {
			const node = session.get(session.selection.path);
			if (node.type === 'image' || node.type === 'video') {
				const file = pasted_media[0].blob;
				const media_type = get_media_type(file);
				const blob_url = pasted_media[0].data_url;
				const dims = await get_media_dimensions(file);
				const tr = session.tr;

				if (media_type === node.type) {
					// Same type — replace src and dimensions, reset crop
					set_properties(tr, session.selection.path, {
						...MEDIA_DEFAULTS,
						src: blob_url,
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
						width: dims.width,
						height: dims.height,
					};
					tr.create(new_node);
					const parent_path = session.selection.path.slice(0, -1);
					const property_name = session.selection.path[session.selection.path.length - 1];
					// Setting the property to the new node id auto-deletes the old node
					tr.set([...parent_path, property_name], new_node.id);
				}

				session.apply(tr);
				// Start background processing (hash + resize/encode)
				start_processing(blob_url, pasted_media[0].blob);
			}
			return null;
		} else {
			const pasted_json = { main_nodes: [], nodes: {} };

			// When cursor inside an image grid we want to insert a gallery_item,
			// otherwise insert a figure.
			let target_node_type;
			if (session.can_insert('gallery_item')) {
				target_node_type = 'gallery_item';
			} else {
				target_node_type = 'figure';
			}
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
					width,
					height,
					alt: ''
				};
				pasted_json.nodes['node_' + i] = {
					id: 'node_' + i,
					type: target_node_type,
					image: 'node_media_' + i
				};
				pasted_json.main_nodes.push('node_' + i);

				// Start background processing (hash + resize/encode)
				start_processing(blob_url, pasted_item.blob);
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
		prose: 3,
		text: 5,
		figure: 1,
		decoration: 1,
		feature: 4,
		gallery: 4,
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
			reset_image: new ResetImageCommand(context),
			toggle_link: new ToggleLinkCommand(context),
			edit_link: new EditLinkCommand(context),
			cycle_colorset: new CycleColorsetCommand(context)
		};

		// Define keymap binding keys to commands
		const keymap = define_keymap({
			'meta+a,ctrl+a': [commands.select_all],
			enter: [commands.break_text_node, commands.insert_default_node],
			// In case of a node cursor, fall back to inserting a default node. This is needed
			// because on iOS selecting a node cursor triggers auto capitalization (shift pressed)
			'shift+enter': [commands.add_new_line, commands.insert_default_node],
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
			backspace: [commands.reset_image],
			// Fallback for iOS, as property selection triggers auto capitalization (shift pressed)
			'shift+backspace': [commands.reset_image],
			'meta+k,ctrl+k': [commands.edit_link, commands.toggle_link],
			'ctrl+shift+c': [commands.cycle_colorset]
		});

		return { commands, keymap };
	},

	// Custom functions to insert new "blank" nodes and setting the selection depening on the
	// intended behavior.
	inserters: {
		prose: function (tr) {
			const new_heading = {
				id: nanoid(),
				type: 'text',
				layout: 2,
				content: { text: '', annotations: [] }
			};
			tr.create(new_heading);
			const new_paragraph = {
				id: nanoid(),
				type: 'text',
				layout: 1,
				content: { text: '', annotations: [] }
			};
			tr.create(new_paragraph);
			const new_prose = {
				id: nanoid(),
				type: 'prose',
				layout: 1,
				colorset: 0,
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
		text: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_text = {
				id: nanoid(),
				type: 'text',
				layout,
				content
			};
			tr.create(new_text);
			tr.insert_nodes([new_text.id]);
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
					...MEDIA_DEFAULTS
				},
				body_text: {
					id: 'body_text',
					type: 'text',
					layout: 2,
					content: { text: '', annotations: [] }
				},
				new_feature: {
						id: 'new_feature',
						type: 'feature',
						layout: 1,
						colorset: 0,
						image: 'feature_image',
						body: ['body_text']
					}
			});

			tr.insert_nodes([new_feature_id]);
		},
		figure: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_figure_id = tr.build('new_figure', {
				image_one: {
					id: 'image_one',
					type: 'image',
					...MEDIA_DEFAULTS
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
		decoration: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_decoration_id = tr.build('new_decoration', {
				image_one: {
					id: 'image_one',
					type: 'image',
					...MEDIA_DEFAULTS
				},
				new_decoration: {
					id: 'new_decoration',
					type: 'decoration',
					image: 'image_one'
				}
			});

			tr.insert_nodes([new_decoration_id]);
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
		hero: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_hero_id = tr.build('new_hero', {
				new_hero: {
					id: 'new_hero',
					type: 'hero',
					colorset: 0,
					title: { text: '', annotations: [] },
					description: { text: '', annotations: [] },
					buttons: []
				}
			});

			tr.insert_nodes([new_hero_id]);
		},
		button: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_button_id = tr.build('new_button', {
				new_button: {
					id: 'new_button',
					type: 'button'
				}
			});

			tr.insert_nodes([new_button_id]);
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
			// Create intro text
			const intro_text = {
				id: nanoid(),
				type: 'text',
				layout: 2,
				content: { text: '', annotations: [] }
			};
			tr.create(intro_text);

			// Create gallery items
			const new_gallery_items = [];
			for (let i = 0; i < 6; i++) {
				const gallery_item_image = {
					id: nanoid(),
					type: 'image',
					...MEDIA_DEFAULTS
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

			// Create outro text
			const outro_text = {
				id: nanoid(),
				type: 'text',
				layout: 1,
				content: { text: '', annotations: [] }
			};
			tr.create(outro_text);

			const new_gallery = {
				id: nanoid(),
				type: 'gallery',
				layout: 1,
				colorset: 0,
				intro: [intro_text.id],
				gallery_items: new_gallery_items,
				outro: [outro_text.id]
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
				...MEDIA_DEFAULTS
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
			// Create intro text
			const intro_text = {
				id: nanoid(),
				type: 'text',
				layout: 2,
				content: { text: '', annotations: [] }
			};
			tr.create(intro_text);

			// Create link collection items
			const new_link_collection_items = [];
			for (let i = 0; i < 3; i++) {
				const image_id = nanoid();
				const image = {
					id: image_id,
					type: 'image',
					...MEDIA_DEFAULTS
				};
				tr.create(image);
				const link_collection_item = {
						id: nanoid(),
						type: 'link_collection_item',
						href: '',
						target: '_self',
						image: image_id,
						preline: { text: '', annotations: [] },
						title: { text: '', annotations: [] },
						description: { text: '', annotations: [] }
					};
				tr.create(link_collection_item);
				new_link_collection_items.push(link_collection_item.id);
			}

			// Create outro text
			const outro_text = {
				id: nanoid(),
				type: 'text',
				layout: 1,
				content: { text: '', annotations: [] }
			};
			tr.create(outro_text);

			const new_link_collection = {
				id: nanoid(),
				type: 'link_collection',
				layout: 1,
				colorset: 0,
				intro: [intro_text.id],
				link_collection_items: new_link_collection_items,
				outro: [outro_text.id]
			};
			tr.create(new_link_collection);
			tr.insert_nodes([new_link_collection.id]);
		},

		link_collection_item: function (tr) {
			const image_id = nanoid();
			const image = {
				id: image_id,
				type: 'image',
				...MEDIA_DEFAULTS
			};
			tr.create(image);
			const new_link_collection_item = {
				id: nanoid(),
				type: 'link_collection_item',
				href: '',
				target: '_self',
				image: image_id,
				preline: { text: '', annotations: [] },
				title: { text: '', annotations: [] },
				description: { text: '', annotations: [] }
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
