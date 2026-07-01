import { define_document_schema } from 'svedit';
import { MEDIA_DEFAULTS } from '$lib/config.js';

const ALL_ANNOTATIONS = ['strong', 'emphasis', 'highlight', 'link'];
const MINIMAL_ANNOTATIONS = ['emphasis', 'highlight'];
const NO_ANNOTATIONS = [];
const TEXT_NODE_TYPES = [
	'paragraph_sm',
	'paragraph',
	'paragraph_lg',
	'paragraph_xl',
	'heading_1',
	'heading_2',
	'heading_3',
	'heading_4',
	'heading_5'
];
const RICH_CONTENT_NODE_TYPES = [...TEXT_NODE_TYPES, 'list', 'supporting_media', 'button_group'];
const RICH_CONTENT_NODE_TYPES_WITHOUT_HEADINGS = [
	'paragraph_sm',
	'paragraph',
	'paragraph_lg',
	'paragraph_xl',
	'list',
	'supporting_media',
	'button_group'
];

export const document_schema = define_document_schema({
	page: {
		kind: 'document',
		properties: {
			title: {
				type: 'text',
				annotation_types: [],
				allow_newlines: false
			},
			description: {
				type: 'text',
				annotation_types: [],
				allow_newlines: true
			},
			image: {
				type: 'node',
				node_types: ['image'],
				default_node_type: 'image'
			},
			body: {
				type: 'node_array',
				node_types: [
					'prose',
					'prose_grid',
					'figure',
					'captioned_figure',
					'gallery',
					'feature',
					'descriptive_gallery',
					'descriptive_listing',
					'accordion',
					'preformatted'
				],
				annotation_types: ['section'],
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
			content: {
				type: 'node_array',
				node_types: RICH_CONTENT_NODE_TYPES,
				default_node_type: 'paragraph'
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
			items: {
				type: 'node_array',
				node_types: ['footer_link_category', 'footer_link'],
				default_node_type: 'footer_link'
			}
		}
	},
	footer_link_category: {
		kind: 'block',
		properties: {
			title: {
				type: 'text',
				annotation_types: [],
				allow_newlines: false
			}
		}
	},
	footer_link: {
		kind: 'block',
		properties: {
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			label: {
				type: 'text',
				annotation_types: [],
				allow_newlines: false
			}
		}
	},
	nav: {
		kind: 'block',
		properties: {
			start_nav_items: {
				type: 'node_array',
				node_types: ['nav_image', 'nav_item'],
				default_node_type: 'nav_image'
			},
			center_nav_items: {
				type: 'node_array',
				node_types: ['nav_item', 'nav_image'],
				default_node_type: 'nav_item'
			},
			end_nav_items: {
				type: 'node_array',
				node_types: ['nav_item', 'nav_image'],
				default_node_type: 'nav_item'
			}
		}
	},
	nav_item: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			label: {
				type: 'text',
				annotation_types: [],
				allow_newlines: false
			}
		}
	},
	nav_image: {
		kind: 'block',
		properties: {
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			}
		}
	},

	button: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			label: {
				type: 'text',
				annotation_types: [],
				allow_newlines: false
			}
		}
	},
	button_group: {
		kind: 'block',
		properties: {
			buttons: {
				type: 'node_array',
				node_types: ['button'],
				default_node_type: 'button'
			}
		}
	},
	prose_grid: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			items: {
				type: 'node_array',
				node_types: ['prose_grid_item'],
				default_node_type: 'prose_grid_item'
			}
		}
	},
	prose_grid_item: {
		kind: 'block',
		properties: {
			colorset: { type: 'integer', default: 0 },
			content: {
				type: 'node_array',
				node_types: RICH_CONTENT_NODE_TYPES,
				default_node_type: 'paragraph'
			}
		}
	},
	prose: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			colorset: { type: 'integer', default: 0 },
			content: {
				type: 'node_array',
				node_types: RICH_CONTENT_NODE_TYPES,
				default_node_type: 'paragraph'
			}
		}
	},
	preformatted: {
		kind: 'block',
		properties: {
			content: {
				type: 'text',
				annotation_types: NO_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	paragraph: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	paragraph_sm: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	paragraph_lg: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	paragraph_xl: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},

	heading_1: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	heading_2: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},

	heading_3: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	heading_4: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	heading_5: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1, allowed_values: [1, 2] },
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	list_item: {
		kind: 'text',
		properties: {
			content: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: false
			}
		}
	},
	list: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			list_items: {
				type: 'node_array',
				node_types: ['list_item'],
				default_node_type: 'list_item'
			}
		}
	},
	image: {
		kind: 'block',
		properties: {
			src: { type: 'string' },
			mime_type: { type: 'string' },
			width: { type: 'integer' },
			height: { type: 'integer' },
			alt: { type: 'string' },
			focal_point_x: { type: 'number', default: MEDIA_DEFAULTS.focal_point_x },
			focal_point_y: { type: 'number', default: MEDIA_DEFAULTS.focal_point_y },
			scale: { type: 'number', default: MEDIA_DEFAULTS.scale },
			object_fit: { type: 'string', default: MEDIA_DEFAULTS.object_fit }
		}
	},
	video: {
		kind: 'block',
		properties: {
			src: { type: 'string' },
			mime_type: { type: 'string' },
			width: { type: 'integer' },
			height: { type: 'integer' },
			alt: { type: 'string' },
			focal_point_x: { type: 'number', default: MEDIA_DEFAULTS.focal_point_x },
			focal_point_y: { type: 'number', default: MEDIA_DEFAULTS.focal_point_y },
			scale: { type: 'number', default: MEDIA_DEFAULTS.scale },
			object_fit: { type: 'string', default: MEDIA_DEFAULTS.object_fit }
		}
	},
	figure: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			}
		}
	},
	captioned_figure: {
		kind: 'block',
		properties: {
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			},
			caption: {
				type: 'text',
				annotation_types: ALL_ANNOTATIONS,
				allow_newlines: false
			}
		}
	},
	supporting_media: {
		kind: 'block',
		properties: {
			media_max_width: { type: 'integer', default: 0 },
			media_aspect_ratio: { type: 'number', default: 0 },
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			}
		}
	},
	gallery: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			colorset: { type: 'integer', default: 0 },
			gallery_items: {
				type: 'node_array',
				node_types: ['gallery_item']
			}
		}
	},
	gallery_item: {
		kind: 'block',
		properties: {
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			}
		}
	},
	descriptive_gallery: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			items: {
				type: 'node_array',
				node_types: ['descriptive_gallery_item']
			}
		}
	},
	descriptive_gallery_item: {
		kind: 'block',
		properties: {
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			},
			title: {
				type: 'text',
				annotation_types: MINIMAL_ANNOTATIONS,
				allow_newlines: false
			},
			description: {
				type: 'text',
				annotation_types: MINIMAL_ANNOTATIONS,
				allow_newlines: true
			}
		}
	},
	descriptive_listing: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			items: {
				type: 'node_array',
				node_types: ['descriptive_listing_item']
			}
		}
	},
	descriptive_listing_item: {
		kind: 'block',
		properties: {
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			title: {
				type: 'text',
				annotation_types: MINIMAL_ANNOTATIONS,
				allow_newlines: false
			},
			description: {
				type: 'text',
				annotation_types: MINIMAL_ANNOTATIONS,
				allow_newlines: true
			},
			meta: {
				type: 'text',
				annotation_types: MINIMAL_ANNOTATIONS,
				allow_newlines: false
			}
		}
	},
	accordion: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			items: {
				type: 'node_array',
				node_types: ['accordion_item']
			}
		}
	},
	accordion_item: {
		kind: 'block',
		properties: {
			title: {
				type: 'text',
				annotation_types: MINIMAL_ANNOTATIONS,
				allow_newlines: false
			},
			body: {
				type: 'node_array',
				node_types: RICH_CONTENT_NODE_TYPES_WITHOUT_HEADINGS,
				default_node_type: 'paragraph'
			}
		}
	},
	feature: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			colorset: { type: 'integer', default: 0 },
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			},
			body: {
				type: 'node_array',
				node_types: RICH_CONTENT_NODE_TYPES,
				default_node_type: 'paragraph'
			}
		}
	},

	link: {
		kind: 'annotation',
		properties: {
			href: { type: 'string' },
			target: { type: 'string', default: '_self' }
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
	},
	section: {
		kind: 'annotation',
		properties: {}
	}
});
