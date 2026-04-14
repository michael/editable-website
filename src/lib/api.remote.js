import { getRequestEvent, query, command } from '$app/server';
import { env } from '$env/dynamic/private';
import * as v from 'valibot';
import slugify from 'slugify';
import crypto from 'node:crypto';
import db from '$lib/server/db.js';
import { document_schema } from '$lib/document_schema.js';

const admin_login_input_schema = v.object({
	password: v.string()
});

const session_duration_seconds = 14 * 24 * 60 * 60;
const admin_session_cookie_name = 'ew_admin_session';

function create_page_url_error_result(code, message) {
	return {
		ok: false,
		code,
		message
	};
}

function create_auth_error_result(code, message) {
	return {
		ok: false,
		code,
		message
	};
}

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
 * @property {string} page_href
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
 * @property {string} page_href
 * @property {PageTreeNode[]} children
 */

const save_document_input_schema = v.object({
	document_id: v.string(),
	nodes: v.record(v.string(), v.any()),
	create: v.optional(v.boolean())
});

const update_page_slug_input_schema = v.object({
	document_id: v.string(),
	slug: v.string()
});

const delete_page_input_schema = v.object({
	document_id: v.string()
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
 * @returns {string}
 */
function get_required_admin_password() {
	const admin_password = env.ADMIN_PASSWORD;
	if (!admin_password) {
		throw new Error('ADMIN_PASSWORD must be set');
	}

	return admin_password;
}

/**
 * @returns {number}
 */
function get_session_expires_at() {
	return Math.floor(Date.now() / 1000) + session_duration_seconds;
}

/**
 * @param {string} session_id
 */
function delete_session(session_id) {
	db.prepare('DELETE FROM sessions WHERE session_id = ?').run(session_id);
}



/**
 * @param {import('@sveltejs/kit').Cookies} cookies
 */
function clear_admin_session_cookie(cookies) {
	cookies.set(admin_session_cookie_name, '', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		maxAge: 0
	});
}

/**
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @param {string} session_id
 */
function set_admin_session_cookie(cookies, session_id) {
	cookies.set(admin_session_cookie_name, session_id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		maxAge: session_duration_seconds
	});
}

/**
 * @returns {boolean}
 */
function require_admin_session() {
	const { locals } = getRequestEvent();

	if (!locals.is_admin) {
		throw new Error('Unauthorized');
	}

	return true;
}

/**
 * @param {string} document_id
 * @returns {boolean}
 */
function is_home_page_document_id(document_id) {
	return get_home_page_id_from_db() === document_id;
}

/**
 * @param {string} document_id
 * @returns {string | null}
 */
function get_active_slug_for_document_id(document_id) {
	const row = /** @type {{ slug: string } | undefined } */ (
		db.prepare('SELECT slug FROM document_slugs WHERE document_id = ? AND is_active = 1').get(
			document_id
		)
	);

	return row?.slug ?? null;
}

/**
 * @param {string} slug
 * @returns {{ document_id: string, is_active: boolean, active_slug: string } | null}
 */
