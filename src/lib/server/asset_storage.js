import crypto from 'node:crypto';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, readdir, unlink, rm, stat, utimes } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { mkdirSync } from 'node:fs';
import { ASSET_ID_REGEX } from '$lib/config.js';
import { ASSET_GRACE_PERIOD_DAYS, ASSET_PATH } from '$lib/server_config.js';
import { mirror_file } from './s3.js';

// Ensure the asset directory exists on module load
mkdirSync(ASSET_PATH, { recursive: true });

/**
 * Get the full filesystem path for an original asset.
 *
 * @param {string} asset_id - e.g. "c4b519da...fabdb.webp"
 * @returns {string}
 */
export function asset_path(asset_id) {
	return join(ASSET_PATH, asset_id);
}

/**
 * Get the stem (asset id without extension) for building variant paths.
 *
 * @param {string} asset_id
 * @returns {string}
 */
function stem(asset_id) {
	const ext = extname(asset_id);
	return ext ? asset_id.slice(0, -ext.length) : asset_id;
}

/**
 * Get the directory path for an asset's variants.
 *
 * @param {string} asset_id
 * @returns {string}
 */
export function variant_dir(asset_id) {
	return join(ASSET_PATH, stem(asset_id));
}

/**
 * Get the full filesystem path for a width variant.
 *
 * @param {string} asset_id
 * @param {number} width
 * @returns {string}
 */
export function variant_path(asset_id, width) {
	return join(variant_dir(asset_id), `w${width}.webp`);
}

/**
 * Stream a ReadableStream (web), Buffer, or Uint8Array to a file on disk,
 * counting bytes and hashing the content. Size limiting is the deployment's
 * job (BODY_SIZE_LIMIT), enforced by the adapter while streaming.
 *
 * @param {string} file_path
 * @param {ReadableStream | Buffer | Uint8Array} data
 * @returns {Promise<{ bytes_written: number, sha256: string }>}
 */
async function stream_to_file(file_path, data) {
	/** @type {import('node:stream').Readable} */
	let source;

	if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
		source = Readable.from([data]);
	} else {
		source = Readable.fromWeb(/** @type {import('node:stream/web').ReadableStream} */ (data));
	}

	let bytes_written = 0;
	const hash = crypto.createHash('sha256');

	const counter = new Transform({
		transform(chunk, _encoding, callback) {
			bytes_written += chunk.length;
			hash.update(chunk);
			callback(null, chunk);
		}
	});

	const dest = createWriteStream(file_path);
	await pipeline(source, counter, dest);

	return { bytes_written, sha256: hash.digest('hex') };
}

/**
 * Write an original asset to disk, streaming.
 *
 * @param {string} asset_id
 * @param {ReadableStream | Buffer | Uint8Array} data
 * @returns {Promise<{ bytes_written: number, sha256: string }>}
 */
export async function write_asset(asset_id, data) {
	const result = await stream_to_file(asset_path(asset_id), data);
	mirror_file(`assets/${asset_id}`, asset_path(asset_id));
	return result;
}

/**
 * Write a width variant to disk, streaming.
 * Creates the variant directory if needed.
 *
 * @param {string} asset_id
 * @param {number} width
 * @param {ReadableStream | Buffer | Uint8Array} data
 * @returns {Promise<{ bytes_written: number, sha256: string }>}
 */
export async function write_variant(asset_id, width, data) {
	const dir = variant_dir(asset_id);
	await mkdir(dir, { recursive: true });
	const result = await stream_to_file(variant_path(asset_id, width), data);
	mirror_file(`assets/${stem(asset_id)}/w${width}.webp`, variant_path(asset_id, width));
	return result;
}

/**
 * Check if an original asset exists on disk.
 *
 * @param {string} asset_id
 * @returns {boolean}
 */
export function asset_exists(asset_id) {
	return existsSync(asset_path(asset_id));
}

/**
 * Delete an asset and all its variants from disk.
 *
 * @param {string} asset_id
 * @returns {Promise<void>}
 */
export async function delete_asset(asset_id) {
	// Delete the original file
	try {
		await unlink(asset_path(asset_id));
	} catch {
		// File may not exist
	}

	// Delete the variant directory
	const dir = variant_dir(asset_id);
	if (existsSync(dir)) {
		await rm(dir, { recursive: true });
	}
}

/**
 * Create a Node.js ReadStream for an original asset.
 *
 * @param {string} asset_id
 * @param {{ start?: number, end?: number }} [options]
 * @returns {import('node:fs').ReadStream}
 */
export function create_asset_read_stream(asset_id, options = {}) {
	return createReadStream(asset_path(asset_id), options);
}

/**
 * Create a Node.js ReadStream for a width variant.
 *
 * @param {string} asset_id
 * @param {number} width
 * @param {{ start?: number, end?: number }} [options]
 * @returns {import('node:fs').ReadStream}
 */
export function create_variant_read_stream(asset_id, width, options = {}) {
	return createReadStream(variant_path(asset_id, width), options);
}

/**
 * Get the size of an original asset in bytes.
 *
 * @param {string} asset_id
 * @returns {Promise<number>}
 */
export async function asset_size(asset_id) {
	const s = await stat(asset_path(asset_id));
	return s.size;
}

/**
 * An asset's mtime marks when it was uploaded or last dereferenced —
 * touch_asset resets it when the last reference disappears. Unreferenced
 * files are kept for the grace period from that moment, so the period is
 * also the safe window for rolling back a database backup against the live
 * assets folder, and it protects uploads that precede their document save.
 */
const ORPHAN_GRACE_PERIOD_MS = ASSET_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

/**
 * Start the orphan clock for an asset by setting its mtime to now. Called
 * when an asset loses its last reference. Missing files are ignored.
 *
 * @param {string} asset_id
 * @returns {Promise<void>}
 */
export async function touch_asset(asset_id) {
	const now = new Date();
	try {
		await utimes(asset_path(asset_id), now, now);
	} catch {
		// File may not exist (already purged or never uploaded)
	}
}

/**
 * Delete asset files (and their variants) that are no longer referenced by
 * any document.
 *
 * @param {Set<string>} referenced_asset_ids
 * @returns {Promise<number>} number of deleted assets
 */
export async function delete_orphaned_assets(referenced_asset_ids) {
	const entries = await readdir(ASSET_PATH, { withFileTypes: true });
	let deleted = 0;

	for (const entry of entries) {
		if (!entry.isFile() || !ASSET_ID_REGEX.test(entry.name)) continue;
		if (referenced_asset_ids.has(entry.name)) continue;

		const { mtimeMs } = await stat(asset_path(entry.name));
		if (Date.now() - mtimeMs < ORPHAN_GRACE_PERIOD_MS) continue;

		await delete_asset(entry.name);
		deleted += 1;
	}

	return deleted;
}
