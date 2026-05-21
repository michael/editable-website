import { getRequestEvent, query, command } from '$app/server';
import * as v from 'valibot';
import crypto from 'node:crypto';
import db from '$lib/server/db.js';
import { document_schema } from '$lib/document_schema.js';
import { extract_page_metadata } from '$lib/page_metadata.js';
import {
	admin_session_cookie_name,
	get_required_admin_password,
	get_session_expires_at,
	delete_session,
	clear_admin_session_cookie,
	set_admin_session_cookie,
	require_admin_session
} from '$lib/server/auth.js';

const admin_login_input_schema = v.object({
	password: v.string()
});

const save_document_input_schema = v.object({
	document_id: v.string(),
	nodes: v.record(v.string(), v.any()),
	create: v.optional(v.boolean())
});

const delete_page_input_schema = v.object({
	document_id: v.string()
});

const sql = (strings) => strings.join('');

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
 * @property {string | null | undefined} created_at
 * @property {string | null | undefined} updated_at
 */

/**
 * @typedef {Object} DocumentData
 * @property {string} document_id
 * @property {Record<string, any>} nodes
 */

/**
 * @typedef {Object} PageDocumentRecord
 * @property {string} document_id
 * @property {Record<string, any>} nodes
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

/**
 * @typedef {Object} PreviewMediaNode
 * @property {string} type
 * @property {string} src
 * @property {number} width
 * @property {number} height
 * @property {string} alt
 * @property {number} scale
 * @property {number} focal_point_x
 * @property {number} focal_point_y
 * @property {string} object_fit
 * @property {string | undefined} mime_type
 */

/**
 * @typedef {Object} PresentationSummary
 * @property {string} document_id
 * @property {string} title
 * @property {string | null} description
 * @property {PreviewMediaNode | null} preview_media_node
 * @property {string} page_href
 * @property {string | null} created_at
 * @property {string | null} updated_at
 */

/**
 * @typedef {Object} InternalLinkPreview
 * @property {string} document_id
 * @property {string} title
 * @property {string | null} description
 * @property {PreviewMediaNode | null} preview_media_node
 */

/**
 * Collect all node ids reachable from a root node by walking node/node_array
 * properties and annotation references.
 *
 * @param {string} root_id
 * @param {Record<string, any>} nodes
 * @returns {Set<string>}
 */
function collect_node_ids(root_id, nodes) {
	const collected = new Set();
	const stack = [root_id];

	while (stack.length > 0) {
		const id = stack.pop();
		if (!id || collected.has(id)) continue;

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
		db.prepare('SELECT * FROM documents WHERE document_id = ? AND type = ?').get(document_id, 'page')
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
		db.prepare('SELECT * FROM documents WHERE document_id = ? AND type = ?').get(document_id, 'page')
	);

	if (!doc_row) return null;
	return JSON.parse(doc_row.data);
}

/**
 * @param {string} document_id
 * @returns {boolean}
 */
function page_document_exists(document_id) {
	const row = /** @type {{ document_id: string } | undefined} */ (
		db.prepare('SELECT document_id FROM documents WHERE document_id = ? AND type = ?').get(document_id, 'page')
	);
	return !!row;
}

/**
 * @returns {PageDocumentRecord[]}
 */
function list_page_documents() {
	const rows = /** @type {DocumentRow[]} */ (
		db.prepare('SELECT * FROM documents WHERE type = ? ORDER BY document_id').all('page')
	);

	return rows.map((row) => {
		const doc = /** @type {DocumentData} */ (JSON.parse(row.data));
		return {
			document_id: doc.document_id,
			nodes: doc.nodes,
			created_at: row.created_at ?? null,
			updated_at: row.updated_at ?? null
		};
	});
}

/**
 * @param {PageDocumentRecord} page_doc
 * @returns {PresentationSummary}
 */
function summarize_page_document(page_doc) {
	const metadata = extract_page_metadata({
		document_id: page_doc.document_id,
		nodes: page_doc.nodes
	});

	return {
		document_id: page_doc.document_id,
		title: metadata.title,
		description: metadata.description,
		preview_media_node: metadata.preview_media_node,
		page_href: `/${page_doc.document_id}`,
		created_at: page_doc.created_at ?? null,
		updated_at: page_doc.updated_at ?? null
	};
}

/**
 * @returns {PresentationSummary[]}
 */
function build_presentation_index() {
	return list_page_documents()
		.map(summarize_page_document)
		.sort((a, b) => {
			const a_updated_at = a.updated_at ?? a.created_at ?? '';
			const b_updated_at = b.updated_at ?? b.created_at ?? '';

			if (a_updated_at !== b_updated_at) {
				return b_updated_at.localeCompare(a_updated_at);
			}

			const title_order = a.title.localeCompare(b.title);
			if (title_order !== 0) return title_order;

			return a.document_id.localeCompare(b.document_id);
		});
}

