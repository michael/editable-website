import { ASSET_BASE, ASSET_ID_REGEX, VARIANT_WIDTHS_SET } from '$lib/config.js';
import { collect_node_ids_in_order } from '$lib/document_graph.js';

// Shared helpers for deriving page and site metadata from documents.
//
// Derivation rules (explicit values always win):
// - title: page.title → first heading → first paragraph-like text
// - description: page.description → first paragraph-like text that didn't supply the title
// - preview media: page.image (when saved) → first image → first video
// - favicon: the home page's page.image (pick a square logo there)
//
// Derived titles/descriptions may be empty strings — callers decide on
// presentation fallbacks like 'Untitled page'.

const TITLE_NODE_TYPES = ['heading_1', 'heading_2', 'heading_3', 'heading_4', 'heading_5'];
const DESCRIPTION_NODE_TYPES = [
	'paragraph_sm',
	'paragraph',
	'paragraph_lg',
	'paragraph_xl',
	'list_item'
];

/** Width of the resized variant used for social preview images (og:image). */
export const SOCIAL_IMAGE_WIDTH = 1536;

/** Width of the resized variant used for the favicon. */
export const FAVICON_WIDTH = 320;

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
 * @typedef {Object} SocialImage
 * @property {string} url
 * @property {number | null} width
 * @property {number | null} height
 * @property {string} alt
 */

/**
 * @typedef {Object} SiteMetadata
 * @property {{ href: string, type: string | null } | null} favicon
 */

/**
 * @param {{ content?: string } | null | undefined} text
 * @returns {string}
 */
export function extract_plain_text(text) {
	if (!text || typeof text.content !== 'string') return '';
	return text.content.trim();
}

/**
 * @param {PreviewMediaNode | null | undefined} media_node
 * @returns {boolean}
 */
function is_saved_media(media_node) {
	return !!media_node?.src && !media_node.src.startsWith('blob:');
}

/**
 * Resized variants exist only for saved raster images (not SVGs, not GIFs).
 *
 * @param {PreviewMediaNode} media_node
 * @returns {boolean}
 */
function has_variants(media_node) {
	if (!ASSET_ID_REGEX.test(media_node.src)) return false;
	const mime_type = media_node.mime_type;
	if (mime_type) return mime_type !== 'image/svg+xml' && mime_type !== 'image/gif';
	return !media_node.src.endsWith('.svg') && !media_node.src.endsWith('.gif');
}

/**
 * Resolve the asset URL for a media node, preferring a resized variant when
 * one exists for the given target width.
 *
 * @param {PreviewMediaNode | null | undefined} media_node
 * @param {number} [target_width]
 * @returns {string | null}
 */
export function get_media_asset_url(media_node, target_width) {
	if (!is_saved_media(media_node)) return null;

	const node = /** @type {PreviewMediaNode} */ (media_node);

	if (
		target_width &&
		VARIANT_WIDTHS_SET.has(target_width) &&
		node.width > target_width &&
		has_variants(node)
	) {
		const asset_stem = node.src.slice(0, node.src.lastIndexOf('.'));
		return `${ASSET_BASE}/${asset_stem}/w${target_width}.webp`;
	}

	return `${ASSET_BASE}/${node.src}`;
}

/**
 * Resolve the social preview image (og:image) for a preview media node.
 * Videos are skipped — social cards need a raster image.
 *
 * @param {PreviewMediaNode | null | undefined} media_node
 * @returns {SocialImage | null}
 */
export function get_social_image(media_node) {
	if (media_node?.type !== 'image' || !is_saved_media(media_node)) return null;

	const url = get_media_asset_url(media_node, SOCIAL_IMAGE_WIDTH);
	if (!url) return null;

	const is_variant = url !== `${ASSET_BASE}/${media_node.src}`;
	const width = is_variant ? SOCIAL_IMAGE_WIDTH : media_node.width || null;
	const height = is_variant
		? Math.round((SOCIAL_IMAGE_WIDTH * media_node.height) / media_node.width)
		: media_node.height || null;

	return {
		url,
		width,
		height,
		alt: media_node.alt || ''
	};
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

	if (!page_root?.body?.nodes) {
		return [page_doc.document_id];
	}

	const body_node_ids = [page_doc.document_id];
	const seen_ids = new Set(body_node_ids);

	for (const child_id of page_root.body.nodes) {
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
		return { title: '', description: null, preview_media_node: null };
	}

	const page_root = page_doc.nodes[page_doc.document_id];
	const explicit_title = extract_plain_text(page_root?.title);
	const explicit_description = extract_plain_text(page_root?.description);
	const explicit_image_node =
		typeof page_root?.image === 'string' ? (page_doc.nodes[page_root.image] ?? null) : null;

	let heading_title = '';
	let text_title = '';
	let text_title_node_id = null;
	let first_image_node = null;
	let first_video_node = null;

	/** @type {Array<{ node_id: string, text: string }>} */
	const description_candidates = [];

	for (const node_id of collect_page_body_node_ids(page_doc)) {
		const node = page_doc.nodes[node_id];
		if (!node) continue;

		if (!first_image_node && node.type === 'image') {
			first_image_node = node;
		} else if (!first_video_node && node.type === 'video') {
			first_video_node = node;
		}

		if (!heading_title && TITLE_NODE_TYPES.includes(node.type)) {
			heading_title = extract_plain_text(node.content);
		}

		if (DESCRIPTION_NODE_TYPES.includes(node.type)) {
			const text = extract_plain_text(node.content);
			if (!text) continue;

			if (!text_title) {
				text_title = text;
				text_title_node_id = node_id;
			}

			if (description_candidates.length < 2) {
				description_candidates.push({ node_id, text });
			}
		}
	}

	const title = explicit_title || heading_title || text_title;

	// The description must not repeat the node that supplied the derived title.
	const title_source_node_id = !explicit_title && !heading_title ? text_title_node_id : null;
	const derived_description =
		description_candidates.find((candidate) => candidate.node_id !== title_source_node_id)?.text ??
		'';

	const preview_media_node = is_saved_media(explicit_image_node)
		? explicit_image_node
		: first_image_node || first_video_node;

	return {
		title,
		description: explicit_description || derived_description || null,
		preview_media_node
	};
}

/**
 * Derive site-level metadata from the home page document. The favicon is the
 * home page's explicit page.image — by convention a square logo.
 *
 * @param {{ document_id: string, nodes: Record<string, any> } | null | undefined} home_page_doc
 * @returns {SiteMetadata}
 */
export function extract_site_metadata(home_page_doc) {
	const page_root = home_page_doc?.nodes?.[home_page_doc.document_id];
	const image_node =
		typeof page_root?.image === 'string' ? home_page_doc.nodes[page_root.image] : null;
	const favicon_media_node = image_node?.type === 'image' ? image_node : null;
	const favicon_href = get_media_asset_url(favicon_media_node, FAVICON_WIDTH);

	if (!favicon_media_node || !favicon_href) {
		return { favicon: null };
	}

	const is_variant = favicon_href !== `${ASSET_BASE}/${favicon_media_node.src}`;

	return {
		favicon: {
			href: favicon_href,
			type: is_variant ? 'image/webp' : favicon_media_node.mime_type || null
		}
	};
}
