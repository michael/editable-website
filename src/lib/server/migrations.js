import { demo_doc } from '$lib/demo_doc.js';

// No-op tag for SQL syntax highlighting with the SQL Tagged Template Literals VSCode extension
const sql = (strings) => strings.join('');

/**
 * Collect all node ids reachable from a root node by walking node/node_array
 * properties and annotation references.
 *
 * @param {string} root_id
 * @param {Record<string, any>} nodes
 * @param {Record<string, any>} schema
 * @param {Set<string>} [exclude_roots] - root ids whose subtrees should not be traversed
 * @returns {Set<string>}
 */
function collect_node_ids(root_id, nodes, schema, exclude_roots) {
	const collected = new Set();
	const stack = [root_id];

	while (stack.length > 0) {
		const id = stack.pop();
		if (collected.has(id)) continue;
		if (exclude_roots && exclude_roots.has(id) && id !== root_id) continue;
		collected.add(id);

		const node = nodes[id];
		if (!node) continue;

		const type_schema = schema[node.type];
		if (!type_schema) continue;

		for (const [prop_name, prop_def] of Object.entries(type_schema.properties)) {
			const value = node[prop_name];
			if (value == null) continue;

			if (prop_def.type === 'node' && typeof value === 'string') {
				stack.push(value);
			} else if (prop_def.type === 'node_array' && Array.isArray(value)) {
				for (const child_id of value) {
					stack.push(child_id);
				}
			} else if (prop_def.type === 'annotated_text' && value.annotations) {
				for (const annotation of value.annotations) {
					if (annotation.node_id) {
						stack.push(annotation.node_id);
					}
				}
			}
		}
	}

	return collected;
}

/**
 * Extract a subset of nodes into a document.
 *
 * @param {string} document_id
 * @param {Set<string>} node_ids
 * @param {Record<string, any>} all_nodes
 * @returns {{ document_id: string, nodes: Record<string, any> }}
 */
function extract_document(document_id, node_ids, all_nodes) {
	const nodes = {};
	for (const id of node_ids) {
		if (all_nodes[id]) {
			nodes[id] = all_nodes[id];
		}
	}
	return { document_id, nodes };
}

// Minimal schema definition for graph walking — only need property types
const walk_schema = {
	page: {
		properties: {
			body: { type: 'node_array' },
			nav: { type: 'node' },
			footer: { type: 'node' }
		}
	},
	footer: {
		properties: {
			logo: { type: 'node' },
			copyright: { type: 'annotated_text' },
			footer_link_columns: { type: 'node_array' }
		}
	},
	footer_link_column: {
		properties: {
			label: { type: 'annotated_text' },
			footer_links: { type: 'node_array' }
		}
	},
	footer_link: {
		properties: {
			href: { type: 'string' },
			target: { type: 'string' },
			label: { type: 'annotated_text' }
		}
	},
	nav: {
		properties: {
			logo: { type: 'node' },
			nav_items: { type: 'node_array' }
		}
	},
	nav_item: {
		properties: {
			layout: { type: 'integer' },
			href: { type: 'string' },
			target: { type: 'string' },
			label: { type: 'annotated_text' }
		}
	},
	hero: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			title: { type: 'annotated_text' },
			description: { type: 'annotated_text' },
			buttons: { type: 'node_array' }
		}
	},
	button: {
		properties: {
			layout: { type: 'integer' },
			href: { type: 'string' },
			target: { type: 'string' },
			label: { type: 'annotated_text' }
		}
	},
	prose: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			content: { type: 'node_array' }
		}
	},
	text: {
		properties: {
			layout: { type: 'integer' },
			content: { type: 'annotated_text' }
		}
	},
	image: {
		properties: {
			src: { type: 'string' },
			width: { type: 'integer' },
			height: { type: 'integer' },
			alt: { type: 'string' },
			focal_point_x: { type: 'number' },
			focal_point_y: { type: 'number' },
			scale: { type: 'number' },
			object_fit: { type: 'string' }
		}
	},
	figure: {
		properties: {
			image: { type: 'node' }
		}
	},
	gallery: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			intro: { type: 'node_array' },
			gallery_items: { type: 'node_array' },
			outro: { type: 'node_array' }
		}
	},
	gallery_item: {
		properties: {
			image: { type: 'node' }
		}
	},
	link_collection: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			intro: { type: 'node_array' },
			link_collection_items: { type: 'node_array' },
			outro: { type: 'node_array' }
		}
	},
	link_collection_item: {
		properties: {
			href: { type: 'string' },
			target: { type: 'string' },
			image: { type: 'node' },
			preline: { type: 'annotated_text' },
			title: { type: 'annotated_text' },
			description: { type: 'annotated_text' }
		}
	},
	feature: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			image: { type: 'node' },
			body: { type: 'node_array' }
		}
	},
	link: {
		properties: {
			href: { type: 'string' },
			target: { type: 'string' }
		}
	},
	strong: { properties: {} },
	emphasis: { properties: {} },
	highlight: { properties: {} }
};

export default [
	function initial_schema({ db }) {
		// Create tables
		db.exec(sql`
			CREATE TABLE documents (
				document_id TEXT NOT NULL PRIMARY KEY,
				type TEXT NOT NULL,
				data TEXT
			);
		`);

		db.exec(sql`
			CREATE TABLE site_settings (
				key TEXT NOT NULL PRIMARY KEY,
				value TEXT
			);
		`);

		db.exec(sql`
			CREATE TABLE document_refs (
				target_document_id TEXT NOT NULL,
				source_document_id TEXT NOT NULL,
				PRIMARY KEY (target_document_id, source_document_id)
			);
		`);

		// Split demo_doc into nav, footer, and page documents
		const all_nodes = demo_doc.nodes;
		const page_node = all_nodes['page_1'];
		const nav_root_id = page_node.nav;
		const footer_root_id = page_node.footer;

		// Collect nav and footer subtrees
		const nav_node_ids = collect_node_ids(nav_root_id, all_nodes, walk_schema);
		const footer_node_ids = collect_node_ids(footer_root_id, all_nodes, walk_schema);

		// Collect page subtree, excluding nav and footer subtrees
		const exclude_roots = new Set([nav_root_id, footer_root_id]);
		const page_node_ids = collect_node_ids('page_1', all_nodes, walk_schema, exclude_roots);

		// Build the three documents
		const nav_doc = extract_document(nav_root_id, nav_node_ids, all_nodes);
		const footer_doc = extract_document(footer_root_id, footer_node_ids, all_nodes);
		const page_doc = extract_document('page_1', page_node_ids, all_nodes);

		// Insert documents
		const insert_doc = db.prepare(
			'INSERT INTO documents (document_id, type, data) VALUES(?, ?, ?)'
		);
		insert_doc.run('nav_1', 'nav', JSON.stringify(nav_doc));
		insert_doc.run('footer_1', 'footer', JSON.stringify(footer_doc));
		insert_doc.run('page_1', 'page', JSON.stringify(page_doc));

		// Set home page
		db.prepare('INSERT INTO site_settings (key, value) VALUES(?, ?)').run(
			'home_page_id',
			'page_1'
		);
	}
];