function resolve_slug(slug) {
	const row = /** @type {{ document_id: string, is_active: number } | undefined } */ (
		db.prepare('SELECT document_id, is_active FROM document_slugs WHERE slug = ?').get(slug)
	);

	if (!row) return null;

	const active_slug = get_active_slug_for_document_id(row.document_id);
	if (!active_slug) {
		throw new Error(`Active slug not found for document: ${row.document_id}`);
	}

	return {
		document_id: row.document_id,
		is_active: row.is_active === 1,
		active_slug
	};
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
 * @param {string} title
 * @param {string} document_id
 * @returns {string}
 */
function create_slug_candidate(title, document_id) {
	const slug = slugify(title, { lower: true, strict: true, trim: true });
	return slug || document_id;
}

/**
 * @param {string} base_slug
 * @returns {string}
 */
function create_unique_slug(base_slug) {
	const slug_exists_stmt = db.prepare(
		'SELECT document_id FROM document_slugs WHERE slug = ?'
	);

	let slug = base_slug;
	let suffix = 2;

	while (true) {
		const row = /** @type {{ document_id: string } | undefined } */ (slug_exists_stmt.get(slug));
		if (!row) return slug;
		slug = `${base_slug}-${suffix}`;
		suffix += 1;
	}
}

/**
 * @param {string} href
 * @returns {{ slug: string, fragment: string }} | null
 */
function parse_internal_page_href(href) {
	if (!href) return null;
	if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
	if (href.startsWith('//')) return null;
	if (!href.startsWith('/')) return null;

	const [path_part, fragment_part] = href.split('#');
	if (!path_part || path_part === '/') return null;

	const segments = path_part.split('/').filter(Boolean);
	if (segments.length !== 1) return null;

	const slug = segments[0];
	if (!slug) return null;

	return {
		slug,
		fragment: fragment_part ? `#${fragment_part}` : ''
	};
}

/**
 * @param {string} href
 * @param {string | undefined} source_document_id
 * @returns {string | null}
 */
function normalize_internal_page_href(href, source_document_id) {
	const parsed = parse_internal_page_href(href);
	if (!parsed) return null;

	const resolved = resolve_slug(parsed.slug);
	if (!resolved) return null;
	if (source_document_id && resolved.document_id === source_document_id) return null;

	return resolved.document_id;
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
 * @returns {{ title: string, preview_image_src: string | null }}
 */
function extract_page_metadata(page_doc) {
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
		title: explicit_title || heading_title || fallback_title || 'Untitled page',
		preview_image_src
	};
}

/**
 * @param {DocumentData} page_doc
 * @returns {PageSummary}
 */
function summarize_page_document(page_doc) {
	const metadata = extract_page_metadata(page_doc);
	const active_slug = get_active_slug_for_document_id(page_doc.document_id);

	// By invariant, only the home page has no active slug row. All other pages
	// must have an active slug, so a missing slug here implies `/`.
	return {
		document_id: page_doc.document_id,
		title: metadata.title,
		preview_image_src: metadata.preview_image_src,
		page_href: active_slug ? `/${active_slug}` : '/'
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
			page_href: summary.page_href,
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
			preview_image_src: null,
			page_href: '/'
		};

		const seen_page_ids = new Set([home_page_id]);

		sitemap = {
			document_id: home_summary.document_id,
			title: home_summary.title,
			preview_image_src: home_summary.preview_image_src,
			page_href: home_summary.page_href,
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
export const get_document = query(v.string(), async (slug) => {
	const resolved = resolve_slug(slug);

	if (!resolved) {
		throw new Error(`Page not found for slug: ${slug}`);
	}

	return {
		document: get_combined_document(resolved.document_id),
		document_id: resolved.document_id,
		slug: resolved.active_slug,
		redirect_to_slug: resolved.is_active ? null : resolved.active_slug
	};
});

/**
 * Resolve the configured home page and return its stitched document.
 */
export const get_home_document = query(v.void(), async () => {
	const home_page_id = get_home_page_id_from_db();

	if (!home_page_id) {
		throw new Error('Home page is not configured');
	}

	return {
		document: get_combined_document(home_page_id),
		document_id: home_page_id,
		slug: get_active_slug_for_document_id(home_page_id),
		redirect_to_slug: null
	};
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
export const get_auth_status = query(v.void(), async () => {
	const { locals } = getRequestEvent();

	return {
		is_admin: !!locals.is_admin
	};
});

export const login_admin = command(admin_login_input_schema, async ({ password }) => {
	const { cookies } = getRequestEvent();
	const admin_password = get_required_admin_password();

	if (password !== admin_password) {
		return create_auth_error_result('invalid_password', 'Incorrect admin password.');
	}

	const session_id = crypto.randomUUID();
	db.prepare('INSERT INTO sessions (session_id, expires) VALUES (?, ?)').run(
		session_id,
		get_session_expires_at()
	);
	set_admin_session_cookie(cookies, session_id);

	return {
		ok: true
	};
});

export const logout_admin = command(v.void(), async () => {
	const { cookies } = getRequestEvent();
	const session_id = cookies.get(admin_session_cookie_name);

	if (session_id) {
		delete_session(session_id);
	}

	clear_admin_session_cookie(cookies);

	return {
		ok: true
	};
});

/**
 * Return page browser data for the pages drawer.
 */
export const get_page_browser_data = query(v.void(), async () => {
	require_admin_session();
	return build_page_browser_data();
});

/**
 * Delete a page document and its related refs.
 */
export const delete_page = command(delete_page_input_schema, async ({ document_id }) => {
	require_admin_session();

	const home_page_id = get_home_page_id_from_db();

	if (!document_id) {
		throw new Error('Document id is required');
	}

	if (document_id === home_page_id) {
		throw new Error('The home page cannot be deleted');
	}

	const existing_doc = get_optional_doc_from_db(document_id);
	if (!existing_doc) {
		throw new Error(`Document not found: ${document_id}`);
	}

	const delete_document = db.prepare('DELETE FROM documents WHERE document_id = ? AND type = ?');
	const delete_asset_refs = db.prepare('DELETE FROM asset_refs WHERE document_id = ?');
	const delete_outgoing_document_refs = db.prepare(
		'DELETE FROM document_refs WHERE source_document_id = ?'
	);
	const delete_incoming_document_refs = db.prepare(
		'DELETE FROM document_refs WHERE target_document_id = ?'
	);
	const delete_document_slugs = db.prepare('DELETE FROM document_slugs WHERE document_id = ?');

	db.exec(sql`
		BEGIN IMMEDIATE
	`);

	try {
		delete_asset_refs.run(document_id);
		delete_outgoing_document_refs.run(document_id);
		delete_incoming_document_refs.run(document_id);
		delete_document_slugs.run(document_id);
		delete_document.run(document_id, 'page');

		db.exec(sql`
			COMMIT
		`);
	} catch (err) {
		db.exec(sql`
			ROLLBACK
		`);
		throw err;
	}

	return {
		ok: true,
		document_id
	};
});

/**
 * Return a lightweight preview for a simple internal page href like `/some-slug`.
 */
export const get_internal_link_preview = query(v.string(), async (href) => {
	const parsed = parse_internal_page_href(href);
	if (!parsed) {
		return null;
	}

	const resolved = resolve_slug(parsed.slug);
	if (!resolved) {
		return null;
	}

	const doc_row = /** @type {DocumentRow | undefined} */ (
		db.prepare('SELECT type, data FROM documents WHERE document_id = ?').get(resolved.document_id)
	);
	if (!doc_row || doc_row.type !== 'page') {
		return null;
	}

	const page_doc = /** @type {DocumentData} */ (JSON.parse(doc_row.data));
	const metadata = extract_page_metadata(page_doc);

	return /** @type {InternalLinkPreview} */ ({
		document_id: resolved.document_id,
		title: metadata.title,
		preview_image_src: metadata.preview_image_src
	});
});

/**
 * Save a document to the database, splitting shared documents (nav, footer) back out.
 */
function rewrite_internal_page_href(href, target_document_id, new_slug) {
	const parsed = parse_internal_page_href(href);
	if (!parsed) return href;

	const resolved = resolve_slug(parsed.slug);
	if (resolved?.document_id !== target_document_id) return href;

	return `/${new_slug}${parsed.fragment}`;
}

function rewrite_internal_page_hrefs(nodes, target_document_id, new_slug) {
	for (const node of Object.values(nodes)) {
		if (!node || typeof node !== 'object') continue;

		if (typeof node.href === 'string') {
			node.href = rewrite_internal_page_href(node.href, target_document_id, new_slug);
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

				annotation_node.href = rewrite_internal_page_href(
					annotation_node.href,
					target_document_id,
					new_slug
				);
			}
		}
	}
}

function insert_active_slug(document_id, slug, insert_slug_stmt, deactivate_slug_stmt) {
	deactivate_slug_stmt.run(document_id);
	insert_slug_stmt.run(slug, document_id, 1, new Date().toISOString());
}

function move_active_slug_to_history(document_id, insert_slug_stmt, deactivate_slug_stmt, delete_slug_stmt) {
	const current_slug = get_active_slug_for_document_id(document_id);
	if (!current_slug) return null;

	delete_slug_stmt.run(current_slug);
	insert_slug_stmt.run(current_slug, document_id, 0, new Date().toISOString());
	deactivate_slug_stmt.run(document_id);
	return current_slug;
}

function assign_active_slug(document_id, slug, insert_slug_stmt, deactivate_slug_stmt, delete_slug_stmt) {
	delete_slug_stmt.run(slug);
	insert_active_slug(document_id, slug, insert_slug_stmt, deactivate_slug_stmt);
}

export const save_document = command(save_document_input_schema, async (combined_doc) => {
	require_admin_session();

	const all_nodes = structuredClone(combined_doc.nodes);
	const page_node = all_nodes[combined_doc.document_id];

	if (!page_node) {
		throw new Error(`Root node not found: ${combined_doc.document_id}`);
	}

	if (combined_doc.create) {
		const existing_doc = get_optional_doc_from_db(combined_doc.document_id);
		if (existing_doc) {
			throw new Error(`Document already exists: ${combined_doc.document_id}`);
		}
	}

	const nav_root_id = page_node.nav;
	const footer_root_id = page_node.footer;

	const nav_node_ids = nav_root_id ? new Set(collect_node_ids_in_order(nav_root_id, all_nodes)) : new Set();
	const footer_node_ids = footer_root_id
		? new Set(collect_node_ids_in_order(footer_root_id, all_nodes))
		: new Set();

	const exclude_roots = new Set();
	if (nav_root_id) exclude_roots.add(nav_root_id);
	if (footer_root_id) exclude_roots.add(footer_root_id);

	const page_node_ids = collect_node_ids(combined_doc.document_id, all_nodes, exclude_roots);
	const page_doc = extract_document(combined_doc.document_id, page_node_ids, all_nodes);

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

	const delete_slug = db.prepare('DELETE FROM document_slugs WHERE slug = ?');
	const deactivate_active_slug = db.prepare(
		'UPDATE document_slugs SET is_active = 0 WHERE document_id = ? AND is_active = 1'
	);
	const insert_slug = db.prepare(
		'INSERT INTO document_slugs (slug, document_id, is_active, created_at) VALUES (?, ?, ?, ?)'
	);

	db.exec(sql`
		BEGIN IMMEDIATE
	`);

	try {
		upsert.run(combined_doc.document_id, 'page', JSON.stringify(page_doc));
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

		let active_slug = get_active_slug_for_document_id(combined_doc.document_id);

		if (combined_doc.create && !active_slug && !is_home_page_document_id(combined_doc.document_id)) {
			const metadata = extract_page_metadata(page_doc);
			const base_slug = create_slug_candidate(metadata.title, combined_doc.document_id);
			active_slug = create_unique_slug(base_slug);
			insert_active_slug(combined_doc.document_id, active_slug, insert_slug, deactivate_active_slug);
		}

		const persisted_page = get_optional_doc_from_db(combined_doc.document_id);
		if (!persisted_page) {
			throw new Error(`Failed to persist page document: ${combined_doc.document_id}`);
		}

		db.exec(sql`
			COMMIT
		`);
	} catch (err) {
		db.exec(sql`
			ROLLBACK
		`);
		throw err;
	}

	return {
		ok: true,
		document_id: combined_doc.document_id,
		slug: is_home_page_document_id(combined_doc.document_id)
			? null
			: get_active_slug_for_document_id(combined_doc.document_id),
		created: !!combined_doc.create
	};
});

export const update_page_slug = command(update_page_slug_input_schema, async (input) => {
	require_admin_session();

	const normalized_slug = slugify(input.slug, { lower: true, strict: true, trim: true });

	if (!normalized_slug) {
		return create_page_url_error_result('page_url_empty', 'Page URL cannot be empty');
	}

	const existing_doc = get_optional_doc_from_db(input.document_id);
	if (!existing_doc) {
		return create_page_url_error_result('page_not_found', `Document not found: ${input.document_id}`);
	}

	const home_page_id = get_home_page_id_from_db();
	if (home_page_id === input.document_id) {
		return create_page_url_error_result('home_page_url_locked', 'The home page URL cannot be changed');
	}

	const current_active_slug = get_active_slug_for_document_id(input.document_id);
	if (!current_active_slug) {
		return create_page_url_error_result(
			'active_slug_missing',
			`Active slug not found for document: ${input.document_id}`
		);
	}

	if (normalized_slug === current_active_slug) {
		return create_page_url_error_result(
			'page_url_same_as_current',
			'That Page URL is already in use by this page'
		);
	}

	const existing_slug = /** @type {{ document_id: string, is_active: number } | undefined} */ (
		db.prepare('SELECT document_id, is_active FROM document_slugs WHERE slug = ?').get(normalized_slug)
	);

	if (existing_slug && existing_slug.document_id !== input.document_id && existing_slug.is_active === 1) {
		return create_page_url_error_result(
			'page_url_used_by_other_page',
			'That Page URL is already in use by another page. Rename that page first.'
		);
	}

	const delete_slug = db.prepare('DELETE FROM document_slugs WHERE slug = ?');
	const deactivate_active_slug = db.prepare(
		'UPDATE document_slugs SET is_active = 0 WHERE document_id = ? AND is_active = 1'
	);
	const insert_slug = db.prepare(
		'INSERT INTO document_slugs (slug, document_id, is_active, created_at) VALUES (?, ?, ?, ?)'
	);

	db.exec(sql`
		BEGIN IMMEDIATE
	`);

	let new_active_slug = null;

	try {
		move_active_slug_to_history(
			input.document_id,
			insert_slug,
			deactivate_active_slug,
			delete_slug
		);
		assign_active_slug(
			input.document_id,
			normalized_slug,
			insert_slug,
			deactivate_active_slug,
			delete_slug
		);

		new_active_slug = get_active_slug_for_document_id(input.document_id);
		if (!new_active_slug) {
			throw new Error('Failed to assign new active slug');
		}

		const page_rows = /** @type {DocumentRow[]} */ (
			db.prepare('SELECT * FROM documents WHERE type IN (?, ?, ?) ORDER BY document_id').all(
				'page',
				'nav',
				'footer'
			)
		);

		const upsert = db.prepare(
			'INSERT INTO documents (document_id, type, data) VALUES(?, ?, ?) ON CONFLICT(document_id) DO UPDATE SET data = excluded.data'
		);
		const delete_document_refs = db.prepare('DELETE FROM document_refs WHERE source_document_id = ?');
		const insert_document_ref = db.prepare(
			'INSERT OR REPLACE INTO document_refs (target_document_id, source_document_id, ref_order) VALUES (?, ?, ?)'
		);

		for (const row of page_rows) {
			const doc = JSON.parse(row.data);
			rewrite_internal_page_hrefs(doc.nodes, input.document_id, new_active_slug);
			upsert.run(row.document_id, row.type, JSON.stringify(doc));

			const root_id = row.document_id;
			const node_ids = collect_node_ids(root_id, doc.nodes);
			update_document_refs(
				root_id,
				collect_document_refs(doc.nodes, node_ids, root_id),
				delete_document_refs,
				insert_document_ref
			);
		}

		db.exec(sql`
			COMMIT
		`);
	} catch (err) {
		db.exec(sql`
			ROLLBACK
		`);
		throw err;
	}

	return {
		ok: true,
		document_id: input.document_id,
		page_href: `/${new_active_slug}`
	};
});
