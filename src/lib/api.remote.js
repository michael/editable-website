import { getRequestEvent, query, command } from '$app/server';
import * as v from 'valibot';
import db from '$lib/server/db.js';
import { DB_PATH } from '$lib/server_config.js';
import { document_schema } from '$lib/document_schema.js';

/**
 * @typedef {Object} DocumentRow
 * @property {string} document_id
 * @property {string} type
 * @property {string} data
 */

/**
 * @typedef {Object} DocumentData
 * @property {string} document_id
 * @property {Record<string, any>} nodes
 */

/**
 * @typedef {Object} PageSummary
 * @property {string} document_id
 * @property {string} title
 * @property {string | null} preview_image_src
 */

/**
 * @typedef {Object} InternalLinkPreview
 * @property {string} document_id
 * @property {string} title
 * @property {string | null} preview_image_src
 */

/**
 * @typedef {Object} PageTreeNode
 * @property {string} document_id
 * @property {string} title
 * @property {string | null} preview_image_src
 * @property {PageTreeNode[]} children
 */

const save_document_input_schema = v.object({
	document_id: v.string(),
	nodes: v.record(v.string(), v.any()),
	create: v.optional(v.boolean())
});

const sql = (strings) => strings.join('');

/**
 * Collect all node ids reachable from a root node by walking node/node_array
 * properties and annotation references.
 *
 * @param {string} root_id
 * @param {Record<string, any>} nodes
 * @param {Set<string>} [exclude_roots]
 * @returns {Set<string>}
 */
