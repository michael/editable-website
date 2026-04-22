import { define_document_schema } from 'svedit';

const ALL_ANNOTATIONS = ['strong', 'emphasis', 'highlight', 'link'];
const MINIMAL_ANNOTATIONS = ['emphasis', 'highlight'];

export const document_schema = define_document_schema({
	page: {
		kind: 'document',
		properties: {
			title: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: false
			},
			description: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: true
			},
			image: {
				type: 'node',
				node_types: ['image'],
				default_node_type: 'image'
			},
			body: {
				type: 'node_array',
				node_types: ['prose', 'figure', 'gallery', 'feature', 'link_collection', 'hero'],
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
			logo_max_width: { type: 'integer', default: 0 },
			logo_aspect_ratio: { type: 'number', default: 0 },
			logo: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			},
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
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
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
			logo: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			},
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
			layout: { type: 'integer', default: 1 },
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			label: {
				type: 'annotated_text',
				node_types: [],
				allow_newlines: false
			}
		}
	},
	hero: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			colorset: { type: 'integer', default: 0 },
			title: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: false
			},
			description: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: false
			},
			buttons: {
				type: 'node_array',
				node_types: ['button'],
				default_node_type: 'button'
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
			colorset: { type: 'integer', default: 0 },
			content: {
				type: 'node_array',
				node_types: ['text', 'decoration'],
				default_node_type: 'text'
			}
		}
	},
	text: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1 },
			content: {
				type: 'annotated_text',
				node_types: ALL_ANNOTATIONS,
				allow_newlines: true
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
			focal_point_x: { type: 'number', default: 0 },
			focal_point_y: { type: 'number', default: 0 },
			scale: { type: 'number', default: 1.0 },
			object_fit: { type: 'string', default: 'cover' }
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
			focal_point_x: { type: 'number', default: 0 },
			focal_point_y: { type: 'number', default: 0 },
			scale: { type: 'number', default: 1.0 },
			object_fit: { type: 'string', default: 'cover' }
		}
	},
	figure: {
		kind: 'block',
		properties: {
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			}
		}
	},
	decoration: {
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
			intro: {
				type: 'node_array',
				node_types: ['text', 'decoration'],
				default_node_type: 'text'
			},
			gallery_items: {
				type: 'node_array',
				node_types: ['gallery_item']
			},
			outro: {
				type: 'node_array',
				node_types: ['text', 'decoration'],
				default_node_type: 'text'
			}
		}
	},
	gallery_item: {
		kind: 'block',
		properties: {
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			}
		}
	},
	link_collection: {
		kind: 'block',
		properties: {
			layout: { type: 'integer', default: 1 },
			colorset: { type: 'integer', default: 0 },
			intro: {
				type: 'node_array',
				node_types: ['text', 'decoration'],
				default_node_type: 'text'
			},
			link_collection_items: {
				type: 'node_array',
				node_types: ['link_collection_item']
			},
			outro: {
				type: 'node_array',
				node_types: ['text', 'decoration'],
				default_node_type: 'text'
			}
		}
	},
	link_collection_item: {
		kind: 'block',
		properties: {
			href: { type: 'string' },
			target: { type: 'string', default: '_self' },
			media: {
				type: 'node',
				node_types: ['image', 'video'],
				default_node_type: 'image'
			},
			preline: {
				type: 'annotated_text',
				node_types: MINIMAL_ANNOTATIONS,
				allow_newlines: false
			},
			title: {
				type: 'annotated_text',
				node_types: MINIMAL_ANNOTATIONS,
				allow_newlines: false
			},
			description: {
				type: 'annotated_text',
				node_types: MINIMAL_ANNOTATIONS,
				allow_newlines: true
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
				node_types: ['text', 'decoration'],
				default_node_type: 'text'
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
	}
});
