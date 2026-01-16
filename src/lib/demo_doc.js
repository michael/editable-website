// Hardcoded demo documents for static deployment
// This replaces the database seed for demo purposes

export const nav_doc = {
	document_id: 'nav_1',
	nodes: {
		nav_item_1: {
			id: 'nav_item_1',
			type: 'nav_item',
			url: '/',
			label: { text: 'Home', annotations: [] }
		},
		nav_item_2: {
			id: 'nav_item_2',
			type: 'nav_item',
			url: '/projects',
			label: { text: 'Projects', annotations: [] }
		},
		nav_item_3: {
			id: 'nav_item_3',
			type: 'nav_item',
			url: '/blog',
			label: { text: 'Blog', annotations: [] }
		},
		nav_item_4: {
			id: 'nav_item_4',
			type: 'nav_item',
			url: '/about',
			label: { text: 'About', annotations: [] }
		},
		nav_1: {
			id: 'nav_1',
			type: 'nav',
			nav_items: ['nav_item_1', 'nav_item_2', 'nav_item_3', 'nav_item_4']
		}
	}
};

export const home_page_doc = {
	document_id: 'page_1',
	nodes: {
		heading_1: {
			id: 'heading_1',
			type: 'heading',
			layout: 1,
			content: {
				text: 'A SvelteKit template for building CMS-free editable websites',
				annotations: []
			}
		},
		paragraph_1: {
			id: 'paragraph_1',
			type: 'paragraph',
			content: {
				text: 'This is an early demo of Editable Website v2. It builds on top of Svedit (which replaces ProseMirror) and provides you with a simple framework to build entirely custom websites and apps in Svelte, while site owners can edit content directly in the layout - no CMS needed.',
				annotations: []
			}
		},
		prose_1: {
			id: 'prose_1',
			type: 'prose',
			layout: 1,
			content: ['heading_1', 'paragraph_1']
		},
		heading_2: {
			id: 'heading_2',
			type: 'heading',
			layout: 2,
			content: {
				text: 'Predefined content types, which you can tailor to your needs',
				annotations: []
			}
		},
		paragraph_2: {
			id: 'paragraph_2',
			type: 'paragraph',
			content: {
				text: "Editable Website ships with predefined content types like Text, Heroes, CTAs, Galleries, Accordions, etc. It provides a starting point, covering 80% of what most websites need, and makes it easy for you to add what's missing.",
				annotations: []
			}
		},
		paragraph_3: {
			id: 'paragraph_3',
			type: 'paragraph',
			content: {
				text: "For instance, you might want to add a custom FrontpageHero.svelte that includes some title and description (which are editable) but also some custom animations, which you'll code into that component.",
				annotations: []
			}
		},
		prose_2: {
			id: 'prose_2',
			type: 'prose',
			layout: 2,
			content: ['heading_2', 'paragraph_2', 'paragraph_3']
		},
		heading_3: {
			id: 'heading_3',
			type: 'heading',
			layout: 2,
			content: { text: 'Design-System based on Tailwind v4', annotations: [] }
		},
		paragraph_4: {
			id: 'paragraph_4',
			type: 'paragraph',
			content: {
				text: "If you're familiar with using Tailwind, you know how to style editable websites. In app.css you'll be able to change the defaults for spacing, colors, and typography, and for many sites this might be all you have to do.",
				annotations: []
			}
		},
		paragraph_5: {
			id: 'paragraph_5',
			type: 'paragraph',
			content: {
				text: 'However, sometimes you want to implement very custom specific layouts and control every pixel. This is when you start adapting the existing components or create new ones. If you know Svelte, you know Editable Website.',
				annotations: []
			}
		},
		prose_3: {
			id: 'prose_3',
			type: 'prose',
			layout: 3,
			content: ['heading_3', 'paragraph_4', 'paragraph_5']
		},
		heading_4: {
			id: 'heading_4',
			type: 'heading',
			layout: 2,
			content: { text: 'Built-in image processing', annotations: [] }
		},
		paragraph_6: {
			id: 'paragraph_6',
			type: 'paragraph',
			content: {
				text: 'When you paste an image onto the page, it gets uploaded in the background, and Editable Website generates a set of sizes in an optimized web format that is provided to srcset.',
				annotations: []
			}
		},
		prose_4: {
			id: 'prose_4',
			type: 'prose',
			layout: 1,
			content: ['heading_4', 'paragraph_6']
		},
		feature_1_image: {
			id: 'feature_1_image',
			type: 'image',
			src: '/sample-images/1.jpg',
			width: 800,
			height: 600,
			alt: 'Feature image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		feature_1: {
			id: 'feature_1',
			type: 'feature',
			layout: 1,
			image: 'feature_1_image',
			title: { text: 'Build websites that anyone can edit', annotations: [] },
			description: {
				text: 'No CMS needed. Content editors can make changes directly in the layout, seeing exactly how their changes will look.',
				annotations: []
			}
		},
		figure_1_image: {
			id: 'figure_1_image',
			type: 'image',
			src: '/sample-images/2.jpg',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		figure_1: {
			id: 'figure_1',
			type: 'figure',
			image: 'figure_1_image'
		},
		gallery_item_1_image: {
			id: 'gallery_item_1_image',
			type: 'image',
			src: '/sample-images/2.jpg',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		gallery_item_2_image: {
			id: 'gallery_item_2_image',
			type: 'image',
			src: '/sample-images/3.jpg',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		gallery_item_3_image: {
			id: 'gallery_item_3_image',
			type: 'image',
			src: '/sample-images/4.jpg',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		gallery_item_4_image: {
			id: 'gallery_item_4_image',
			type: 'image',
			src: '/sample-images/5.jpg',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		gallery_item_5_image: {
			id: 'gallery_item_5_image',
			type: 'image',
			src: '/sample-images/6.jpg',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		gallery_item_6_image: {
			id: 'gallery_item_6_image',
			type: 'image',
			src: '/sample-images/7.jpg',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1.0,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		gallery_item_1: {
			id: 'gallery_item_1',
			type: 'gallery_item',
			image: 'gallery_item_1_image'
		},
		gallery_item_2: {
			id: 'gallery_item_2',
			type: 'gallery_item',
			image: 'gallery_item_2_image'
		},
		gallery_item_3: {
			id: 'gallery_item_3',
			type: 'gallery_item',
			image: 'gallery_item_3_image'
		},
		gallery_item_4: {
			id: 'gallery_item_4',
			type: 'gallery_item',
			image: 'gallery_item_4_image'
		},
		gallery_item_5: {
			id: 'gallery_item_5',
			type: 'gallery_item',
			image: 'gallery_item_5_image'
		},
		gallery_item_6: {
			id: 'gallery_item_6',
			type: 'gallery_item',
			image: 'gallery_item_6_image'
		},
		gallery_1: {
			id: 'gallery_1',
			type: 'gallery',
			layout: 1,
			gallery_items: [
				'gallery_item_1',
				'gallery_item_2',
				'gallery_item_3',
				'gallery_item_4',
				'gallery_item_5',
				'gallery_item_6'
			]
		},
		footer_link_1_1: {
			id: 'footer_link_1_1',
			type: 'footer_link',
			url: '/about',
			label: { text: 'About Us', annotations: [] }
		},
		footer_link_1_2: {
			id: 'footer_link_1_2',
			type: 'footer_link',
			url: '/team',
			label: { text: 'Our Team', annotations: [] }
		},
		footer_link_1_3: {
			id: 'footer_link_1_3',
			type: 'footer_link',
			url: '/careers',
			label: { text: 'Careers', annotations: [] }
		},
		footer_link_2_1: {
			id: 'footer_link_2_1',
			type: 'footer_link',
			url: '/products',
			label: { text: 'Products', annotations: [] }
		},
		footer_link_2_2: {
			id: 'footer_link_2_2',
			type: 'footer_link',
			url: '/services',
			label: { text: 'Services', annotations: [] }
		},
		footer_link_2_3: {
			id: 'footer_link_2_3',
			type: 'footer_link',
			url: '/pricing',
			label: { text: 'Pricing', annotations: [] }
		},
		footer_link_3_1: {
			id: 'footer_link_3_1',
			type: 'footer_link',
			url: '/docs',
			label: { text: 'Documentation', annotations: [] }
		},
		footer_link_3_2: {
			id: 'footer_link_3_2',
			type: 'footer_link',
			url: '/api',
			label: { text: 'API Reference', annotations: [] }
		},
		footer_link_3_3: {
			id: 'footer_link_3_3',
			type: 'footer_link',
			url: '/guides',
			label: { text: 'Guides', annotations: [] }
		},
		footer_link_4_1: {
			id: 'footer_link_4_1',
			type: 'footer_link',
			url: '/contact',
			label: { text: 'Contact', annotations: [] }
		},
		footer_link_4_2: {
			id: 'footer_link_4_2',
			type: 'footer_link',
			url: '/support',
			label: { text: 'Support', annotations: [] }
		},
		footer_link_4_3: {
			id: 'footer_link_4_3',
			type: 'footer_link',
			url: '/privacy',
			label: { text: 'Privacy Policy', annotations: [] }
		},
		footer_column_1: {
			id: 'footer_column_1',
			type: 'footer_link_column',
			label: { text: 'Company', annotations: [] },
			footer_links: ['footer_link_1_1', 'footer_link_1_2', 'footer_link_1_3']
		},
		footer_column_2: {
			id: 'footer_column_2',
			type: 'footer_link_column',
			label: { text: 'Products', annotations: [] },
			footer_links: ['footer_link_2_1', 'footer_link_2_2', 'footer_link_2_3']
		},
		footer_column_3: {
			id: 'footer_column_3',
			type: 'footer_link_column',
			label: { text: 'Resources', annotations: [] },
			footer_links: ['footer_link_3_1', 'footer_link_3_2', 'footer_link_3_3']
		},
		footer_column_4: {
			id: 'footer_column_4',
			type: 'footer_link_column',
			label: { text: 'Legal', annotations: [] },
			footer_links: ['footer_link_4_1', 'footer_link_4_2', 'footer_link_4_3']
		},
		footer_1: {
			id: 'footer_1',
			type: 'footer',
			copyright: { text: '© Editable Website 2025', annotations: [] },
			footer_link_columns: [
				'footer_column_1',
				'footer_column_2',
				'footer_column_3',
				'footer_column_4'
			]
		},
		page_1: {
			id: 'page_1',
			type: 'page',
			body: [
				'feature_1',
				'prose_1',
				'prose_2',
				'prose_3',
				'prose_4',
				'gallery_1',
				'figure_1'
			],
			nav: 'nav_1',
			footer: 'footer_1'
		}
	}
};

// Demo documents registry
const demo_docs = {
	nav_1: nav_doc,
	page_1: home_page_doc
};

export function get_demo_document() {
	const page_doc = demo_docs.page_1;

	const nav_doc_id = page_doc.nodes[page_doc.document_id]?.nav;
	const nav_doc = nav_doc_id ? demo_docs[nav_doc_id] : null;

	// Merge nav nodes into page document (same as api.remote.js does)
	return {
		document_id: page_doc.document_id,
		nodes: { ...(nav_doc?.nodes || {}), ...page_doc.nodes }
	};
}
