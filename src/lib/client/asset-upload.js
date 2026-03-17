import { process_asset } from './process-asset.js';
import { MAX_IMAGE_WIDTH } from '$lib/asset-config.js';

/**
 * @typedef {{
 *   hash: string,
 *   asset_id: string,
 *   original: { blob: Blob, width: number, height: number },
 *   variants: Array<{ width: number, blob: Blob }>,
 *   status: 'processing' | 'ready' | 'error',
 *   error: string | null
 * }} PendingAsset
 */

/**
 * Map of blob URL → PendingAsset. Populated when images are pasted/dropped,
 * consulted during the save flow to upload and replace blob URLs.
 *
 * @type {Map<string, PendingAsset>}
 */
const pending_assets = new Map();

/**
 * Compute SHA-256 hex hash of a Blob.
 *
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
async function hash_blob(blob) {
	const buffer = await blob.arrayBuffer();
	const hash_buffer = await crypto.subtle.digest('SHA-256', buffer);
	const hash_array = Array.from(new Uint8Array(hash_buffer));
	return hash_array.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Detect whether a GIF file is animated by counting Graphic Control Extension blocks.
 *
 * @param {File} file
 * @returns {Promise<boolean>}
 */
async function is_animated_gif(file) {
	if (file.type !== 'image/gif') return false;
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	let count = 0;
	for (let i = 0; i < bytes.length - 1; i++) {
		if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9) {
			count++;
			if (count > 1) return true;
		}
	}
	return false;
}

/**
 * Extract image dimensions using an <img> element.
 *
 * @param {Blob} blob
 * @returns {Promise<{ width: number, height: number }>}
 */
function get_image_dimensions(blob) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const object_url = URL.createObjectURL(blob);

		img.onload = () => {
			URL.revokeObjectURL(object_url);
			resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(object_url);
			reject(new Error('Failed to load image'));
		};

		img.src = object_url;
	});
}

/**
 * Extract video dimensions using a temporary <video> element.
 *
 * @param {Blob} blob
 * @returns {Promise<{ width: number, height: number }>}
 */
function get_video_dimensions(blob) {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		const object_url = URL.createObjectURL(blob);

		video.onloadedmetadata = () => {
			URL.revokeObjectURL(object_url);
			resolve({ width: video.videoWidth, height: video.videoHeight });
		};

		video.onerror = () => {
			URL.revokeObjectURL(object_url);
			reject(new Error('Failed to load video metadata'));
		};

		video.src = object_url;
	});
}

/**
 * Determine the stored file extension for a given file.
 *
 * @param {File} file
 * @param {boolean} animated
 * @returns {string}
 */
function get_stored_extension(file, animated) {
	if (file.type === 'image/svg+xml') return 'svg';
	if (file.type === 'image/gif' && animated) return 'gif';
	// All other raster images get converted to WebP
	return 'webp';
}

/**
 * Check if a file is a video based on MIME type.
 *
 * @param {File} file
 * @returns {boolean}
 */
function is_video(file) {
	return file.type.startsWith('video/');
}

/**
 * Get the stored file extension for a video file.
 *
 * @param {File} file
 * @returns {string}
 */
function get_video_extension(file) {
	if (file.type === 'video/webm') return 'webm';
	return 'mp4';
}

/**
 * Start background processing for a pasted/dropped media file.
 * Call this from handle_media_paste. The blob_url is used as the key
 * to look up the processing result during the save flow.
 *
 * @param {string} blob_url - The blob: URL set as the image node's src
 * @param {File} file - The original source file
 */
