import { error } from '@sveltejs/kit';
import { Readable } from 'node:stream';
import { existsSync } from 'node:fs';
import { extname } from 'node:path';
import {
	asset_exists,
	asset_size,
	create_asset_read_stream,
	create_variant_read_stream,
	variant_path
} from '$lib/server/asset_storage.js';

/** Map file extensions to MIME types */
const EXT_TO_MIME = /** @type {Record<string, string>} */ ({
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm'
});

/**
 * Convert a Node.js Readable stream to a Web ReadableStream.
 * @param {import('node:stream').Readable} node_stream
 * @returns {ReadableStream<Uint8Array>}
 */
function to_web_stream(node_stream) {
	return /** @type {ReadableStream<Uint8Array>} */ (Readable.toWeb(node_stream));
}

/**
 * Extract the first 8 hex characters from an asset id for Content-Disposition filename.
 * @param {string} asset_id
 * @param {string} ext
 * @returns {string}
 */
function short_filename(asset_id, ext) {
	return `${asset_id.slice(0, 8)}${ext}`;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const path = params.path;

	if (!path) {
		error(400, 'Missing asset path');
	}

	// Variant request: {stem}/w{width}.webp
	const variant_match = path.match(/^([a-f0-9]{64})\/w(\d+)\.webp$/);
	if (variant_match) {
		const asset_stem = variant_match[1];
		const width = parseInt(variant_match[2], 10);

		// Find the original asset id by checking common extensions
		let original_id = null;
		for (const ext of ['.webp', '.gif', '.svg', '.png', '.jpg', '.jpeg']) {
			if (asset_exists(`${asset_stem}${ext}`)) {
				original_id = `${asset_stem}${ext}`;
				break;
			}
		}

		if (!original_id) {
			error(404, 'Asset not found');
		}

		const vp = variant_path(original_id, width);
		if (!existsSync(vp)) {
			error(404, 'Variant not found');
		}

		const stream = create_variant_read_stream(original_id, width);
		return new Response(to_web_stream(stream), {
			headers: {
				'Content-Type': 'image/webp',
				'Cache-Control': 'public, max-age=31536000, immutable',
				'Content-Disposition': `inline; filename="${short_filename(asset_stem, '.webp')}"`
			}
		});
	}

	// Original request: {hash}.{ext}
	const original_match = path.match(/^([a-f0-9]{64}\.\w+)$/);
	if (!original_match) {
		error(400, 'Invalid asset path');
	}

	const asset_id = original_match[1];

	if (!asset_exists(asset_id)) {
		error(404, 'Asset not found');
	}

	const ext = extname(asset_id);
	const mime_type = EXT_TO_MIME[ext] || 'application/octet-stream';
	const size = await asset_size(asset_id);
	const stream = create_asset_read_stream(asset_id);

	const headers = {
		'Content-Type': mime_type,
		'Content-Length': String(size),
		'Cache-Control': 'public, max-age=31536000, immutable',
		'Content-Disposition': `inline; filename="${short_filename(asset_id, ext)}"`
	};

	// Video files need range request support for seeking
	if (mime_type.startsWith('video/')) {
		headers['Accept-Ranges'] = 'bytes';
	}

	return new Response(to_web_stream(stream), { headers });
}