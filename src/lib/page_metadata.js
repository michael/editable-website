import { collect_node_ids_in_order } from '$lib/document_graph.js';

// Shared helpers for extracting page-level metadata from a page document.

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
 * @typedef {Object} PageMetadata
 * @property {string} title
 * @property {string | null} description
 * @property {PreviewMediaNode | null} preview_media_node
 */

/**
 * @param {{ text?: string } | null | undefined} annotated_text
 * @returns {string}
 */
export function extract_plain_text(annotated_text) {
	if (!annotated_text || typeof annotated_text.text !== 'string') return '';
	return annotated_text.text.trim();
}

/**
 * @param {{ document_id: string, nodes: Record<string, any> } | null | undefined} page_doc
 * @returns {string[]}
 */
export function collect_page_body_node_ids(page_doc) {
	if (!page_doc?.document_id || !page_doc.nodes) {
		return [];
	}

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
 * @param {{ document_id: string, nodes: Record<string, any> } | null | undefined} page_doc
 * @returns {PageMetadata}
 */
export function extract_page_metadata(page_doc) {
	if (!page_doc?.document_id || !page_doc.nodes) {
		return {
			title: 'Editable Website',
			description: null,
			preview_media_node: null
		};
	}

	const body_node_ids = collect_page_body_node_ids(page_doc);
	const page_root = page_doc.nodes[page_doc.document_id];

	let explicit_title = extract_plain_text(page_root?.title);
	let explicit_description = extract_plain_text(page_root?.description);
	let heading_title = '';
	let fallback_title = '';
	let fallback_description = '';
	let first_image_node = null;
	let first_video_node = null;

	for (const node_id of body_node_ids) {
		const node = page_doc.nodes[node_id];
		if (!node) continue;

		if (!first_image_node && node.type === 'image') {
			first_image_node = node;
		} else if (!first_video_node && node.type === 'video') {
			first_video_node = node;
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

			if (!fallback_description) {
				fallback_description = text;
			}
		}

		if (node.type === 'hero') {
			const hero_title = extract_plain_text(node.title);
			if (!fallback_title && hero_title) {
				fallback_title = hero_title;
			}

			const hero_description = extract_plain_text(node.description);
			if (!fallback_description && hero_description) {
				fallback_description = hero_description;
			}
		}

		if (node.type === 'link_collection_item') {
			const item_title = extract_plain_text(node.title);
			if (!fallback_title && item_title) {
				fallback_title = item_title;
			}

			const item_description = extract_plain_text(node.description);
			if (!fallback_description && item_description) {
				fallback_description = item_description;
			}
		}
	}

	return {
		title: explicit_title || heading_title || fallback_title || 'Untitled page',
		description: explicit_description || fallback_description || null,
		preview_media_node: first_image_node || first_video_node
	};
}

/**
 * @param {{ document_id: string, nodes: Record<string, any> } | null | undefined} page_doc
 * @returns {PageMetadata}
 */
export function get_head_metadata(page_doc) {
	return extract_page_metadata(page_doc);
}