export async function start_processing(blob_url, file) {
	/** @type {PendingAsset} */
	const entry = {
		hash: '',
		asset_id: '',
		original: { blob: file, width: 0, height: 0 },
		variants: [],
		status: 'processing',
		error: null
	};
	pending_assets.set(blob_url, entry);

	if (is_video(file)) {
		try {
			const [hash, dims] = await Promise.all([
				hash_blob(file),
				get_video_dimensions(file)
			]);
			const ext = get_video_extension(file);
			entry.hash = hash;
			entry.asset_id = `${hash}.${ext}`;
			entry.original = { blob: file, width: dims.width, height: dims.height };
			entry.variants = [];
			entry.status = 'ready';
		} catch (err) {
			entry.status = 'error';
			entry.error = err instanceof Error ? err.message : 'Video processing failed';
			console.error(`Video processing failed for ${blob_url}:`, err);
		}
		return;
	}

	try {
		// Hash and type detection run concurrently with processing
		const is_svg = file.type === 'image/svg+xml';
		const animated = await is_animated_gif(file);
		const ext = get_stored_extension(file, animated);
		const hash = await hash_blob(file);

		entry.hash = hash;
		entry.asset_id = `${hash}.${ext}`;

		if (is_svg || animated) {
			// Passthrough — no WASM processing
			const dims = await get_image_dimensions(file);
			entry.original = { blob: file, width: dims.width, height: dims.height };
			entry.variants = [];
		} else {
			// Static raster image — process via WASM worker
			const result = await process_asset(file);
			entry.original = result.original;
			entry.variants = result.variants;
		}

		entry.status = 'ready';
	} catch (err) {
		entry.status = 'error';
		entry.error = err instanceof Error ? err.message : 'Processing failed';
		console.error(`Asset processing failed for ${blob_url}:`, err);
	}
}

/**
 * Check if there are any assets still being processed.
 *
 * @returns {boolean}
 */
export function has_pending_processing() {
	for (const entry of pending_assets.values()) {
		if (entry.status === 'processing') return true;
	}
	return false;
}

/**
 * @callback ProcessingProgressCallback
 * @param {{ done: number, total: number }} progress
 */

/**
 * Wait until all pending assets have finished processing.
 *
 * @param {ProcessingProgressCallback} [on_progress] - optional progress callback
 * @returns {Promise<void>}
 */
export async function wait_for_processing(on_progress) {
	while (has_pending_processing()) {
		if (on_progress) {
			let done = 0;
			let total = 0;
			for (const entry of pending_assets.values()) {
				total++;
				if (entry.status !== 'processing') done++;
			}
			on_progress({ done, total });
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
}

/**
 * Upload a blob using XHR with progress tracking.
 *
 * @param {string} url
 * @param {Blob} blob
 * @param {Record<string, string>} headers
 * @param {(progress: number) => void} [on_progress]
 * @returns {Promise<any>}
 */
function upload_blob(url, blob, headers, on_progress) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		if (on_progress) {
			xhr.upload.addEventListener('progress', (e) => {
				if (e.lengthComputable) {
					on_progress(Math.round((e.loaded / e.total) * 100));
				}
			});
		}
		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(JSON.parse(xhr.responseText));
			} else {
				let message = `Upload failed: ${xhr.status}`;
				try {
					const body = JSON.parse(xhr.responseText);
					if (body.message) message = body.message;
				} catch { /* ignore */ }
				reject(new Error(message));
			}
		});
		xhr.addEventListener('error', () => reject(new Error('Upload failed (network error)')));

		xhr.open('POST', url);
		for (const [key, value] of Object.entries(headers)) {
			xhr.setRequestHeader(key, value);
		}
		xhr.send(blob);
	});
}

/**
 * Upload a single asset (original + variants) to the server.
 * Returns the asset_id on success.
 *
 * @param {PendingAsset} entry
 * @returns {Promise<{ asset_id: string, width: number, height: number }>}
 */
async function upload_asset(entry) {
	const content_type = entry.asset_id.endsWith('.svg')
		? 'image/svg+xml'
		: entry.asset_id.endsWith('.gif')
			? 'image/gif'
			: entry.asset_id.endsWith('.mp4')
				? 'video/mp4'
				: entry.asset_id.endsWith('.webm')
					? 'video/webm'
					: 'image/webp';

	// Upload original
	const result = await upload_blob('/api/assets', entry.original.blob, {
		'Content-Type': content_type,
		'X-Content-Hash': entry.hash,
		'X-Asset-Width': String(entry.original.width),
		'X-Asset-Height': String(entry.original.height)
	});

	// If deduplicated, skip variant uploads
	if (result.deduplicated) {
		return { asset_id: result.asset_id, width: entry.original.width, height: entry.original.height };
	}

	// Upload variants sequentially
	for (let i = 0; i < entry.variants.length; i++) {
		const variant = entry.variants[i];
		try {
			await upload_blob(`/api/assets/${result.asset_id}/variants`, variant.blob, {
				'Content-Type': 'image/webp',
				'X-Variant-Width': String(variant.width)
			});
		} catch (err) {
			// Clean up the partially uploaded asset
			try {
				await fetch(`/api/assets/${result.asset_id}`, { method: 'DELETE' });
			} catch { /* best effort cleanup */ }
			throw new Error(`Variant upload failed (w${variant.width}): ${err instanceof Error ? err.message : err}`);
		}
	}

	return { asset_id: result.asset_id, width: entry.original.width, height: entry.original.height };
}

