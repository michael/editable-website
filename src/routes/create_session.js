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
	SelectParentCommand,
	fill_document_defaults
} from 'svedit';
import nanoid from './nanoid.js';
import {
	CycleLayoutCommand,
	CycleNodeTypeCommand,
	CycleColorsetCommand,
	ToggleLinkCommand,
	EditLinkCommand,
	ReplaceMediaCommand,
	EditImageCommand,
	ToggleAccordionCommand
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
import ProseGrid from './components/ProseGrid.svelte';
import ProseGridItem from './components/ProseGridItem.svelte';
import Preformatted from './components/Preformatted.svelte';
import Paragraph from './components/Paragraph.svelte';
import ParagraphLG from './components/ParagraphLG.svelte';
import ParagraphXL from './components/ParagraphXL.svelte';
import ParagraphSM from './components/ParagraphSM.svelte';
import Heading1 from './components/Heading1.svelte';
import Heading2 from './components/Heading2.svelte';
import Heading3 from './components/Heading3.svelte';
import Heading4 from './components/Heading4.svelte';
import Heading5 from './components/Heading5.svelte';
import List from './components/List.svelte';
import ListItem from './components/ListItem.svelte';
import Gallery from './components/Gallery.svelte';
import GalleryItem from './components/GalleryItem.svelte';
import DescriptiveGallery from './components/DescriptiveGallery.svelte';
import DescriptiveGalleryItem from './components/DescriptiveGalleryItem.svelte';
import DescriptiveListing from './components/DescriptiveListing.svelte';
import DescriptiveListingItem from './components/DescriptiveListingItem.svelte';
import Accordion from './components/Accordion.svelte';
import AccordionItem from './components/AccordionItem.svelte';
import Figure from './components/Figure.svelte';
import CaptionedFigure from './components/CaptionedFigure.svelte';
import SupportingMedia from './components/SupportingMedia.svelte';
import Feature from './components/Feature.svelte';
import Button from './components/Button.svelte';
import ButtonGroup from './components/ButtonGroup.svelte';
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

function select_inserted_text_property(tr, property_name = 'label') {
	tr.set_selection({
		type: 'text',
		path: [...tr.selection.path, tr.selection.focus_offset - 1, property_name],
		anchor_offset: 0,
		focus_offset: 0
	});
}

function insert_text_node(tr, node_type, content = { text: '', annotations: [] }, layout = 1) {
	const new_text = {
		id: nanoid(),
		type: node_type,
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
			height: dims.height
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
	// such as node_gap, node_gap_markers, node_selection_markers, or overlays
	system_components: {
		overlays: Overlays
	},
	// Registry of components for each node type
	node_components: {
		page: Page,
		nav: Nav,
		nav_item: NavItem,
		footer: Footer,
		footer_link_column: FooterLinkColumn,
		footer_link: FooterLink,
		button: Button,
		button_group: ButtonGroup,
		prose: Prose,
		prose_grid: ProseGrid,
		prose_grid_item: ProseGridItem,
		preformatted: Preformatted,
		paragraph: Paragraph,
		paragraph_lg: ParagraphLG,
		paragraph_xl: ParagraphXL,
		paragraph_sm: ParagraphSM,
		heading_1: Heading1,
		heading_2: Heading2,
		heading_3: Heading3,
		heading_4: Heading4,
		heading_5: Heading5,
		list: List,
		list_item: ListItem,
		image: Image,
		video: Video,
		figure: Figure,
		captioned_figure: CaptionedFigure,
		supporting_media: SupportingMedia,
		feature: Feature,
		gallery: Gallery,
		gallery_item: GalleryItem,
		descriptive_gallery: DescriptiveGallery,
		descriptive_gallery_item: DescriptiveGalleryItem,
		descriptive_listing: DescriptiveListing,
		descriptive_listing_item: DescriptiveListingItem,
		accordion: Accordion,
		accordion_item: AccordionItem,
		strong: Strong,
		emphasis: Emphasis,
		highlight: Highlight,
		link: Link
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
				await replace_media(
					session,
					session.selection.path,
					pasted_media[0].blob,
					pasted_media[0].data_url
				);
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
					mime_type: pasted_item.blob.type,
					width,
					height,
					alt: ''
				};
				pasted_json.nodes['node_' + i] = {
					id: 'node_' + i,
					type: target_node_type,
					media: 'node_media_' + i
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
		paragraph: (node) => `<p>${node.content.text}</p>\n`,
		paragraph_sm: (node) => `<p>${node.content.text}</p>\n`,
		paragraph_lg: (node) => `<p>${node.content.text}</p>\n`,
		paragraph_xl: (node) => `<p>${node.content.text}</p>\n`,
		heading_1: (node) => `<h1>${node.content.text}</h1>\n`,
		heading_2: (node) => `<h2>${node.content.text}</h2>\n`,
		heading_3: (node) => `<h3>${node.content.text}</h3>\n`,
		heading_4: (node) => `<h4>${node.content.text}</h4>\n`,
		heading_5: (node) => `<h5>${node.content.text}</h5>\n`,
		preformatted: (node) => `<pre>${node.content.text}</pre>\n`,
		list: (node, session, html_exporters) => {
			let html = '<ul>\n';
			for (const list_item_id of node.list_items) {
				html += html_exporters.list_item(session.get(list_item_id));
			}
			return `${html}</ul>\n`;
		},
		list_item: (node) => `<li>${node.content.text}</li>\n`
	},
	node_layouts: {
		prose: 6,
		prose_grid: 2,
		prose_grid_item: 1,
		paragraph: 2,
		paragraph_sm: 2,
		paragraph_lg: 2,
		paragraph_xl: 2,
		heading_1: 2,
		heading_2: 2,
		heading_3: 2,
		heading_4: 2,
		heading_5: 2,
		preformatted: 1,
		list: 4,
		list_item: 1,
		figure: 6,
		descriptive_listing: 5,
		accordion: 5,
		captioned_figure: 1,
		supporting_media: 1,
		feature: 2,
		gallery: 5,
		nav_item: 2,
		button: 2
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
			toggle_accordion: new ToggleAccordionCommand(context),
			toggle_link: new ToggleLinkCommand(context),
			edit_link: new EditLinkCommand(context),
			edit_image: new EditImageCommand(context),
			cycle_colorset: new CycleColorsetCommand(context),
			replace_media: new ReplaceMediaCommand(context)
		};

		// Define keymap binding keys to commands
		const keymap = define_keymap({
			'meta+a,ctrl+a': [commands.select_all],
			enter: [commands.replace_media, commands.break_text_node, commands.add_new_line, commands.insert_default_node],
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
			tab: [commands.toggle_accordion],

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
				type: 'heading_1',
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
				colorset: 0,
				content: [new_heading.id, new_paragraph.id]
			};
			tr.create(new_prose);
			tr.insert_nodes([new_prose.id]);
		},
		prose_grid_item: function (tr) {
			const new_heading = {
				id: nanoid(),
				type: 'heading_1',
				content: { text: '', annotations: [] }
			};
			tr.create(new_heading);
			const new_paragraph = {
				id: nanoid(),
				type: 'paragraph',
				content: { text: '', annotations: [] }
			};
			tr.create(new_paragraph);
			const new_prose_grid_item = {
				id: nanoid(),
				type: 'prose_grid_item',
				content: [new_heading.id, new_paragraph.id]
			};
			tr.create(new_prose_grid_item);
			tr.insert_nodes([new_prose_grid_item.id]);
		},
		prose_grid: function (tr) {
			const new_prose_grid_id = tr.build('new_prose_grid', {
				title_1: {
					id: 'title_1',
					type: 'heading_1',
					content: { text: '', annotations: [] }
				},
				title_2: {
					id: 'title_2',
					type: 'heading_1',
					content: { text: '', annotations: [] }
				},
				title_3: {
					id: 'title_3',
					type: 'heading_1',
					content: { text: '', annotations: [] }
				},
				paragraph_1: {
					id: 'paragraph_1',
					type: 'paragraph',
					content: { text: '', annotations: [] }
				},
				paragraph_2: {
					id: 'paragraph_2',
					type: 'paragraph',
					content: { text: '', annotations: [] }
				},
				paragraph_3: {
					id: 'paragraph_3',
					type: 'paragraph',
					content: { text: '', annotations: [] }
				},
				prose_grid_item_1: {
					id: 'prose_grid_item_1',
					type: 'prose_grid_item',
					content: ['title_1', 'paragraph_1']
				},
				prose_grid_item_2: {
					id: 'prose_grid_item_2',
					type: 'prose_grid_item',
					content: ['title_2', 'paragraph_2']
				},
				prose_grid_item_3: {
					id: 'prose_grid_item_3',
					type: 'prose_grid_item',
					content: ['title_3', 'paragraph_3']
				},
				new_prose_grid: {
					id: 'new_prose_grid',
					type: 'prose_grid',
					layout: 1,
					items: ['prose_grid_item_1', 'prose_grid_item_2', 'prose_grid_item_3']
				}
			});
			tr.insert_nodes([new_prose_grid_id]);
		},
		paragraph: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'paragraph', content, 1);
		},
		paragraph_sm: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'paragraph_sm', content, 1);
		},
		paragraph_lg: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'paragraph_lg', content, 1);
		},
		paragraph_xl: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'paragraph_xl', content, 1);
		},
		heading_1: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'heading_1', content, 1);
		},
		heading_2: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'heading_2', content, 1);
		},
		heading_3: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'heading_3', content, 1);
		},
		heading_4: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'heading_4', content, 1);
		},
		heading_5: function (tr, content = { text: '', annotations: [] }) {
			insert_text_node(tr, 'heading_5', content, 1);
		},
		preformatted: function (tr, content = { text: '', annotations: [] }) {
			const new_preformatted = {
				id: nanoid(),
				type: 'preformatted',
				content: { ...content, annotations: [] }
			};
			tr.create(new_preformatted);
			tr.insert_nodes([new_preformatted.id]);
			tr.set_selection({
				type: 'text',
				path: [...tr.selection.path, tr.selection.focus_offset - 1, 'content'],
				anchor_offset: 0,
				focus_offset: 0
			});
		},
		list: function (tr) {
			const new_list_item = {
				id: nanoid(),
				type: 'list_item',
				content: { text: '', annotations: [] }
			};
			tr.create(new_list_item);

			const new_list = {
				id: nanoid(),
				type: 'list',
				layout: 1,
				list_items: [new_list_item.id]
			};
			tr.create(new_list);
			tr.insert_nodes([new_list.id]);
			tr.set_selection({
				type: 'text',
				path: [...tr.selection.path, tr.selection.focus_offset - 1, 'list_items', 0, 'content'],
				anchor_offset: 0,
				focus_offset: 0
			});
		},
		list_item: function (tr, content = { text: '', annotations: [] }) {
			const new_list_item = {
				id: nanoid(),
				type: 'list_item',
				content
			};
			tr.create(new_list_item);
			tr.insert_nodes([new_list_item.id]);
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
					type: 'heading_1',
					content: { text: '', annotations: [] }
				},
				new_feature: {
					id: 'new_feature',
					type: 'feature',
					layout: 1,
					colorset: 0,
					media: 'feature_image',
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
					layout,
					media: 'image_one'
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
		captioned_figure: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_captioned_figure_id = tr.build('new_captioned_figure', {
				image_one: {
					id: 'image_one',
					type: 'image',
					...MEDIA_DEFAULTS
				},
				new_captioned_figure: {
					id: 'new_captioned_figure',
					type: 'captioned_figure',
					media: 'image_one',
					caption: { text: '', annotations: [] }
				}
			});

			tr.insert_nodes([new_captioned_figure_id]);
		},
		supporting_media: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_supporting_media_id = tr.build('new_supporting_media', {
				image_one: {
					id: 'image_one',
					type: 'image',
					...MEDIA_DEFAULTS
				},
				new_supporting_media: {
					id: 'new_supporting_media',
					type: 'supporting_media',
					media: 'image_one'
				}
			});

			tr.insert_nodes([new_supporting_media_id]);
		},
		nav_item: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_nav_item_id = tr.build('new_nav_item', {
				new_nav_item: {
					id: 'new_nav_item',
					type: 'nav_item'
				}
			});

			tr.insert_nodes([new_nav_item_id]);
			select_inserted_text_property(tr);
		},

		button: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_button_id = tr.build('new_button', {
				new_button: {
					id: 'new_button',
					type: 'button'
				}
			});

			tr.insert_nodes([new_button_id]);
			select_inserted_text_property(tr);
		},
		button_group: function (tr) {
			const new_button = {
				id: nanoid(),
				type: 'button'
			};
			tr.create(new_button);

			const new_button_group = {
				id: nanoid(),
				type: 'button_group',
				buttons: [new_button.id]
			};
			tr.create(new_button_group);
			tr.insert_nodes([new_button_group.id]);
		},
		footer_link: function (tr, content = { text: '', annotations: [] }, layout = 1) {
			const new_footer_link_id = tr.build('new_footer_link', {
				new_footer_link: {
					id: 'new_footer_link',
					type: 'footer_link'
				}
			});

			tr.insert_nodes([new_footer_link_id]);
			select_inserted_text_property(tr);
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
			const gallery_items = [];
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
					href: '',
					target: '_self',
					media: gallery_item_image.id
				};
				tr.create(gallery_item);
				gallery_items.push(gallery_item.id);
			}

			const gallery = {
				id: nanoid(),
				type: 'gallery',
				layout: 1,
				colorset: 0,
				gallery_items
			};
			tr.create(gallery);
			tr.insert_nodes([gallery.id]);
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
				href: '',
				target: '_self',
				media: gallery_item_image.id
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

		descriptive_gallery: function (tr) {
			const items = [];
			for (let i = 0; i < 3; i++) {
				const image_id = nanoid();
				const image = {
					id: image_id,
					type: 'image',
					...MEDIA_DEFAULTS
				};
				tr.create(image);
				const descriptive_gallery_item = {
					id: nanoid(),
					type: 'descriptive_gallery_item',
					href: '',
					target: '_self',
					media: image_id,
					title: { text: '', annotations: [] },
					description: { text: '', annotations: [] }
				};
				tr.create(descriptive_gallery_item);
				items.push(descriptive_gallery_item.id);
			}

			const descriptive_gallery = {
				id: nanoid(),
				type: 'descriptive_gallery',
				layout: 1,
				items
			};
			tr.create(descriptive_gallery);
			tr.insert_nodes([descriptive_gallery.id]);
		},

		descriptive_gallery_item: function (tr) {
			const image_id = nanoid();
			const image = {
				id: image_id,
				type: 'image',
				...MEDIA_DEFAULTS
			};
			tr.create(image);
			const descriptive_gallery_item = {
				id: nanoid(),
				type: 'descriptive_gallery_item',
				href: '',
				target: '_self',
				media: image_id,
				title: { text: '', annotations: [] },
				description: { text: '', annotations: [] }
			};
			tr.create(descriptive_gallery_item);
			tr.insert_nodes([descriptive_gallery_item.id]);
			tr.set_selection({
				type: 'node',
				path: [...tr.selection.path],
				anchor_offset: tr.selection.focus_offset,
				focus_offset: tr.selection.focus_offset
			});
		},

		descriptive_listing: function (tr) {
			const items = [];
			for (let i = 0; i < 4; i++) {
				const descriptive_listing_item = {
					id: nanoid(),
					type: 'descriptive_listing_item',
					href: '',
					target: '_self',
					title: { text: '', annotations: [] },
					description: { text: '', annotations: [] },
					meta: { text: '', annotations: [] }
				};
				tr.create(descriptive_listing_item);
				items.push(descriptive_listing_item.id);
			}

			const descriptive_listing = {
				id: nanoid(),
				type: 'descriptive_listing',
				layout: 1,
				items
			};
			tr.create(descriptive_listing);
			tr.insert_nodes([descriptive_listing.id]);
		},

		descriptive_listing_item: function (tr) {
			const descriptive_listing_item = {
				id: nanoid(),
				type: 'descriptive_listing_item',
				href: '',
				target: '_self',
				title: { text: '', annotations: [] },
				description: { text: '', annotations: [] },
				meta: { text: '', annotations: [] }
			};
			tr.create(descriptive_listing_item);
			tr.insert_nodes([descriptive_listing_item.id]);
			tr.set_selection({
				type: 'node',
				path: [...tr.selection.path],
				anchor_offset: tr.selection.focus_offset,
				focus_offset: tr.selection.focus_offset
			});
		},

		accordion: function (tr) {
			const body_text = {
				id: nanoid(),
				type: 'paragraph',
				content: { text: '', annotations: [] }
			};
			tr.create(body_text);

			const accordion_item = {
				id: nanoid(),
				type: 'accordion_item',
				title: { text: '', annotations: [] },
				body: [body_text.id]
			};
			tr.create(accordion_item);

			const accordion = {
				id: nanoid(),
				type: 'accordion',
				layout: 1,
				items: [accordion_item.id]
			};
			tr.create(accordion);
			tr.insert_nodes([accordion.id]);
		},

		accordion_item: function (tr) {
			const body_text = {
				id: nanoid(),
				type: 'paragraph',
				content: { text: '', annotations: [] }
			};
			tr.create(body_text);

			const accordion_item = {
				id: nanoid(),
				type: 'accordion_item',
				title: { text: '', annotations: [] },
				body: [body_text.id]
			};
			tr.create(accordion_item);
			tr.insert_nodes([accordion_item.id]);
			select_inserted_text_property(tr, 'title');
		}
	}
};

export function create_session(doc) {
	const migrated_doc = fill_document_defaults(doc, document_schema);
	const session = new Session(document_schema, migrated_doc, session_config);
	return session;
}