function collect_node_ids(root_id, nodes, exclude_roots) {
	const collected = new Set();
	const stack = [root_id];

	while (stack.length > 0) {
		const id = stack.pop();
		if (!id || collected.has(id)) continue;
		if (exclude_roots && exclude_roots.has(id) && id !== root_id) continue;

		collected.add(id);

		const node = nodes[id];
		if (!node) continue;

		const type_schema = document_schema[node.type];
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
 * Collect all node ids reachable from a root node by walking node/node_array
 * properties and annotation references, preserving first-seen traversal order.
 *
 * @param {string} root_id
 * @param {Record<string, any>} nodes
 * @param {Set<string>} [exclude_roots]
 * @returns {string[]}
 */
function collect_node_ids_in_order(root_id, nodes, exclude_roots) {
	const collected = [];
	const seen_ids = new Set();
	const stack = [root_id];

	while (stack.length > 0) {
		const id = stack.pop();
		if (!id || seen_ids.has(id)) continue;
		if (exclude_roots && exclude_roots.has(id) && id !== root_id) continue;

		seen_ids.add(id);
		collected.push(id);

		const node = nodes[id];
		if (!node) continue;

		const type_schema = document_schema[node.type];
		if (!type_schema) continue;

		const next_ids = [];

		for (const [prop_name, prop_def] of Object.entries(type_schema.properties)) {
			const value = node[prop_name];
			if (value == null) continue;

			if (prop_def.type === 'node' && typeof value === 'string') {
				next_ids.push(value);
			} else if (prop_def.type === 'node_array' && Array.isArray(value)) {
				for (const child_id of value) {
					next_ids.push(child_id);
				}
			} else if (prop_def.type === 'annotated_text' && value.annotations) {
				for (const annotation of value.annotations) {
					if (annotation.node_id) {
						next_ids.push(annotation.node_id);
					}
				}
			}
		}

		for (let i = next_ids.length - 1; i >= 0; i -= 1) {
			stack.push(next_ids[i]);
		}
	}

	return collected;
}

/**
 * @param {string} document_id
 * @param {Set<string>} node_ids
 * @param {Record<string, any>} all_nodes
 * @returns {DocumentData}
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

/**
 * @param {string} document_id
 * @returns {DocumentData}
 */
function get_doc_from_db(document_id) {
	const doc_row = /** @type {DocumentRow | undefined} */ (
		db.prepare('SELECT * FROM documents WHERE document_id = ?').get(document_id)
	);

	if (!doc_row) {
		throw new Error(`Document not found: ${document_id}`);
	}

	return JSON.parse(doc_row.data);
}

/**
 * @param {string} document_id
 * @returns {DocumentData | null}
 */
function get_optional_doc_from_db(document_id) {
	const doc_row = /** @type {DocumentRow | undefined} */ (
		db.prepare('SELECT * FROM documents WHERE document_id = ?').get(document_id)
	);

	if (!doc_row) return null;
	return JSON.parse(doc_row.data);
}

/**
 * @returns {string | null}
 */
function get_home_page_id_from_db() {
	const row = /** @type {{ value: string } | undefined } */ (
		db.prepare('SELECT value FROM site_settings WHERE key = ?').get('home_page_id')
	);

	return row?.value ?? null;
}

/**
 * @returns {DocumentData[]}
 */
function list_page_documents() {
	const rows = /** @type {DocumentRow[]} */ (
		db.prepare('SELECT * FROM documents WHERE type = ? ORDER BY document_id').all('page')
	);

	return rows.map((row) => JSON.parse(row.data));
}

/**
 * @param {string} href
 * @param {string | undefined} source_document_id
 * @returns {string | null}
 */
function normalize_internal_page_href(href, source_document_id) {
	if (!href) return null;
	if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
	if (href.startsWith('//')) return null;

	const [path_part] = href.split('#');

	if (!path_part) return null;
	if (path_part === '/') return null;
	if (!path_part.startsWith('/')) return null;

	const segments = path_part.split('/').filter(Boolean);
	if (segments.length !== 1) return null;

	const target_document_id = segments[0];
	if (!target_document_id) return null;
	if (source_document_id && target_document_id === source_document_id) return null;

	return target_document_id;
}

/**
 * @param {Record<string, any>} nodes
 * @param {Iterable<string>} node_ids
 * @param {string} source_document_id
 * @returns {string[]}
 */
function collect_document_refs(nodes, node_ids, source_document_id) {
	const refs = [];
	const seen_refs = new Set();

	for (const node_id of node_ids) {
		const node = nodes[node_id];
		if (!node) continue;

		if (typeof node.href === 'string') {
			const target_document_id = normalize_internal_page_href(node.href, source_document_id);
			if (target_document_id && !seen_refs.has(target_document_id)) {
				seen_refs.add(target_document_id);
				refs.push(target_document_id);
			}
		}

		const type_schema = document_schema[node.type];
		if (!type_schema) continue;

		for (const [prop_name, prop_def] of Object.entries(type_schema.properties)) {
			if (prop_def.type !== 'annotated_text') continue;

			const value = node[prop_name];
			if (!value?.annotations) continue;

			for (const annotation of value.annotations) {
				const annotation_node = annotation?.node_id ? nodes[annotation.node_id] : null;
				if (!annotation_node || annotation_node.type !== 'link') continue;
				if (typeof annotation_node.href !== 'string') continue;

				const target_document_id = normalize_internal_page_href(
					annotation_node.href,
					source_document_id
				);

				if (target_document_id && !seen_refs.has(target_document_id)) {
					seen_refs.add(target_document_id);
					refs.push(target_document_id);
				}
			}
		}
	}

	return refs;
}

/**
 * @param {string} document_id
 * @param {Iterable<string>} node_ids
 * @param {Record<string, any>} all_nodes
 * @param {import('node:sqlite').StatementSync} delete_stmt
 * @param {import('node:sqlite').StatementSync} insert_stmt
 */
function update_asset_refs(document_id, node_ids, all_nodes, delete_stmt, insert_stmt) {
	const asset_ids = new Set();

	for (const node_id of node_ids) {
		const node = all_nodes[node_id];
		if (
			node &&
			(node.type === 'image' || node.type === 'video') &&
			typeof node.src === 'string' &&
			node.src &&
			!node.src.startsWith('blob:')
		) {
			asset_ids.add(node.src);
		}
	}

	delete_stmt.run(document_id);
	for (const asset_id of asset_ids) {
		insert_stmt.run(asset_id, document_id);
	}
}

/**
 * @param {string} source_document_id
 * @param {string[]} target_document_ids
 * @param {import('node:sqlite').StatementSync} delete_stmt
 * @param {import('node:sqlite').StatementSync} insert_stmt
 */
function update_document_refs(source_document_id, target_document_ids, delete_stmt, insert_stmt) {
	delete_stmt.run(source_document_id);
	for (const [ref_order, target_document_id] of target_document_ids.entries()) {
		insert_stmt.run(target_document_id, source_document_id, ref_order);
	}
}

/**
 * @param {DocumentData} page_doc
 * @returns {{ nav_root_id: string | null, footer_root_id: string | null }}
 */
function get_shared_root_ids(page_doc) {
	const page_node = page_doc.nodes[page_doc.document_id];

	return {
		nav_root_id: typeof page_node?.nav === 'string' ? page_node.nav : null,
		footer_root_id: typeof page_node?.footer === 'string' ? page_node.footer : null
	};
}

/**
 * @param {string} document_id
 * @returns {DocumentData}
 */
function get_combined_document(document_id) {
	const page_doc = get_doc_from_db(document_id);
	const page_node = page_doc.nodes[page_doc.document_id];
	const merged_nodes = { ...page_doc.nodes };

	if (page_node?.nav) {
		const nav_doc = get_doc_from_db(page_node.nav);
		Object.assign(merged_nodes, nav_doc.nodes);
	}

	if (page_node?.footer) {
		const footer_doc = get_doc_from_db(page_node.footer);
		Object.assign(merged_nodes, footer_doc.nodes);
	}

	return {
		document_id: page_doc.document_id,
		nodes: merged_nodes
	};
}

/**
 * @param {DocumentData} page_doc
 * @returns {string[]}
 */
function collect_page_body_node_ids(page_doc) {
	const page_root = page_doc.nodes[page_doc.document_id];

	if (!page_root?.body || !Array.isArray(page_root.body)) {
		return [page_doc.document_id];
	}

	const body_node_ids = [page_doc.document_id];
	const seen_ids = new Set(body_node_ids);

	for (const child_id of page_root.body) {
		const subtree_ids = collect_node_ids_in_order(child_id, page_doc.nodes);
		for (const subtree_id of subtree_ids) {
			if (seen_ids.has(subtree_id)) continue;
			seen_ids.add(subtree_id);
			body_node_ids.push(subtree_id);
		}
	}

	return body_node_ids;
}

/**
 * @param {any} annotated_text
 * @returns {string}
 */
function extract_plain_text(annotated_text) {
	if (!annotated_text || typeof annotated_text.text !== 'string') return '';
	return annotated_text.text.trim();
}

/**
 * @param {DocumentData} page_doc
 * @returns {PageSummary}
 */
function summarize_page_document(page_doc) {
	const body_node_ids = collect_page_body_node_ids(page_doc);

	let explicit_title = '';
	let heading_title = '';
	let fallback_title = '';
	let preview_image_src = null;

	for (const node_id of body_node_ids) {
		const node = page_doc.nodes[node_id];
		if (!node) continue;

		if (!preview_image_src && (node.type === 'image' || node.type === 'video') && node.src) {
			preview_image_src = node.src;
		}

		if (node.type === 'text') {
			const text = extract_plain_text(node.content);
			if (!text) continue;

			if (!heading_title && (node.layout === 2 || node.layout === 3 || node.layout === 4)) {
				heading_title = text;
			}

			if (!fallback_title) {
				fallback_title = text;
			}
		}

		if (node.type === 'hero') {
			const hero_title = extract_plain_text(node.title);
			if (!explicit_title && hero_title) {
				explicit_title = hero_title;
			}

			if (!fallback_title && hero_title) {
				fallback_title = hero_title;
			}

			const hero_description = extract_plain_text(node.description);
			if (!fallback_title && hero_description) {
				fallback_title = hero_description;
			}
		}

		if (node.type === 'link_collection_item') {
			const item_title = extract_plain_text(node.title);
			if (!fallback_title && item_title) {
				fallback_title = item_title;
			}
		}
	}

	return {
		document_id: page_doc.document_id,
		title: explicit_title || heading_title || fallback_title || 'Untitled page',
		preview_image_src
	};
}

/**
 * @param {string} source_document_id
 * @returns {string[]}
 */
function get_outgoing_refs(source_document_id) {
	const rows = /** @type {Array<{ target_document_id: string }>} */ (
		db.prepare(
			'SELECT target_document_id FROM document_refs WHERE source_document_id = ? ORDER BY ref_order, rowid'
		).all(source_document_id)
	);

	return rows.map((row) => row.target_document_id);
}

/**
 * @param {Map<string, DocumentData>} page_docs_by_id
 * @param {string | null} home_page_id
 * @param {string | null} nav_root_id
 * @param {string | null} footer_root_id
 * @returns {Set<string>}
 */
function get_reachable_page_ids(page_docs_by_id, home_page_id, nav_root_id, footer_root_id) {
	const reachable = new Set();

	if (!home_page_id || !page_docs_by_id.has(home_page_id)) {
		return reachable;
	}

	const queue = [home_page_id];
	if (nav_root_id) queue.push(nav_root_id);
	if (footer_root_id) queue.push(footer_root_id);

	const visited_documents = new Set();

	while (queue.length > 0) {
		const source_document_id = queue.shift();
		if (!source_document_id || visited_documents.has(source_document_id)) continue;

		visited_documents.add(source_document_id);

		if (page_docs_by_id.has(source_document_id)) {
			reachable.add(source_document_id);
		}

		for (const target_document_id of get_outgoing_refs(source_document_id)) {
			if (!visited_documents.has(target_document_id)) {
				queue.push(target_document_id);
			}
		}
	}

	return reachable;
}

/**
 * @param {string[]} refs
 * @param {Set<string>} seen_page_ids
 * @param {Map<string, PageSummary>} summaries_by_id
 * @param {Map<string, string[]>} body_refs_by_page_id
 * @returns {PageTreeNode[]}
 */
function build_tree_children(refs, seen_page_ids, summaries_by_id, body_refs_by_page_id) {
	const children = [];

	for (const target_document_id of refs) {
		if (seen_page_ids.has(target_document_id)) continue;

		const summary = summaries_by_id.get(target_document_id);
		if (!summary) continue;

		seen_page_ids.add(target_document_id);

		children.push({
			document_id: summary.document_id,
			title: summary.title,
			preview_image_src: summary.preview_image_src,
			children: build_tree_children(
				body_refs_by_page_id.get(target_document_id) ?? [],
				seen_page_ids,
				summaries_by_id,
				body_refs_by_page_id
			)
		});
	}

	return children;
}

/**
 * @returns {{
 *   home_page_id: string | null,
 *   drafts: PageSummary[],
 *   sitemap: PageTreeNode | null
 * }}
 */
function build_page_browser_data() {
	const home_page_id = get_home_page_id_from_db();
	const page_docs = list_page_documents();
	const page_docs_by_id = new Map(page_docs.map((page_doc) => [page_doc.document_id, page_doc]));
	const summaries = page_docs.map(summarize_page_document);
	const summaries_by_id = new Map(summaries.map((summary) => [summary.document_id, summary]));

	const home_page_doc = home_page_id ? page_docs_by_id.get(home_page_id) ?? null : null;
	const { nav_root_id, footer_root_id } = home_page_doc
		? get_shared_root_ids(home_page_doc)
		: { nav_root_id: null, footer_root_id: null };

	const reachable_page_ids = get_reachable_page_ids(
		page_docs_by_id,
		home_page_id,
		nav_root_id,
		footer_root_id
	);

	const body_refs_by_page_id = new Map();
	for (const page_doc of page_docs) {
		const body_node_ids = collect_page_body_node_ids(page_doc);
		body_refs_by_page_id.set(
			page_doc.document_id,
			collect_document_refs(page_doc.nodes, body_node_ids, page_doc.document_id)
		);
	}

	const nav_refs = nav_root_id
		? get_outgoing_refs(nav_root_id).filter((document_id) => reachable_page_ids.has(document_id))
		: [];

	const footer_refs = footer_root_id
		? get_outgoing_refs(footer_root_id).filter((document_id) => reachable_page_ids.has(document_id))
		: [];

	const home_body_refs = home_page_id
		? (body_refs_by_page_id.get(home_page_id) ?? []).filter((document_id) =>
				reachable_page_ids.has(document_id)
			)
		: [];

	let sitemap = null;

	if (home_page_id) {
		const home_summary = summaries_by_id.get(home_page_id) ?? {
			document_id: home_page_id,
			title: 'Untitled page',
			preview_image_src: null
		};

		const seen_page_ids = new Set([home_page_id]);

		sitemap = {
			document_id: home_summary.document_id,
			title: home_summary.title,
			preview_image_src: home_summary.preview_image_src,
			children: build_tree_children(
				[...nav_refs, ...home_body_refs, ...footer_refs],
				seen_page_ids,
				summaries_by_id,
				body_refs_by_page_id
			)
		};
	}

	const drafts = summaries
		.filter((summary) => !reachable_page_ids.has(summary.document_id))
		.sort((a, b) => a.title.localeCompare(b.title));

	return {
		home_page_id,
		drafts,
		sitemap
	};
}

/**
 * Get a document from the database, stitching in shared documents (nav, footer).
 */
export const get_document = query(v.string(), async (document_id) => {
	return get_combined_document(document_id);
});

/**
 * Resolve the configured home page and return its stitched document.
 */
export const get_home_document = query(v.void(), async () => {
	const home_page_id = get_home_page_id_from_db();

	if (!home_page_id) {
		throw new Error('Home page is not configured');
	}

	return get_combined_document(home_page_id);
});

/**
 * Return the current shared nav and footer documents used for composing new pages.
 */
export const get_shared_documents = query(v.void(), async () => {
	const home_page_id = get_home_page_id_from_db();

	if (!home_page_id) {
		throw new Error('Home page is not configured');
	}

	const home_page_doc = get_doc_from_db(home_page_id);
	const { nav_root_id, footer_root_id } = get_shared_root_ids(home_page_doc);

	if (!nav_root_id) {
		throw new Error('Home page nav document is not configured');
	}

	if (!footer_root_id) {
		throw new Error('Home page footer document is not configured');
	}

	return {
		nav_document: get_doc_from_db(nav_root_id),
		footer_document: get_doc_from_db(footer_root_id)
	};
});

/**
 * Return page browser data for the pages drawer.
 */
export const get_page_browser_data = query(v.void(), async () => {
	return build_page_browser_data();
});

/**
 * Return a lightweight preview for a simple internal page href like `/some_id`.
 */
export const get_internal_link_preview = query(v.string(), async (href) => {
	if (typeof href !== 'string' || !href.startsWith('/') || href === '/') {
		return null;
	}

	if (href.includes('?') || href.includes('#')) {
		return null;
	}

	const document_id = href.slice(1);
	if (!document_id || document_id.includes('/')) {
		return null;
	}

	const doc_row = /** @type {DocumentRow | undefined} */ (
		db.prepare('SELECT type, data FROM documents WHERE document_id = ?').get(document_id)
	);
	if (!doc_row || doc_row.type !== 'page') {
		return null;
	}

	const page_doc = /** @type {DocumentData} */ (JSON.parse(doc_row.data));
	const summary = summarize_page_document(page_doc);

	return /** @type {InternalLinkPreview} */ ({
		document_id,
		title: summary.title,
		preview_image_src: summary.preview_image_src
	});
});

/**
 * Save a document to the database, splitting shared documents (nav, footer) back out.
 */
export const save_document = command(save_document_input_schema, async (combined_doc) => {
	const { locals } = getRequestEvent();

	// TODO: check auth once authentication is implemented
	// if (!locals.user) {
	// 	throw new Error('Unauthorized');
	// }

	console.log('[save_document] start', {
		document_id: combined_doc.document_id,
		create: !!combined_doc.create,
		db_path: DB_PATH
	});

	const all_nodes = combined_doc.nodes;
	const page_node = all_nodes[combined_doc.document_id];

	if (!page_node) {
		throw new Error(`Root node not found: ${combined_doc.document_id}`);
	}

	if (combined_doc.create) {
		const existing_doc = get_optional_doc_from_db(combined_doc.document_id);
		console.log('[save_document] create check', {
			document_id: combined_doc.document_id,
			already_exists: !!existing_doc
		});
		if (existing_doc) {
			throw new Error(`Document already exists: ${combined_doc.document_id}`);
		}
	}

	const nav_root_id = page_node.nav;
	const footer_root_id = page_node.footer;

	console.log('[save_document] roots', {
		page_document_id: combined_doc.document_id,
		nav_root_id,
		footer_root_id
	});

	const nav_node_ids = nav_root_id ? new Set(collect_node_ids_in_order(nav_root_id, all_nodes)) : new Set();
	const footer_node_ids = footer_root_id
		? new Set(collect_node_ids_in_order(footer_root_id, all_nodes))
		: new Set();

	const exclude_roots = new Set();
	if (nav_root_id) exclude_roots.add(nav_root_id);
	if (footer_root_id) exclude_roots.add(footer_root_id);

	const page_node_ids = collect_node_ids(combined_doc.document_id, all_nodes, exclude_roots);
	const page_doc = extract_document(combined_doc.document_id, page_node_ids, all_nodes);

	console.log('[save_document] split sizes', {
		page_node_count: page_node_ids.size,
		nav_node_count: nav_node_ids.size,
		footer_node_count: footer_node_ids.size
	});

	const upsert = db.prepare(
		'INSERT INTO documents (document_id, type, data) VALUES(?, ?, ?) ON CONFLICT(document_id) DO UPDATE SET data = excluded.data'
	);

	const delete_asset_refs = db.prepare('DELETE FROM asset_refs WHERE document_id = ?');
	const insert_asset_ref = db.prepare(
		'INSERT OR IGNORE INTO asset_refs (asset_id, document_id) VALUES (?, ?)'
	);

	const delete_document_refs = db.prepare('DELETE FROM document_refs WHERE source_document_id = ?');
	const insert_document_ref = db.prepare(
		'INSERT OR REPLACE INTO document_refs (target_document_id, source_document_id, ref_order) VALUES (?, ?, ?)'
	);

	console.log('[save_document] begin transaction', {
		document_id: combined_doc.document_id
	});

	db.exec(sql`
		BEGIN IMMEDIATE
	`);

	try {
		upsert.run(combined_doc.document_id, 'page', JSON.stringify(page_doc));
		console.log('[save_document] upserted page', {
			document_id: combined_doc.document_id
		});
		update_asset_refs(
			combined_doc.document_id,
			page_node_ids,
			all_nodes,
			delete_asset_refs,
			insert_asset_ref
		);
		update_document_refs(
			combined_doc.document_id,
			collect_document_refs(all_nodes, page_node_ids, combined_doc.document_id),
			delete_document_refs,
			insert_document_ref
		);

		if (nav_root_id && nav_node_ids.size > 0) {
			const nav_doc = extract_document(nav_root_id, nav_node_ids, all_nodes);
			upsert.run(nav_root_id, 'nav', JSON.stringify(nav_doc));
			console.log('[save_document] upserted nav', {
				document_id: nav_root_id
			});
			update_asset_refs(nav_root_id, nav_node_ids, all_nodes, delete_asset_refs, insert_asset_ref);
			update_document_refs(
				nav_root_id,
				collect_document_refs(all_nodes, nav_node_ids, nav_root_id),
				delete_document_refs,
				insert_document_ref
			);
		}

		if (footer_root_id && footer_node_ids.size > 0) {
			const footer_doc = extract_document(footer_root_id, footer_node_ids, all_nodes);
			upsert.run(footer_root_id, 'footer', JSON.stringify(footer_doc));
			console.log('[save_document] upserted footer', {
				document_id: footer_root_id
			});
			update_asset_refs(
				footer_root_id,
				footer_node_ids,
				all_nodes,
				delete_asset_refs,
				insert_asset_ref
			);
			update_document_refs(
				footer_root_id,
				collect_document_refs(all_nodes, footer_node_ids, footer_root_id),
				delete_document_refs,
				insert_document_ref
			);
		}

		const persisted_page = get_optional_doc_from_db(combined_doc.document_id);
		console.log('[save_document] read back page before commit', {
			document_id: combined_doc.document_id,
			found: !!persisted_page
		});
		if (!persisted_page) {
			throw new Error(`Failed to persist page document: ${combined_doc.document_id}`);
		}

		db.exec(sql`
			COMMIT
		`);
		console.log('[save_document] committed', {
			document_id: combined_doc.document_id,
			created: !!combined_doc.create
		});
	} catch (err) {
		console.error('[save_document] failed', {
			document_id: combined_doc.document_id,
			create: !!combined_doc.create,
			error: err instanceof Error ? err.message : String(err)
		});
		db.exec(sql`
			ROLLBACK
		`);
		throw err;
	}

	return {
		ok: true,
		document_id: combined_doc.document_id,
		created: !!combined_doc.create
	};
});