/**
 * @callback UploadProgressCallback
 * @param {{ phase: 'uploading', index: number, total: number }} progress
 */

/**
 * Upload pending assets that are referenced in the document.
 * Only uploads entries whose blob URL appears in the provided list.
 * Throws on the first failure (after cleaning up the failed asset).
 *
 * @param {string[]} blob_urls - blob URLs currently in the document's image nodes
 * @param {UploadProgressCallback} [on_progress] - optional progress callback
 * @returns {Promise<Map<string, { asset_id: string, width: number, height: number }>>}
 */
export async function upload_pending(blob_urls, on_progress) {
	/** @type {Map<string, { asset_id: string, width: number, height: number }>} */
	const mapping = new Map();
	const total = blob_urls.length;

	for (let i = 0; i < blob_urls.length; i++) {
		const blob_url = blob_urls[i];
		const entry = pending_assets.get(blob_url);
		if (!entry) {
			throw new Error(`No pending asset found for ${blob_url}`);
		}
		if (entry.status === 'error') {
			throw new Error(`Asset processing failed: ${entry.error}`);
		}
		if (entry.status !== 'ready') {
			throw new Error('Some assets are still processing');
		}

		if (on_progress) {
			on_progress({ phase: 'uploading', index: i + 1, total });
		}

		const result = await upload_asset(entry);
		mapping.set(blob_url, result);
	}

	return mapping;
}

/**
 * Replace blob URLs in document nodes with asset ids using the upload mapping.
 * Also updates width and height to the processed dimensions.
 *
 * @param {Record<string, any>} nodes - The document's nodes map (mutated in place)
 * @param {Map<string, { asset_id: string, width: number, height: number }>} mapping
 */
export function replace_blob_urls(nodes, mapping) {
	for (const node of Object.values(nodes)) {
		if ((node.type === 'image' || node.type === 'video') && typeof node.src === 'string' && node.src.startsWith('blob:')) {
			const entry = mapping.get(node.src);
			if (entry) {
				node.src = entry.asset_id;
				node.width = entry.width;
				node.height = entry.height;
			}
		}
	}
}

/**
 * Ensure all blob URLs have pending asset entries. For any blob URL
 * that's missing from the map (e.g. after undo brought back blob URLs
 * that were cleaned up after a previous save), re-fetch the blob and
 * restart processing.
 *
 * @param {string[]} blob_urls - blob URLs currently in the document's image nodes
 * @returns {Promise<void>}
 */
export async function ensure_processing(blob_urls) {
	for (const blob_url of blob_urls) {
		if (pending_assets.has(blob_url)) continue;

		// Re-fetch the blob from the still-valid blob URL
		try {
			const response = await fetch(blob_url);
			const blob = await response.blob();
			const fallback_type = blob.type || 'image/png';
			const fallback_name = fallback_type.startsWith('video/') ? 'pasted-video' : 'pasted-image';
			const file = new File([blob], fallback_name, { type: fallback_type });
			start_processing(blob_url, file);
		} catch (err) {
			console.error(`Failed to re-process asset for ${blob_url}:`, err);
			// Create a failed entry so upload_pending will report the error
			pending_assets.set(blob_url, {
				hash: '',
				asset_id: '',
				original: { blob: new Blob(), width: 0, height: 0 },
				variants: [],
				status: 'error',
				error: `Failed to re-fetch blob URL: ${err instanceof Error ? err.message : err}`
			});
		}
	}
}

/**
 * Collect all blob URLs from image nodes in a document.
 *
 * @param {Record<string, any>} nodes
 * @returns {string[]}
 */
export function collect_blob_urls(nodes) {
	const blob_urls = [];
	for (const node of Object.values(nodes)) {
		if ((node.type === 'image' || node.type === 'video') && typeof node.src === 'string' && node.src.startsWith('blob:')) {
			blob_urls.push(node.src);
		}
	}
	return blob_urls;
}

/**
 * Clean up completed entries from the pending map.
 * Call after a successful save.
 *
 * @param {Map<string, { asset_id: string, width: number, height: number }>} mapping
 */
export function cleanup_pending(mapping) {
	for (const blob_url of mapping.keys()) {
		pending_assets.delete(blob_url);
	}
}