/**
 * @param {string} href
 * @returns {{ document_id: string, fragment: string }} | null
 */
function parse_internal_page_href(href) {
	if (!href) return null;
	if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
	if (href.startsWith('//')) return null;
	if (href.startsWith('#')) return null;
	if (!href.startsWith('/')) return null;

	const [path_part, fragment_part] = href.split('#');
	if (!path_part || path_part === '/') return null;

	const segments = path_part.split('/').filter(Boolean);
	if (segments.length !== 1) return null;

	const document_id = segments[0];
	if (!document_id) return null;

	return {
		document_id,
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
	if (source_document_id && parsed.document_id === source_document_id) return null;
	if (!page_document_exists(parsed.document_id)) return null;
	return parsed.document_id;
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

export const get_auth_status = query(v.void(), async () => {
	const { locals } = getRequestEvent();

	return {
		is_admin: !!locals.is_admin
	};
});

export const get_presentation_index = query(v.void(), async () => {
	return {
		presentations: build_presentation_index()
	};
});

export const get_document = query(v.string(), async (document_id) => {
	return {
		document: get_doc_from_db(document_id)
	};
});

export const get_internal_link_preview = query(v.string(), async (href) => {
	const parsed = parse_internal_page_href(href);
	if (!parsed || !page_document_exists(parsed.document_id)) {
		return null;
	}

	const page_doc = get_doc_from_db(parsed.document_id);
	const metadata = extract_page_metadata(page_doc);

	return /** @type {InternalLinkPreview} */ ({
		document_id: parsed.document_id,
		title: metadata.title,
		description: metadata.description,
		preview_media_node: metadata.preview_media_node
	});
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
		await delete_session(session_id);
	}

	clear_admin_session_cookie(cookies);

	return {
		ok: true
	};
});

export const delete_page = command(delete_page_input_schema, async ({ document_id }) => {
	require_admin_session(getRequestEvent().locals);

	if (!document_id) {
		throw new Error('Document id is required');
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

	db.exec(sql`
		BEGIN IMMEDIATE
	`);

	try {
		delete_asset_refs.run(document_id);
		delete_outgoing_document_refs.run(document_id);
		delete_incoming_document_refs.run(document_id);
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

export const save_document = command(save_document_input_schema, async (combined_doc) => {
	require_admin_session(getRequestEvent().locals);

	const all_nodes = structuredClone(combined_doc.nodes);
	const root_node = all_nodes[combined_doc.document_id];

	if (!root_node) {
		throw new Error(`Root node not found: ${combined_doc.document_id}`);
	}

	if (root_node.type !== 'page') {
		throw new Error(`Root node must be a page: ${combined_doc.document_id}`);
	}

	if (combined_doc.create) {
		const existing_doc = get_optional_doc_from_db(combined_doc.document_id);
		if (existing_doc) {
			throw new Error(`Document already exists: ${combined_doc.document_id}`);
		}
	}

	const page_node_ids = collect_node_ids(combined_doc.document_id, all_nodes);
	const page_doc = extract_document(combined_doc.document_id, page_node_ids, all_nodes);

	const upsert = db.prepare(
		'INSERT INTO documents (document_id, type, data, created_at, updated_at) VALUES(?, ?, ?, ?, ?) ON CONFLICT(document_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
	);

	const delete_asset_refs = db.prepare('DELETE FROM asset_refs WHERE document_id = ?');
	const insert_asset_ref = db.prepare(
		'INSERT OR IGNORE INTO asset_refs (asset_id, document_id) VALUES (?, ?)'
	);

	const delete_document_refs = db.prepare('DELETE FROM document_refs WHERE source_document_id = ?');
	const insert_document_ref = db.prepare(
		'INSERT OR REPLACE INTO document_refs (target_document_id, source_document_id, ref_order) VALUES (?, ?, ?)'
	);

	db.exec(sql`
		BEGIN IMMEDIATE
	`);

	try {
		const existing_page_row = /** @type {DocumentRow | undefined} */ (
			db.prepare('SELECT created_at FROM documents WHERE document_id = ? AND type = ?').get(
				combined_doc.document_id,
				'page'
			)
		);
		const now_iso = new Date().toISOString();
		const created_at = existing_page_row?.created_at ?? now_iso;

		upsert.run(combined_doc.document_id, 'page', JSON.stringify(page_doc), created_at, now_iso);
		update_asset_refs(
			combined_doc.document_id,
			page_node_ids,
			all_nodes,
			delete_asset_refs,
			insert_asset_ref
		);
		update_document_refs(
			combined_doc.document_id,
			collect_document_refs(page_doc.nodes, page_node_ids, combined_doc.document_id),
			delete_document_refs,
			insert_document_ref
		);

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
		created: !!combined_doc.create
	};
});
