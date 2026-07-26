import { error } from '@sveltejs/kit';
import { Readable } from 'node:stream';
import { existsSync } from 'node:fs';
import { extname } from 'node:path';
import { EXT_TO_MIME } from '#lib/config.js';
import {
	asset_exists,
	asset_size,
	create_asset_read_stream,
	create_variant_read_stream,
	variant_path
} from '#lib/server/asset_storage.js';
import type { RequestHandler } from './$types';

// Served assets are user-uploaded content. `nosniff` prevents a payload from
// being interpreted as a different, executable type. Directly-opened images
// additionally get `sandbox` so active formats such as SVG cannot run code
// against the site. Do not sandbox videos: Chromium's built-in media document
// becomes an opaque origin and then blocks its own byte-range requests via
// CORS, making otherwise valid MP4/WebM files unplayable in a new tab.
const NO_SNIFF_HEADERS = {
	'X-Content-Type-Options': 'nosniff'
};

const INERT_CONTENT_HEADERS = {
	'Content-Security-Policy': 'sandbox',
	...NO_SNIFF_HEADERS
};

/** Extensions a variant's original can have (variants exist only for images). */
const IMAGE_EXTS = Object.keys(EXT_TO_MIME).filter((ext) => EXT_TO_MIME[ext].startsWith('image/'));

/**
 * Convert a Node.js Readable stream to a Web ReadableStream.
 */
function to_web_stream(node_stream: Readable): ReadableStream<Uint8Array> {
	return Readable.toWeb(node_stream) as ReadableStream<Uint8Array>;
}

/**
 * Extract the first 8 hex characters from an asset id for Content-Disposition filename.
 */
function short_filename(asset_id: string, ext: string): string {
	return `${asset_id.slice(0, 8)}${ext}`;
}

/**
 * Parse a single HTTP byte range header.
 */
function parse_byte_range(
	range_header: string | null,
	size: number
): { start: number; end: number } | null {
	if (!range_header) return null;

	const match = range_header.trim().match(/^bytes=(\d*)-(\d*)$/);
	if (!match) return null;

	const start_str = match[1];
	const end_str = match[2];

	// Suffix range: bytes=-500
	if (!start_str && end_str) {
		const suffix_length = Number(end_str);
		if (!Number.isInteger(suffix_length) || suffix_length <= 0) return null;
		const start = Math.max(size - suffix_length, 0);
		return { start, end: size - 1 };
	}

	if (!start_str) return null;

	const start = Number(start_str);
	if (!Number.isInteger(start) || start < 0 || start >= size) return null;

	let end = size - 1;
	if (end_str) {
		end = Number(end_str);
		if (!Number.isInteger(end) || end < start) return null;
		end = Math.min(end, size - 1);
	}

	return { start, end };
}

export const GET: RequestHandler = async ({ params, request }) => {
	const path = params.path;

	if (!path) {
		error(400, 'Missing asset path');
	}

	// Variant request: {stem}/w{width}.webp
	const variant_match = path.match(/^([a-f0-9]{64})\/w(\d+)\.webp$/);
	if (variant_match) {
		const asset_stem = variant_match[1];
		const width = parseInt(variant_match[2], 10);

		// Find the original asset id by checking known image extensions
		let original_id: string | null = null;
		for (const ext of IMAGE_EXTS) {
			if (asset_exists(`${asset_stem}.${ext}`)) {
				original_id = `${asset_stem}.${ext}`;
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
				...INERT_CONTENT_HEADERS,
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
	const mime_type = EXT_TO_MIME[ext.slice(1)] || 'application/octet-stream';
	const size = await asset_size(asset_id);
	const range_header = request.headers.get('range');
	const is_video = mime_type.startsWith('video/');
	const byte_range = is_video ? parse_byte_range(range_header, size) : null;

	const headers: Record<string, string> = {
		...(is_video ? NO_SNIFF_HEADERS : INERT_CONTENT_HEADERS),
		'Content-Type': mime_type,
		'Cache-Control': 'public, max-age=31536000, immutable',
		'Content-Disposition': `inline; filename="${short_filename(asset_id, ext)}"`
	};

	// Video files need range request support for seeking
	if (is_video) {
		headers['Accept-Ranges'] = 'bytes';
	}

	if (range_header && is_video) {
		if (!byte_range) {
			return new Response(null, {
				status: 416,
				headers: {
					...headers,
					'Content-Range': `bytes */${size}`
				}
			});
		}

		const { start, end } = byte_range;
		const stream = create_asset_read_stream(asset_id, { start, end });
		const partial_size = end - start + 1;

		return new Response(to_web_stream(stream), {
			status: 206,
			headers: {
				...headers,
				'Content-Length': String(partial_size),
				'Content-Range': `bytes ${start}-${end}/${size}`
			}
		});
	}

	const stream = create_asset_read_stream(asset_id);
	return new Response(to_web_stream(stream), {
		headers: {
			...headers,
			'Content-Length': String(size)
		}
	});
};
