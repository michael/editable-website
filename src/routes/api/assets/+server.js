import { json, error } from '@sveltejs/kit';
import { asset_exists, write_asset, delete_asset } from '$lib/server/asset-storage.js';

/** Map content types to stored file extensions */
const CONTENT_TYPE_TO_EXT = {
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/svg+xml': 'svg'
};

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const content_type_raw = request.headers.get('content-type') ?? '';
	const content_type = content_type_raw.split(';')[0].trim().toLowerCase();

	const ext = CONTENT_TYPE_TO_EXT[content_type];
	if (!ext) {
		error(400, `Unsupported content type: ${content_type}. Expected image/webp, image/gif, or image/svg+xml.`);
	}

	const hash = request.headers.get('x-content-hash');
	if (!hash || !/^[a-f0-9]{64}$/.test(hash)) {
		error(400, 'Missing or invalid X-Content-Hash header (expected SHA-256 hex)');
	}

	const width = parseInt(request.headers.get('x-asset-width') ?? '', 10);
	const height = parseInt(request.headers.get('x-asset-height') ?? '', 10);
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
		error(400, 'Missing or invalid X-Asset-Width / X-Asset-Height headers');
	}

	const asset_id = `${hash}.${ext}`;

	// Deduplication: if the file already exists, skip the upload
	if (asset_exists(asset_id)) {
		// Drain the request body without buffering
		if (request.body) {
			const reader = request.body.getReader();
			while (!(await reader.read()).done) { /* drain */ }
		}

		return json({ asset_id, width, height, deduplicated: true });
	}

	if (!request.body) {
		error(400, 'Empty request body');
	}

	// Stream the request body directly to disk
	let bytes_written;
	try {
		bytes_written = await write_asset(asset_id, request.body);
	} catch (err) {
		await delete_asset(asset_id).catch(() => {});
		console.error('Failed to write asset to disk:', err);
		error(500, 'Failed to store asset');
	}

	if (bytes_written === 0) {
		await delete_asset(asset_id).catch(() => {});
		error(400, 'Empty file');
	}

	return json({ asset_id, width, height, deduplicated: false });
}